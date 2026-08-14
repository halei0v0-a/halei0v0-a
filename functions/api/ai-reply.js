/**
 * EdgeOne Pages Function：AI 评论自动回复
 * 路由：POST /api/ai-reply
 *
 * 原理：
 * 1. 用 Twikoo 公开 API 拉取最新评论（GET_RECENT_COMMENTS）
 * 2. 对每条候选评论用 COMMENT_GET 检查评论树：跳过站长自己的评论、
 *    已有人回复过的评论、以及 KV 中记录过的评论
 * 3. 调 OpenRouter（env.AI_ADMIN_KEY）生成回复
 * 4. 用管理通道（accessToken = 管理密码明文）以「halei0v0博客小助手」身份提交回复
 *    （小助手使用专用邮箱，不是博主邮箱，因此不会被 Twikoo 标记为站长 master 身份）
 *
 * 环境变量（EdgeOne Pages 控制台配置，密码/Key 用 Secret 类型）：
 *   TWIKOO_ADMIN_PASS    Twikoo 管理密码（必需）
 *   AI_ADMIN_KEY         OpenRouter API Key（必需）
 *   TWIKOO_ENV_ID        Twikoo 服务地址（可选，默认 https://tool.halei0v0.dpdns.org）
 *   SITE_URL             博客站点地址（可选，默认 https://blog.halei0v0.ccwu.cc，用于抓取文章内容）
 *   TWIKOO_REPLY_NICK    回复昵称（可选，默认 halei0v0博客小助手）
 *   TWIKOO_REPLY_EMAIL   小助手邮箱（可选，默认 halei0v0-a@skymail.ink）
 *   OPENROUTER_MODEL     OpenRouter 模型（可选，默认 nvidia/nemotron-3-ultra-550b-a55b:free）
 *   AI_REPLY_MAX         每次最多回复条数（可选，默认 1，OpenRouter 免费额度 50/天 需保守）
 *
 * KV 绑定（可选，推荐）：绑定名为 REPLY_KV
 *   - last_run：上次执行时间戳（30 分钟内不重复执行）
 *   - replied：已回复评论 id 列表（JSON 数组）
 * 未绑定 KV 时降级为：每次都执行，但仅靠评论树判断防重复回复。
 */

const DEFAULT_ENV = "https://tool.halei0v0.dpdns.org";
const DEFAULT_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";
const DEFAULT_NICK = "halei0v0博客小助手";
const DEFAULT_EMAIL = "halei0v0-a@skymail.ink";
const DEFAULT_SITE_URL = "https://blog.halei0v0.ccwu.cc";

export async function onRequest({ request, env }) {
	const cors = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Content-Type": "application/json",
	};
	if (request.method === "OPTIONS") {
		return new Response(null, { status: 204, headers: cors });
	}

	const pass = env.TWIKOO_ADMIN_PASS;
	const apiKey = env.AI_ADMIN_KEY;
	if (!pass || !apiKey) {
		return new Response(
			JSON.stringify({
				ok: false,
				error: "环境变量未配置（需要 TWIKOO_ADMIN_PASS 与 AI_ADMIN_KEY）",
			}),
			{ headers: cors },
		);
	}

	const twikooUrl = env.TWIKOO_ENV_ID || DEFAULT_ENV;
	const siteUrl = env.SITE_URL || DEFAULT_SITE_URL;
	const nick = env.TWIKOO_REPLY_NICK || DEFAULT_NICK;
	const email = env.TWIKOO_REPLY_EMAIL || DEFAULT_EMAIL;
	const model = env.OPENROUTER_MODEL || DEFAULT_MODEL;
	const maxRun = Math.min(
		Math.max(parseInt(env.AI_REPLY_MAX || "1") || 1, 1),
		3,
	);

	try {
		// KV 防抖：30 分钟内只执行一次（可选）
		const kv = env.REPLY_KV || null;
		if (kv) {
			const last = await kv.get("last_run");
			if (last && Date.now() - Number(last) < 30 * 60 * 1000) {
				return new Response(
					JSON.stringify({
						ok: true,
						skipped: true,
						reason: "30 分钟内已执行过",
					}),
					{ headers: cors },
				);
			}
		}

		// 1. 拉取最新主评论（不含回复）
		const recent = await postJson(twikooUrl, {
			event: "GET_RECENT_COMMENTS",
			pageSize: 30,
			includeReply: false,
		});
		const comments =
			(recent && Array.isArray(recent.data) && recent.data) || [];
		if (comments.length === 0) {
			return new Response(JSON.stringify({ ok: true, replied: [] }), {
				headers: cors,
			});
		}

		// 2. 读取已回复记录（KV，可选）
		let repliedIds = [];
		if (kv) {
			try {
				repliedIds = JSON.parse((await kv.get("replied")) || "[]");
			} catch {
				repliedIds = [];
			}
		}

		const results = [];
		let count = 0;

		for (const c of comments) {
			if (count >= maxRun) break;
			if (!c.id || !c.url) continue;
			if (repliedIds.includes(c.id)) continue;

			// 3. 拉该文章完整评论树，判断是否该回复
			const tree = await postJson(twikooUrl, {
				event: "COMMENT_GET",
				url: c.url,
			});
			const treeData =
				(tree && Array.isArray(tree.data) && tree.data) || [];
			const node = treeData.find((n) => n.id === c.id);
			if (!node) continue;
			// 站长自己的评论不回复；已有任何回复的评论不回复
			if (node.master === true) continue;
			if (Array.isArray(node.replies) && node.replies.length > 0)
				continue;

			// 4. 生成回复（附带文章标题与正文摘要，让回复更贴合文章内容）
			const article = await fetchArticleInfo(siteUrl, c.url);
			let prompt = `文章地址：${c.url}`;
			if (article.title) prompt += `\n文章标题：${article.title}`;
			if (article.text) prompt += `\n文章内容摘要：${article.text}`;
			prompt += `\n\n访客「${c.nick}」的评论：${c.commentText || c.comment || ""}\n\n请以站长博客的 AI 小助手「halei0v0博客小助手」的身份回复这条评论，回复内容尽量贴合文章内容。`;
			const reply = await openrouterChat(apiKey, model, prompt);

			// 5. 以「halei0v0博客小助手」身份提交回复（小助手专用邮箱，非博主邮箱）
			const submit = {
				event: "COMMENT_SUBMIT",
				accessToken: pass,
				url: c.url,
				ua: "halei0v0-blog-ai-reply",
				nick,
				mail: email,
				comment: reply,
				pid: c.id,
				rid: c.id,
			};
			const done = await postJson(twikooUrl, submit);
			if (done && done.code) {
				results.push({
					ok: false,
					id: c.id,
					error: `${done.code}: ${done.message || ""}`,
				});
				continue;
			}

			repliedIds.push(c.id);
			results.push({
				ok: true,
				id: c.id,
				nick: c.nick,
				reply: reply.slice(0, 80),
			});
			count++;
		}

		// 6. 持久化已回复记录
		if (kv && results.length) {
			repliedIds = repliedIds.slice(-500);
			await kv.put("replied", JSON.stringify(repliedIds));
			await kv.put("last_run", String(Date.now()));
		}

		return new Response(
			JSON.stringify({
				ok: true,
				replied: results,
				skipped: results.length === 0,
			}),
			{ headers: cors },
		);
	} catch (e) {
		return new Response(
			JSON.stringify({
				ok: false,
				error: String((e && e.message) || e).slice(0, 300),
			}),
			{ headers: cors },
		);
	}
}

/** 抓取文章页面，提取标题与正文纯文本摘要（失败时返回空对象，不影响回复） */
async function fetchArticleInfo(siteUrl, articleUrl) {
	try {
		const url = new URL(articleUrl, siteUrl).toString();
		const res = await fetch(url, {
			headers: { "User-Agent": "halei0v0-blog-ai-reply" },
		});
		if (!res.ok) return {};
		const html = await res.text();

		const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
		const title = titleMatch
			? titleMatch[1].replace(/<[^>]+>/g, "").trim()
			: "";

		// 去脚本/样式/标签，提取正文纯文本
		const text = html
			.replace(/<script[\s\S]*?<\/script>/gi, " ")
			.replace(/<style[\s\S]*?<\/style>/gi, " ")
			.replace(/<nav[\s\S]*?<\/nav>/gi, " ")
			.replace(/<header[\s\S]*?<\/header>/gi, " ")
			.replace(/<footer[\s\S]*?<\/footer>/gi, " ")
			.replace(/<[^>]+>/g, " ")
			.replace(/&nbsp;/gi, " ")
			.replace(/&amp;/gi, "&")
			.replace(/&lt;/gi, "<")
			.replace(/&gt;/gi, ">")
			.replace(/\s+/g, " ")
			.trim()
			.slice(0, 1500);

		return { title, text };
	} catch {
		return {};
	}
}

/** POST JSON 到 Twikoo 服务端 */
async function postJson(url, body) {
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	const text = await res.text();
	try {
		return JSON.parse(text);
	} catch {
		return { code: res.status, message: text.slice(0, 200) };
	}
}

/** 调用 OpenRouter 生成回复 */
async function openrouterChat(apiKey, model, prompt) {
	const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model,
			messages: [
				{
					role: "system",
					content:
						"你是博客「halei0v0博客小助手」，是站长开发的 AI 助手，正在替站长回复访客评论。用自然口语化的中文回复，简洁（一般不超过 80 字），友好热情，不要使用任何 emoji 表情，不要用 Markdown 语法。明确定位为博客小助手，不冒充站长本人，但也不用特意声明自己是 AI（除非访客直接询问），语气像真诚可靠的助手。",
				},
				{ role: "user", content: prompt },
			],
			max_tokens: 200,
		}),
	});
	const text = await res.text();
	let parsed;
	try {
		parsed = JSON.parse(text);
	} catch {
		throw new Error("OpenRouter 响应解析失败: " + text.slice(0, 200));
	}
	if (!res.ok) {
		throw new Error(
			`OpenRouter ${res.status}: ${(parsed.error && parsed.error.message) || text.slice(0, 200)}`,
		);
	}
	const content =
		parsed.choices && parsed.choices[0] && parsed.choices[0].message
			? parsed.choices[0].message.content
			: "";
	if (!content) throw new Error("OpenRouter 未返回内容");
	return String(content).trim();
}
