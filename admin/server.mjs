/**
 * admin/server.mjs
 * 博客本地管理后台（零依赖，仅使用 Node 内置模块）
 *
 * 功能：
 * 1. 开关管理：读取/修改 src/config.ts 与 src/config/commentConfig.ts 中的布尔开关
 * 2. 数据管理：读取/修改 src/data/*.ts 中的数组数据（friends/projects/skills/timeline/anime/devices/diary）
 * 3. 一键构建：调用 pnpm build
 *
 * 启动：node admin/server.mjs（或运行 start-admin.bat）
 */
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { StringDecoder } from "node:string_decoder";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORT = process.env.ADMIN_PORT || 4830;

// ============ 路径 ============
const CONFIG_FILE = path.join(ROOT, "src", "config.ts");
const COMMENT_CONFIG_FILE = path.join(
	ROOT,
	"src",
	"config",
	"commentConfig.ts",
);
const DATA_DIR = path.join(ROOT, "src", "data");
const POSTS_DIR = path.join(ROOT, "src", "content", "posts");
const BACKUP_DIR = path.join(__dirname, "backups");
const DEV_PORT = 4321;

// 子进程状态
let buildProc = null;
let devProc = null;
let devLog = "";
let devUrl = null; // 从日志中解析出的实际预览地址

// 构建历史（持久化文件 admin/build-history.json）
const BUILD_HISTORY_FILE = path.join(__dirname, "build-history.json");
function loadBuildHistory() {
	try {
		const arr = JSON.parse(fs.readFileSync(BUILD_HISTORY_FILE, "utf-8"));
		return Array.isArray(arr) ? arr : [];
	} catch {
		return [];
	}
}

// 递归统计目录字节数
function dirSize(dir) {
	let total = 0;
	try {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const p = path.join(dir, entry.name);
			if (entry.isDirectory()) total += dirSize(p);
			else if (entry.isFile()) total += fs.statSync(p).size;
		}
	} catch {
		/* 忽略 */
	}
	return total;
}

// 数据条目总数（7 个数据文件）
function countDataItems() {
	let total = 0;
	for (const d of DATA_FILES) {
		try {
			const source = readFileSafe(path.join(DATA_DIR, d.file));
			const decl = extractDeclarations(source, d.exportName);
			if (!decl) continue;
			const v = tsLiteralToJson(decl.content);
			total += Array.isArray(v) ? v.length : Object.keys(v).length;
		} catch {
			/* 忽略 */
		}
	}
	return total;
}

// 从日志中解析实际预览端口（Astro 在端口被占用时会自动 +1）
function extractDevUrl(log) {
	const matches = [...log.matchAll(/http:\/\/localhost:\d+\/?/g)];
	return matches.length ? matches[matches.length - 1][0] : null;
}

// 按 UTF-8 字节安全截断日志尾部，避免截断多字节字符产生乱码（�）
function tailLog(log, maxBytes) {
	const buf = Buffer.from(log, "utf8");
	if (buf.length <= maxBytes) return log;
	return buf
		.subarray(buf.length - maxBytes)
		.toString("utf8")
		.replace(/^\uFFFD+/, "");
}

// 剥离 ANSI 颜色/样式转义码，避免浏览器中显示为乱码
function stripAnsi(s) {
	return String(s)
		.replace(/\x1b\][^\x07]*(\x07|\x1b\\)/g, "")
		.replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, "")
		.replace(/\x1b[()][0-9A-Za-z]/g, "")
		.replace(/\x1b[@-Z\\-_]/g, "");
}

// 可编辑的字符串配置白名单（path 精确匹配 或 pathPrefix 前缀匹配多条）
// group: 前端分组展示；type: text | url | textarea
const CONFIG_VALUE_FIELDS = [
	// ---- 站点信息 ----
	{
		file: "config.ts",
		path: "siteConfig.title",
		label: "站点名称",
		group: "站点信息",
		hint: "浏览器标题与页脚显示",
	},
	{
		file: "config.ts",
		path: "siteConfig.subtitle",
		label: "站点副标题",
		group: "站点信息",
		hint: "",
	},
	{
		file: "config.ts",
		path: "siteConfig.siteURL",
		label: "站点地址",
		group: "站点信息",
		hint: "请替换为你的站点URL，以斜杠结尾",
	},
	{
		file: "config.ts",
		path: "siteConfig.siteStartDate",
		label: "开始运行日期",
		group: "站点信息",
		hint: "用于站点统计组件计算运行天数",
	},
	{
		file: "config.ts",
		path: "siteConfig.navbarTitle.text",
		label: "导航栏标题文字",
		group: "站点信息",
		hint: "",
	},
	{
		file: "config.ts",
		path: "siteConfig.aboutLink",
		label: "关于链接",
		group: "站点信息",
		hint: "",
	},

	// ---- 首页横幅 ----
	{
		file: "config.ts",
		path: "siteConfig.banner.homeText.title",
		label: "主页横幅主标题",
		group: "首页横幅",
		hint: "",
	},
	{
		file: "config.ts",
		path: "siteConfig.banner.playerUrl",
		label: "背景视频 URL",
		group: "首页横幅",
		hint: "支持远程视频URL，本地视频请放在 public/assets/videos/",
	},
	{
		file: "config.ts",
		path: "siteConfig.banner.imageApi.url",
		label: "随机图片 API 地址",
		group: "首页横幅",
		hint: "API地址，返回每行一个图片链接的文本",
	},
	{
		file: "config.ts",
		path: "siteConfig.banner.credit.text",
		label: "图片来源文本",
		group: "首页横幅",
		hint: "横幅图片来源的标注文本",
	},
	{
		file: "config.ts",
		path: "siteConfig.banner.credit.url",
		label: "图片来源链接",
		group: "首页横幅",
		hint: "原始艺术品或艺术家页面链接",
	},

	// ---- 个人资料 ----
	{
		file: "config.ts",
		path: "profileConfig.name",
		label: "昵称",
		group: "个人资料",
		hint: "",
	},
	{
		file: "config.ts",
		path: "profileConfig.avatar",
		label: "头像路径",
		group: "个人资料",
		hint: "相对于 /src 目录，以 / 开头则相对于 /public",
	},
	{
		file: "config.ts",
		path: "profileConfig.bio",
		label: "个人简介",
		group: "个人资料",
		hint: "",
	},
	{
		file: "config.ts",
		pathPrefix: "profileConfig.links[].name",
		label: "社交链接名称",
		group: "个人资料",
		hint: "侧栏社交链接（多条）",
	},
	{
		file: "config.ts",
		pathPrefix: "profileConfig.links[].url",
		label: "社交链接地址",
		group: "个人资料",
		hint: "侧栏社交链接（多条）",
	},

	// ---- 公告 ----
	{
		file: "config.ts",
		path: "announcementConfig.title",
		label: "公告标题",
		group: "公告",
		hint: "填空使用 i18n 默认文案",
	},
	{
		file: "config.ts",
		path: "announcementConfig.content",
		label: "公告内容",
		group: "公告",
		hint: "",
		type: "textarea",
	},
	{
		file: "config.ts",
		path: "announcementConfig.link.text",
		label: "公告链接文本",
		group: "公告",
		hint: "",
	},
	{
		file: "config.ts",
		path: "announcementConfig.link.url",
		label: "公告链接地址",
		group: "公告",
		hint: "",
	},

	// ---- 赞助卡片 ----
	{
		file: "config.ts",
		path: "sponsorConfig.image",
		label: "赞助图片地址",
		group: "赞助卡片",
		hint: "二维码/横幅图，留空则显示求赞助文字",
	},
	{
		file: "config.ts",
		path: "sponsorConfig.url",
		label: "赞助链接",
		group: "赞助卡片",
		hint: "留空则不跳转",
	},
	{
		file: "config.ts",
		path: "sponsorConfig.fallbackText",
		label: "求赞助文案",
		group: "赞助卡片",
		hint: "未配置图片时显示",
	},
	{
		file: "config.ts",
		path: "sponsorConfig.subText",
		label: "辅助文案",
		group: "赞助卡片",
		hint: "图片下方或求赞助按钮下方的说明文字",
	},

	// ---- 页脚与版权 ----
	{
		file: "config.ts",
		path: "footerConfig.customHtml",
		label: "自定义页脚 HTML",
		group: "页脚与版权",
		hint: "例如备案号，留空不显示",
		type: "textarea",
	},
	{
		file: "config.ts",
		path: "licenseConfig.name",
		label: "许可协议名称",
		group: "页脚与版权",
		hint: "如 CC BY-NC-SA 4.0",
	},
	{
		file: "config.ts",
		path: "licenseConfig.url",
		label: "许可协议链接",
		group: "页脚与版权",
		hint: "",
	},

	// ---- 评论系统 ----
	{
		file: "commentConfig.ts",
		path: "commentConfig.twikoo.envId",
		label: "Twikoo 服务地址",
		group: "评论系统",
		hint: "Twikoo 部署的云函数/服务地址",
	},
	{
		file: "commentConfig.ts",
		path: "commentConfig.waline.serverURL",
		label: "Waline 服务地址",
		group: "评论系统",
		hint: "Waline 后端 API 地址",
	},
	{
		file: "commentConfig.ts",
		path: "commentConfig.artalk.server",
		label: "Artalk 服务地址",
		group: "评论系统",
		hint: "Artalk 后端 API 地址",
	},

	// ---- 统计与第三方 ----
	{
		file: "config.ts",
		path: "siteConfig.thirdPartyAnalytics.clarityId",
		label: "Clarity 项目 ID",
		group: "统计与第三方",
		hint: "Microsoft Clarity 项目 ID",
	},
	{
		file: "config.ts",
		path: "siteConfig.thirdPartyAnalytics.umami.websiteId",
		label: "Umami 站点 ID",
		group: "统计与第三方",
		hint: "",
	},
	{
		file: "config.ts",
		path: "siteConfig.thirdPartyAnalytics.umami.scriptUrl",
		label: "Umami 脚本地址",
		group: "统计与第三方",
		hint: "",
	},
	{
		file: "config.ts",
		path: "siteConfig.thirdPartyAnalytics.umami.shareUrl",
		label: "Umami 分享链接",
		group: "统计与第三方",
		hint: "统计卡片点击跳转",
	},
	{
		file: "config.ts",
		path: "umamiConfig.baseUrl",
		label: "Umami API 地址",
		group: "统计与第三方",
		hint: "Umami Cloud API地址",
	},
	{
		file: "config.ts",
		path: "siteConfig.bilibili.vmid",
		label: "Bilibili UID",
		group: "统计与第三方",
		hint: "B站数据展示的用户ID",
	},
	{
		file: "config.ts",
		path: "siteConfig.bangumi.userId",
		label: "Bangumi 用户 ID",
		group: "统计与第三方",
		hint: "番剧页面数据来源",
	},

	// ---- 导航栏 ----
	{
		file: "config.ts",
		pathPrefix: "navBarConfig.links[].name",
		label: "导航栏菜单名",
		group: "导航栏",
		hint: "一级菜单（多条）",
	},
	{
		file: "config.ts",
		pathPrefix: "navBarConfig.links[].url",
		label: "导航栏菜单链接",
		group: "导航栏",
		hint: "一级菜单（多条）",
	},
	{
		file: "config.ts",
		pathPrefix: "navBarConfig.links[].children[].name",
		label: "导航栏子菜单名",
		group: "导航栏",
		hint: "下拉子菜单（多条）",
	},
	{
		file: "config.ts",
		pathPrefix: "navBarConfig.links[].children[].url",
		label: "导航栏子菜单链接",
		group: "导航栏",
		hint: "下拉子菜单（多条）",
	},

	// ---- 音乐播放器 ----
	{
		file: "config.ts",
		path: "musicPlayerConfig.id",
		label: "歌单 ID",
		group: "音乐播放器",
		hint: "meting 模式的歌单ID",
	},

	// ---- 看板娘 ----
	{
		file: "config.ts",
		path: "pioConfig.dialog.welcome",
		label: "欢迎词",
		group: "看板娘",
		hint: "",
		type: "textarea",
	},
	{
		file: "config.ts",
		path: "pioConfig.dialog.home",
		label: "首页提示语",
		group: "看板娘",
		hint: "",
		type: "textarea",
	},
	{
		file: "config.ts",
		path: "pioConfig.dialog.close",
		label: "关闭提示语",
		group: "看板娘",
		hint: "",
		type: "textarea",
	},
	{
		file: "config.ts",
		path: "pioConfig.dialog.link",
		label: "关于链接",
		group: "看板娘",
		hint: "",
	},
];

/** 解析配置文件中的字符串字段（key: "value"），返回路径/行号/值/注释 */
function parseStringValues(source) {
	const lines = source.split("\n");
	const values = [];
	const stack = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const indentMatch = line.match(/^(\t*)/);
		const indent = indentMatch ? indentMatch[1].length : 0;
		const trimmed = line.trim();

		if (!trimmed || trimmed.startsWith("//")) {
			continue;
		}
		while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
			stack.pop();
		}
		let m =
			trimmed.match(/^(?:export\s+)?const\s+(\w+)\s*(?::[^=]*)?=\s*\{/) ||
			trimmed.match(/^(\w+):\s*\{/);
		if (m) {
			stack.push({ indent, key: m[1], isArray: false });
			continue;
		}
		m =
			trimmed.match(/^(?:export\s+)?const\s+(\w+)\s*(?::[^=]*)?=\s*\[/) ||
			trimmed.match(/^(\w+):\s*\[/);
		if (m) {
			stack.push({ indent, key: m[1], isArray: true });
			continue;
		}
		m = trimmed.match(
			/^(\w+):\s*"((?:[^"\\]|\\.)*)",?\s*(?:\/\/\s*(.+))?$/,
		);
		if (!m) {
			continue;
		}
		const path = [
			...stack.map((s) => (s.isArray ? `${s.key}[]` : s.key)),
			m[1],
		].join(".");
		values.push({
			line: i,
			path,
			key: m[1],
			// 正则捕获返回源文本，需手动还原转义（\\ \" \n \r \t）
			value: m[2].replace(/\\(["\\nrt])/g, (_, c) =>
				c === "n" ? "\n" : c === "r" ? "\r" : c === "t" ? "\t" : c,
			),
			comment: m[3] ? m[3].trim() : "",
		});
	}
	return values;
}

/** 修改字符串字段值（按行号定位，带内容校验防漂移） */
function setStringValue(source, lineIndex, key, newValue) {
	const lines = source.split("\n");
	const line = lines[lineIndex];
	if (!line) {
		throw new Error(`行 ${lineIndex + 1} 不存在`);
	}
	const re = new RegExp(
		`^(\\t*${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*)"(?:[^"\\\\]|\\\\.)*"(,?\\s*(?:\\/\\/.*)?)$`,
	);
	if (!re.test(line)) {
		throw new Error(`行 ${lineIndex + 1} 内容已变更，请刷新页面后重试`);
	}
	const escaped = newValue
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/\r/g, "\\r")
		.replace(/\n/g, "\\n")
		.replace(/\t/g, "\\t");
	const replaced = line.replace(re, `$1"${escaped}"$2`);
	if (replaced === line) {
		throw new Error(`行 ${lineIndex + 1} 未匹配到目标字段`);
	}
	lines[lineIndex] = replaced;
	return lines.join("\n");
}
function writeFileWithBackup(filePath, content) {
	if (!fs.existsSync(BACKUP_DIR)) {
		fs.mkdirSync(BACKUP_DIR, { recursive: true });
	}
	const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
	const name = path.basename(filePath);
	if (fs.existsSync(filePath)) {
		const backupPath = path.join(BACKUP_DIR, `${name}.${ts}.bak`);
		fs.copyFileSync(filePath, backupPath);
		// 记录备份对应的原文件路径，便于还原
		const m = backupManifest();
		m[`${name}.${ts}.bak`] = path
			.relative(ROOT, filePath)
			.replace(/\\/g, "/");
		saveBackupManifest(m);
	}
	fs.writeFileSync(filePath, content, "utf-8");
}

// ============ 备份管理 ============
const MANIFEST_FILE = path.join(BACKUP_DIR, "manifest.json");

function backupManifest() {
	try {
		const m = JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf-8"));
		return m && typeof m === "object" ? m : {};
	} catch {
		return {};
	}
}

function saveBackupManifest(m) {
	try {
		fs.writeFileSync(MANIFEST_FILE, JSON.stringify(m, null, "\t"), "utf-8");
	} catch {
		/* 忽略 */
	}
}

// 递归复制（fs.cpSync 在中文路径下崩溃，手动实现）
function copyRecursive(src, dst) {
	for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
		const s = path.join(src, entry.name);
		const d = path.join(dst, entry.name);
		if (entry.isDirectory()) {
			fs.mkdirSync(d, { recursive: true });
			copyRecursive(s, d);
		} else {
			fs.copyFileSync(s, d);
		}
	}
}

const BACKUP_TS_RE = /\.\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/;

// 列出全部备份条目（.bak 文件 + .del.* 目录）
function listBackups() {
	if (!fs.existsSync(BACKUP_DIR)) return [];
	const items = fs.readdirSync(BACKUP_DIR, { withFileTypes: true });
	const result = [];
	for (const it of items) {
		if (it.name === "manifest.json") continue;
		const full = path.join(BACKUP_DIR, it.name);
		const kind = it.isDirectory() ? "dir" : "file";
		let original = null;
		let tsText = null;
		if (kind === "file" && it.name.endsWith(".bak")) {
			const stem = it.name.slice(0, -4);
			const m = stem.match(BACKUP_TS_RE);
			if (m) {
				tsText = stem.slice(m.index + 1).replace(/T/, " ").replace(/-/g, ":");
				original = stem.slice(0, m.index);
			} else {
				original = stem;
			}
		} else if (kind === "dir" && it.name.includes(".del.")) {
			const idx = it.name.lastIndexOf(".del.");
			original = it.name.slice(0, idx);
			tsText = it.name
				.slice(idx + 5)
				.replace(/T/, " ")
				.replace(/-/g, ":");
		}
		let stat;
		try {
			stat = fs.statSync(full);
		} catch {
			continue;
		}
		result.push({
			name: it.name,
			kind,
			original,
			tsText,
			size: stat.size,
			time: stat.mtimeMs,
		});
	}
	result.sort((a, b) => b.time - a.time);
	return result;
}

// 解析备份对应的原文件路径：优先 manifest，回退按 basename 猜测
function resolveBackupTarget(backupName, original) {
	const m = backupManifest();
	if (m[backupName]) {
		const rel = m[backupName];
		if (rel && !rel.includes("..")) {
			const p = path.join(ROOT, rel);
			if (fs.existsSync(p)) return p;
		}
	}
	if (!original) return null;
	const candidates = [];
	if (original === path.basename(CONFIG_FILE)) candidates.push(CONFIG_FILE);
	if (original === path.basename(COMMENT_CONFIG_FILE))
		candidates.push(COMMENT_CONFIG_FILE);
	candidates.push(path.join(DATA_DIR, original));
	candidates.push(path.join(POSTS_DIR, original));
	candidates.push(path.join(ROOT, "src", "content", "spec", original));
	candidates.push(path.join(ROOT, "functions", "api", original));
	for (const c of candidates) {
		try {
			if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
		} catch {
			/* 忽略 */
		}
	}
	return null;
}

// 还原目录型备份（文章等），目标存在则先改名保险
async function restoreDirBackup(backupDir, targetDir) {
	if (fs.existsSync(targetDir)) {
		const ts = new Date()
			.toISOString()
			.replace(/[:.]/g, "-")
			.slice(0, 19);
		const pre = path.join(BACKUP_DIR, `${path.basename(targetDir)}.pre.${ts}`);
		fs.mkdirSync(BACKUP_DIR, { recursive: true });
		await fs.promises.rename(targetDir, pre);
	}
	fs.mkdirSync(targetDir, { recursive: true });
	copyRecursive(backupDir, targetDir);
}

// 可管理的数据文件：{ 导出名, 导出类型(数组/对象), 标题 }
const DATA_FILES = [
	{ exportName: "friendsData", title: "友情链接", file: "friends.ts" },
	{ exportName: "projectsData", title: "项目", file: "projects.ts" },
	{ exportName: "skillsData", title: "技能", file: "skills.ts" },
	{ exportName: "timelineData", title: "时间线", file: "timeline.ts" },
	{ exportName: "localAnimeList", title: "番剧列表", file: "anime.ts" },
	{ exportName: "devicesData", title: "设备", file: "devices.ts" },
	{ exportName: "diaryData", title: "日记", file: "diary.ts" },
	{
		exportName: "sponsorMethods",
		title: "赞助-打赏方式",
		file: "sponsor-methods.ts",
	},
	{
		exportName: "sponsorList",
		title: "赞助-打赏记录",
		file: "sponsor-list.ts",
	},
];

/**
 * 数据表单 schema（用于"添加"界面）
 * type: text | url | textarea | number | select | tags | date | boolean | color
 * kind: "map" 表示 devices 这类 Record<string, T[]> 结构
 */
const DATA_SCHEMAS = {
	"friends.ts": {
		kind: "array",
		idField: "id",
		idAuto: true,
		fields: [
			{
				key: "title",
				label: "名称",
				type: "text",
				required: true,
				placeholder: "站点/人名",
			},
			{ key: "imgurl", label: "头像 URL", type: "url", required: true },
			{ key: "desc", label: "描述", type: "textarea", required: true },
			{ key: "siteurl", label: "网站 URL", type: "url", required: true },
			{
				key: "tags",
				label: "标签",
				type: "tags",
				required: true,
				placeholder: "多个用逗号分隔，如: Blog, Docs",
			},
		],
	},
	"projects.ts": {
		kind: "array",
		idField: "id",
		fields: [
			{
				key: "id",
				label: "唯一 ID",
				type: "text",
				required: true,
				placeholder: "英文标识，如 Blog",
			},
			{ key: "title", label: "标题", type: "text", required: true },
			{
				key: "description",
				label: "描述",
				type: "textarea",
				required: true,
			},
			{
				key: "image",
				label: "图片 URL",
				type: "url",
				placeholder: "可留空",
			},
			{
				key: "category",
				label: "分类",
				type: "select",
				required: true,
				options: ["web", "mobile", "desktop", "other"],
			},
			{
				key: "techStack",
				label: "技术栈",
				type: "tags",
				required: true,
				placeholder: "多个用逗号分隔",
			},
			{
				key: "status",
				label: "状态",
				type: "select",
				required: true,
				options: ["completed", "in-progress", "planned"],
			},
			{
				key: "liveDemo",
				label: "在线演示 URL",
				type: "url",
				placeholder: "可留空",
			},
			{
				key: "sourceCode",
				label: "源码 URL",
				type: "url",
				placeholder: "可留空",
			},
			{
				key: "visitUrl",
				label: "访问 URL",
				type: "url",
				placeholder: "可留空",
			},
			{
				key: "startDate",
				label: "开始日期",
				type: "date",
				required: true,
			},
			{
				key: "endDate",
				label: "结束日期",
				type: "date",
				placeholder: "可留空",
			},
			{ key: "featured", label: "精选展示", type: "boolean" },
			{ key: "tags", label: "标签", type: "tags", placeholder: "可留空" },
			{ key: "showImage", label: "显示图片", type: "boolean" },
		],
	},
	"skills.ts": {
		kind: "array",
		idField: "id",
		fields: [
			{
				key: "id",
				label: "唯一 ID",
				type: "text",
				required: true,
				placeholder: "英文标识，如 astro",
			},
			{ key: "name", label: "名称", type: "text", required: true },
			{
				key: "description",
				label: "描述",
				type: "textarea",
				required: true,
			},
			{
				key: "icon",
				label: "图标 (Iconify)",
				type: "text",
				required: true,
				placeholder: "如 mdi:language-javascript",
			},
			{
				key: "category",
				label: "分类",
				type: "select",
				required: true,
				options: ["frontend", "backend", "database", "tools", "other"],
			},
			{
				key: "level",
				label: "熟练度",
				type: "select",
				required: true,
				options: ["beginner", "intermediate", "advanced", "expert"],
			},
			{
				key: "experience.years",
				label: "经验-年",
				type: "number",
				required: true,
			},
			{
				key: "experience.months",
				label: "经验-月",
				type: "number",
				required: true,
			},
			{
				key: "projects",
				label: "关联项目 ID",
				type: "tags",
				placeholder: "可留空",
			},
			{
				key: "certifications",
				label: "证书",
				type: "tags",
				placeholder: "可留空",
			},
			{
				key: "color",
				label: "主题色",
				type: "text",
				placeholder: "如 #3a88edff",
			},
		],
	},
	"timeline.ts": {
		kind: "array",
		idField: "id",
		fields: [
			{
				key: "id",
				label: "唯一 ID",
				type: "text",
				required: true,
				placeholder: "如 初中",
			},
			{ key: "title", label: "标题", type: "text", required: true },
			{
				key: "description",
				label: "描述",
				type: "textarea",
				required: true,
			},
			{
				key: "type",
				label: "类型",
				type: "select",
				required: true,
				options: ["achievement", "education", "career", "milestone"],
			},
			{
				key: "startDate",
				label: "开始日期",
				type: "date",
				required: true,
			},
			{
				key: "skills",
				label: "技能标签",
				type: "tags",
				placeholder: "可留空",
			},
			{
				key: "achievements",
				label: "成就列表",
				type: "textarea",
				placeholder: "每条一行",
			},
			{
				key: "icon",
				label: "图标 (Iconify)",
				type: "text",
				placeholder: "如 mdi:trophy",
			},
			{
				key: "color",
				label: "主题色",
				type: "text",
				placeholder: "如 #3a88edff",
			},
		],
	},
	"anime.ts": {
		kind: "array",
		fields: [
			{ key: "title", label: "标题", type: "text", required: true },
			{
				key: "status",
				label: "状态",
				type: "select",
				required: true,
				options: ["watching", "completed", "planned"],
			},
			{ key: "rating", label: "评分", type: "number", required: true },
			{ key: "cover", label: "封面 URL", type: "url", required: true },
			{
				key: "description",
				label: "描述",
				type: "textarea",
				required: true,
			},
			{
				key: "episodes",
				label: "集数描述",
				type: "text",
				placeholder: "如 12 episodes",
			},
			{ key: "year", label: "年份", type: "text", required: true },
			{ key: "genre", label: "类型标签", type: "tags", required: true },
			{ key: "studio", label: "制作公司", type: "text" },
			{ key: "link", label: "链接 URL", type: "url" },
			{
				key: "progress",
				label: "观看进度",
				type: "number",
				required: true,
			},
			{
				key: "totalEpisodes",
				label: "总集数",
				type: "number",
				required: true,
			},
			{
				key: "startDate",
				label: "开播日期",
				type: "text",
				placeholder: "如 2022-07",
			},
			{
				key: "endDate",
				label: "完结日期",
				type: "text",
				placeholder: "如 2022-09",
			},
		],
	},
	"devices.ts": {
		kind: "map",
		categoryKey: true,
		fields: [
			{ key: "name", label: "名称", type: "text", required: true },
			{ key: "image", label: "图片 URL", type: "url" },
			{
				key: "specs",
				label: "规格",
				type: "text",
				required: true,
				placeholder: "如 GPU / CPU / 内存",
			},
			{ key: "description", label: "描述", type: "textarea" },
			{ key: "link", label: "链接 URL", type: "url" },
		],
	},
	"diary.ts": {
		kind: "array",
		idField: "id",
		idAuto: true,
		fields: [
			{ key: "content", label: "内容", type: "textarea", required: true },
			{ key: "date", label: "日期", type: "date", required: true },
			{
				key: "images",
				label: "图片 URL 列表",
				type: "textarea",
				placeholder: "每行一个 URL，可留空",
			},
		],
	},
	"sponsor-methods.ts": {
		kind: "array",
		idField: "id",
		idAuto: true,
		fields: [
			{
				key: "name",
				label: "名称",
				type: "text",
				required: true,
				placeholder: "如 支付宝 / 微信 / ko-fi",
			},
			{ key: "desc", label: "描述", type: "textarea", required: true },
			{
				key: "icon",
				label: "图标 (Iconify)",
				type: "text",
				placeholder: "如 fa7-brands:alipay / simple-icons:kofi",
			},
			{
				key: "type",
				label: "类型",
				type: "select",
				required: true,
				options: ["image", "link"],
			},
			{
				key: "image",
				label: "收款二维码图片 URL",
				type: "url",
				placeholder: "type=image 时填写，留空显示暂未开放",
			},
			{
				key: "link",
				label: "平台打赏链接",
				type: "url",
				placeholder: "type=link 时填写，留空显示暂未开放",
			},
		],
	},
	"sponsor-list.ts": {
		kind: "array",
		idField: "id",
		idAuto: true,
		fields: [
			{ key: "name", label: "昵称", type: "text", required: true },
			{ key: "avatar", label: "头像 URL", type: "url", required: true },
			{
				key: "amount",
				label: "金额",
				type: "text",
				required: true,
				placeholder: "如 ¥20",
			},
			{ key: "date", label: "打赏时间", type: "date", required: true },
		],
	},
};

// ============ 工具函数 ============
function sendJson(res, status, data) {
	res.writeHead(status, {
		"Content-Type": "application/json; charset=utf-8",
		"Cache-Control": "no-store",
	});
	res.end(JSON.stringify(data, null, 2));
}

function readFileSafe(filePath) {
	return fs.readFileSync(filePath, "utf-8");
}

/**
 * 从 TS 源码中提取某个导出/常量声明的内容
 * 例如：export const friendsData: FriendItem[] = [ ... ];
 * 返回 { start, end, content }，content 为方括号/花括号内的原文
 */
function extractDeclarations(source, exportName) {
	// 匹配 export const xxx 或 const xxx，类型注解可选
	const re = new RegExp(
		`(?:export\\s+)?const\\s+${exportName}\\s*:\\s*[^=]+=\\s*([\\[{])`,
	);
	const match = re.exec(source);
	if (!match) {
		return null;
	}

	const openBracket = match[1];
	const closeBracket = openBracket === "[" ? "]" : "}";
	const contentStart = match.index + match[0].length - 1;

	// 逐字符扫描匹配括号（考虑字符串字面量）
	let depth = 0;
	let inString = null; // null / '"' / "'" / "`"
	let escaped = false;

	for (let i = contentStart; i < source.length; i++) {
		const ch = source[i];

		if (inString) {
			if (escaped) {
				escaped = false;
				continue;
			}
			if (ch === "\\") {
				escaped = true;
				continue;
			}
			if (ch === inString) {
				inString = null;
			}
			continue;
		}

		if (ch === '"' || ch === "'" || ch === "`") {
			inString = ch;
			continue;
		}
		if (ch === openBracket) {
			depth++;
			continue;
		}
		if (ch === closeBracket) {
			depth--;
			if (depth === 0) {
				return {
					start: contentStart,
					end: i + 1, // 包含闭合括号
					content: source.slice(contentStart, i + 1),
				};
			}
		}
	}

	return null;
}

/**
 * 将 TS 数组/对象字面量内容解析为 JSON 值
 * TS 与 JSON 差异：裸键（id: 1）、单引号/反引号字符串、尾逗号、行/块注释
 * 策略：先把字符串与注释替换为占位符 → 对剩余文本做正则转换 → 还原占位符
 */
function tsLiteralToJson(content) {
	// 字符串中的真实控制字符（如 \t）需转义为 JSON 转义序列，
	// 但要保留原有的 \\ 转义前缀（\\\t 表示反斜杠+tab）
	const escapeControlChars = (m) => {
		const c = m[m.length - 1];
		const prefix = m.slice(0, -1);
		switch (c) {
			case "\n":
				return prefix + "\\n";
			case "\t":
				return prefix + "\\t";
			case "\r":
				return prefix + "\\r";
			default:
				return (
					prefix +
					"\\u" +
					c.charCodeAt(0).toString(16).padStart(4, "0")
				);
		}
	};
	const controlRe = /(?<!\\)(?:\\\\)*[\u0000-\u001f\u007f]/g;

	const placeholders = [];
	const protectedText = content.replace(
		/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
		(m) => {
			// 占位符使用 NUL 字符包裹，避免被后续裸键正则误匹配
			const ph = "\x00STR_" + placeholders.length + "\x00";
			if (m.startsWith('"')) {
				placeholders.push(m.replace(controlRe, escapeControlChars));
				return ph;
			}
			if (m.startsWith("'")) {
				placeholders.push(
					JSON.stringify(
						m
							.slice(1, -1)
							.replace(/\\'/g, "'")
							.replace(controlRe, escapeControlChars),
					),
				);
				return ph;
			}
			if (m.startsWith("`")) {
				placeholders.push(JSON.stringify(m.slice(1, -1)));
				return ph;
			}
			return " ".repeat(m.length); // 注释 → 空白
		},
	);

	let text = protectedText;
	// 裸键加双引号：{ id: 1 → { "id": 1 （支持中文键；字符串已占位，不会误伤）
	text = text.replace(
		/([,{\[]\s*)([A-Za-z_$\u4e00-\u9fa5][\w$\u4e00-\u9fa5]*)(\s*:)/g,
		(m, pre, key, post) => pre + '"' + key + '"' + post,
	);
	// 移除尾逗号
	text = text.replace(/,(\s*[\]}])/g, "$1");
	// 一次性还原全部占位符（split/join 避免子串误伤）
	for (let i = 0; i < placeholders.length; i++) {
		text = text.split(`\x00STR_${i}\x00`).join(placeholders[i]);
	}

	return JSON.parse(text);
}

/** JSON 值序列化为 TS 数组/对象字面量（与项目风格一致：tab 缩进、尾逗号） */
function jsonToTsLiteral(value) {
	const json = JSON.stringify(value, null, "\t");
	// JSON 属性行自带逗号；仅对数组/对象的开始行与最后一行做处理
	const lines = json.split("\n");
	let result = "";
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const isLast = i === lines.length - 1;
		const t = line.trim();
		const isBracketLine = /[\]}]$/.test(t) || /[\[{]$/.test(t);
		if (isLast || isBracketLine) {
			result += line + "\n";
		} else if (line.endsWith(",")) {
			result += line + "\n";
		} else {
			result += line + ",\n";
		}
	}
	return result;
}

/** 读取开关配置文件，解析所有布尔开关 */
function parseSwitches(source) {
	const lines = source.split("\n");
	const switches = [];
	// 维护对象路径栈：{ indent, key, isArray }
	const stack = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const indentMatch = line.match(/^(\t*)/);
		const indent = indentMatch ? indentMatch[1].length : 0;
		const trimmed = line.trim();

		// 跳过空行与纯注释行
		if (!trimmed || trimmed.startsWith("//")) {
			continue;
		}

		// 弹出层级 >= 当前行的栈元素（数组元素的字段缩进更深，其数组栈元素会保留）
		while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
			stack.pop();
		}

		// 顶层常量对象：export const xxx: Type = { 或 const xxx = {
		let m =
			trimmed.match(/^(?:export\s+)?const\s+(\w+)\s*(?::[^=]*)?=\s*\{/) ||
			trimmed.match(/^(\w+):\s*\{/);
		if (m) {
			stack.push({ indent, key: m[1], isArray: false });
			continue;
		}

		// 顶层常量数组：export const xxx: Type = [ 或 key: [
		m =
			trimmed.match(/^(?:export\s+)?const\s+(\w+)\s*(?::[^=]*)?=\s*\[/) ||
			trimmed.match(/^(\w+):\s*\[/);
		if (m) {
			stack.push({ indent, key: m[1], isArray: true });
			continue;
		}

		// 布尔开关行：key: true/false, （可带行尾注释）
		m = trimmed.match(/^(\w+):\s*(true|false),?\s*(?:\/\/.*)?$/);
		if (!m) {
			continue;
		}

		const path = [
			...stack.map((s) => (s.isArray ? `${s.key}[]` : s.key)),
			m[1],
		].join(".");
		const commentMatch = line.match(/\/\/\s*(.+)$/);
		let comment = commentMatch ? commentMatch[1].trim() : "";
		// 无行内注释时，回退到上一行紧邻的说明注释
		if (!comment) {
			const prev = lines[i - 1]?.trim();
			if (
				prev &&
				prev.startsWith("//") &&
				!prev.startsWith("// eslint")
			) {
				comment = prev.replace(/^\/\/\s*/, "").trim();
			}
		}
		switches.push({
			line: i, // 0-based
			path,
			key: m[1],
			value: m[2] === "true",
			comment,
		});
	}

	return switches;
}

/** 修改开关值：按行号替换 */
function setSwitch(source, lineIndex, newValue) {
	const lines = source.split("\n");
	const line = lines[lineIndex];
	if (!line) {
		throw new Error(`行 ${lineIndex + 1} 不存在`);
	}
	const replaced = line.replace(
		/:\s*(true|false)/,
		`: ${newValue ? "true" : "false"}`,
	);
	if (replaced === line) {
		throw new Error(`行 ${lineIndex + 1} 未找到布尔值`);
	}
	lines[lineIndex] = replaced;
	return lines.join("\n");
}

// ============ 文章管理 ============
/** 解析 Front Matter（YAML 简单子集：key: value / key: "quoted" / key: [a, b]），返回对象 */
function parseFrontMatter(content) {
	const fm = {};
	if (!content.startsWith("---")) return fm;
	const end = content.indexOf("\n---", 3);
	if (end === -1) return fm;
	const yaml = content.slice(3, end).trim();
	for (const line of yaml.split("\n")) {
		const m = line.match(/^([\w.-]+):\s*(.*)$/);
		if (!m) continue;
		const [, key, raw] = m;
		const v = raw.trim();
		if (!v) continue;
		if (v.startsWith("[") && v.endsWith("]")) {
			fm[key] = v
				.slice(1, -1)
				.split(",")
				.map((s) => s.trim().replace(/^["']|["']$/g, ""))
				.filter(Boolean);
		} else if (v === "true") fm[key] = true;
		else if (v === "false") fm[key] = false;
		else fm[key] = v.replace(/^["']|["']$/g, "");
	}
	return fm;
}

/** 扫描 posts 目录，返回文章元信息列表 */
function listPosts() {
	const posts = [];
	if (!fs.existsSync(POSTS_DIR)) return posts;
	for (const dir of fs.readdirSync(POSTS_DIR, { withFileTypes: true })) {
		if (!dir.isDirectory()) continue;
		const indexMd = path.join(POSTS_DIR, dir.name, "index.md");
		if (!fs.existsSync(indexMd)) continue;
		try {
			const content = fs.readFileSync(indexMd, "utf-8");
			const fm = parseFrontMatter(content);
			// 正文去 front matter 后的纯文本（估算字数）
			const body = content
				.replace(/^---[\s\S]*?\n---\n?/, "")
				.replace(/[#*`>~\-[\]()|_\\]/g, " ");
			posts.push({
				slug: dir.name,
				title: fm.title || dir.name,
				published: fm.published || "",
				updated: fm.updated || "",
				description: fm.description || "",
				image: fm.image || "",
				category: fm.category || "",
				tags: Array.isArray(fm.tags) ? fm.tags : [],
				draft: fm.draft === true,
				pinned: fm.pinned === true,
				chars: body.length,
			});
		} catch {
			/* 忽略单个文件错误 */
		}
	}
	posts.sort((a, b) =>
		String(b.published).localeCompare(String(a.published)),
	);
	return posts;
}

/** 校验文章 slug（目录名），防止路径穿越 */
function safeSlug(slug) {
	if (typeof slug !== "string" || !slug.trim()) return null;
	const name = path.basename(slug.trim());
	if (!name || name === "." || name === ".." || /[\\/]/.test(name))
		return null;
	return name;
}


// ============ AI 小助手配置 ============
// 配置存于 functions/api/ai-reply-config.js（随代码部署到 EdgeOne Pages）
// 密钥（TWIKOO_ADMIN_PASS / AI_ADMIN_KEY）只在云端环境变量中，本地不保存
const AI_REPLY_CONFIG_FILE = path.join(
	ROOT,
	"functions",
	"api",
	"ai-reply-config.js",
);

/** 读取 AI 小助手配置文件 */
function readAiReplyConfig() {
	try {
		const source = fs.readFileSync(AI_REPLY_CONFIG_FILE, "utf-8");
		const extract = (key) => {
			const m = source.match(
				new RegExp(`\\b${key}\\s*:\\s*["'\`]([^"'\`]*)["'\`]`),
			);
			return m ? m[1] : "";
		};
		return {
			model: extract("model") || "nvidia/nemotron-3-super-120b-a12b:free",
			nick: extract("nick") || "",
			email: extract("email") || "",
			url: extract("url") || "",
		};
	} catch {
		return { model: "", nick: "", email: "", url: "" };
	}
}

/** 写入 AI 小助手配置文件（先备份） */
function writeAiReplyConfig({ model, nick, email, url }) {
	const header =
		`/**\n * AI 回复配置（本地后台可编辑，随代码部署到 EdgeOne Pages）\n` +
		` * 注意：这里只放非敏感配置；密钥（TWIKOO_ADMIN_PASS / AI_ADMIN_KEY）只从环境变量读取\n` +
		` */\n` +
		`export const aiReplyConfig = {\n` +
		`\t/** OpenRouter 模型 ID */\n` +
		`\tmodel: ${JSON.stringify(model || "")},\n` +
		`\t/** 回复昵称 */\n` +
		`\tnick: ${JSON.stringify(nick || "")},\n` +
		`\t/** 小助手邮箱（非博主邮箱，避免被标记为站长 master） */\n` +
		`\temail: ${JSON.stringify(email || "")},\n` +
		`\t/** 小助手主页（可留空） */\n` +
		`\turl: ${JSON.stringify(url || "")},\n` +
		`};\n`;
	writeFileWithBackup(AI_REPLY_CONFIG_FILE, header);
}

// ============ API 处理 ============
async function handleApi(req, res, url) {
	const method = req.method;
	const pathname = url.pathname;

	// ---- 获取开关列表 ----
	if (pathname === "/api/switches" && method === "GET") {
		const configSource = readFileSafe(CONFIG_FILE);
		const commentSource = readFileSafe(COMMENT_CONFIG_FILE);
		const configSwitches = parseSwitches(configSource).map((s) => ({
			...s,
			file: "config.ts",
		}));
		const commentSwitches = parseSwitches(commentSource).map((s) => ({
			...s,
			file: "commentConfig.ts",
		}));
		return sendJson(res, 200, {
			ok: true,
			switches: [...configSwitches, ...commentSwitches],
		});
	}

	// ---- 保存开关 ----
	if (pathname === "/api/switches" && method === "POST") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", () => {
			try {
				const { file, line, value } = JSON.parse(body);
				const target =
					file === "commentConfig.ts"
						? COMMENT_CONFIG_FILE
						: CONFIG_FILE;
				const source = readFileSafe(target);
				const updated = setSwitch(source, line, !!value);
				writeFileWithBackup(target, updated);
				sendJson(res, 200, { ok: true });
			} catch (e) {
				sendJson(res, 400, {
					ok: false,
					error: String(e.message || e),
				});
			}
		});
		return;
	}

	// ---- 获取数据 schema（表单定义） ----
	if (pathname === "/api/data/schema" && method === "GET") {
		const list = DATA_FILES.map((d) => ({
			file: d.file,
			title: d.title,
			exportName: d.exportName,
			schema: DATA_SCHEMAS[d.file] || null,
		}));
		return sendJson(res, 200, { ok: true, files: list });
	}

	// ---- 添加数据条目 ----
	if (pathname === "/api/data/add" && method === "POST") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", () => {
			try {
				const { file, categoryName, fields } = JSON.parse(body);
				const meta = DATA_FILES.find((d) => d.file === file);
				const schema = DATA_SCHEMAS[file];
				if (!meta || !schema) {
					return sendJson(res, 404, {
						ok: false,
						error: "未知数据文件",
					});
				}
				const source = readFileSafe(path.join(DATA_DIR, file));
				const decl = extractDeclarations(source, meta.exportName);
				if (!decl) {
					return sendJson(res, 404, {
						ok: false,
						error: `未找到声明 ${meta.exportName}`,
					});
				}
				const data = tsLiteralToJson(decl.content);

				// 构造新条目：处理 id 自增、类型转换
				const buildItem = () => {
					const item = {};
					for (const f of schema.fields) {
						let raw = fields[f.key];
						if (f.type === "boolean") {
							item[f.key] = raw === true || raw === "true";
							continue;
						}
						if (raw === undefined || raw === null || raw === "") {
							continue; // 可选字段留空则不写入
						}
						if (f.type === "tags") {
							item[f.key] = Array.isArray(raw)
								? raw
								: String(raw)
										.split(/[,，\n]/)
										.map((s) => s.trim())
										.filter(Boolean);
							continue;
						}
						if (f.type === "number") {
							item[f.key] = Number(raw);
							continue;
						}
						if (f.key === "achievements" || f.key === "images") {
							item[f.key] = String(raw)
								.split(/\n/)
								.map((s) => s.trim())
								.filter(Boolean);
							continue;
						}
						if (f.key.includes(".")) {
							// 嵌套字段如 experience.years
							const [a, b] = f.key.split(".");
							item[a] = item[a] || {};
							item[a][b] =
								f.type === "number" ? Number(raw) : raw;
							continue;
						}
						item[f.key] = raw;
					}
					// 必填校验
					for (const f of schema.fields) {
						if (
							f.required &&
							(item[f.key] === undefined ||
								item[f.key] === "" ||
								item[f.key] === null)
						) {
							throw new Error(`缺少必填字段: ${f.label}`);
						}
					}
					if (schema.kind === "map") return item;
					// 数组类型：id 处理
					if (schema.idField && schema.idAuto) {
						const maxId = Array.isArray(data)
							? data.reduce(
									(m, it) =>
										Math.max(
											m,
											Number(it[schema.idField]) || 0,
										),
									0,
								)
							: 0;
						item[schema.idField] = maxId + 1;
					}
					return item;
				};

				const item = buildItem();

				if (schema.kind === "map") {
					// devices: Record<string, T[]>
					const name = (categoryName || "").trim();
					if (!name) {
						return sendJson(res, 400, {
							ok: false,
							error: "请选择或填写设备类别",
						});
					}
					if (!data[name]) data[name] = [];
					data[name].push(item);
				} else {
					if (!Array.isArray(data)) {
						return sendJson(res, 400, {
							ok: false,
							error: "数据结构不是数组",
						});
					}
					data.push(item);
				}

				const newContent = jsonToTsLiteral(data);
				const updated =
					source.slice(0, decl.start) +
					newContent.trimEnd() +
					source.slice(decl.end);
				writeFileWithBackup(path.join(DATA_DIR, file), updated);
				sendJson(res, 200, { ok: true, item });
			} catch (e) {
				sendJson(res, 400, {
					ok: false,
					error: String(e.message || e),
				});
			}
		});
		return;
	}

	// ---- 获取可编辑链接/字符串配置 ----
	if (pathname === "/api/values" && method === "GET") {
		const sources = {
			"config.ts": readFileSafe(CONFIG_FILE),
			"commentConfig.ts": readFileSafe(COMMENT_CONFIG_FILE),
		};
		const result = [];
		for (const f of CONFIG_VALUE_FIELDS) {
			const vals = parseStringValues(sources[f.file] || "");
			for (const v of vals) {
				const match =
					(f.path && v.path === f.path) ||
					(f.pathPrefix && v.path.startsWith(f.pathPrefix));
				if (match) {
					result.push({
						...v,
						file: f.file,
						label: f.label,
						hint: f.hint,
						group: f.group || "其他",
						type: f.type || "text",
					});
				}
			}
		}
		return sendJson(res, 200, { ok: true, values: result });
	}

	// ---- 保存链接/字符串配置 ----
	if (pathname === "/api/values" && method === "POST") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", () => {
			try {
				const { file, line, key, value } = JSON.parse(body);
				const target =
					file === "commentConfig.ts"
						? COMMENT_CONFIG_FILE
						: CONFIG_FILE;
				const source = readFileSafe(target);
				const updated = setStringValue(
					source,
					line,
					key,
					String(value ?? ""),
				);
				writeFileWithBackup(target, updated);
				sendJson(res, 200, { ok: true });
			} catch (e) {
				sendJson(res, 400, {
					ok: false,
					error: String(e.message || e),
				});
			}
		});
		return;
	}

	// ---- 获取数据文件列表 ----
	if (
		pathname === "/api/data" &&
		method === "GET" &&
		!url.searchParams.get("file")
	) {
		const list = DATA_FILES.map((d) => ({
			name: d.exportName,
			title: d.title,
			file: d.file,
		}));
		return sendJson(res, 200, { ok: true, files: list });
	}

	// ---- 获取单个数据 ----
	if (
		pathname === "/api/data" &&
		method === "GET" &&
		url.searchParams.get("file")
	) {
		const file = url.searchParams.get("file");
		const meta = DATA_FILES.find((d) => d.file === file);
		if (!meta) {
			return sendJson(res, 404, { ok: false, error: "未知数据文件" });
		}
		try {
			const source = readFileSafe(path.join(DATA_DIR, file));
			const decl = extractDeclarations(source, meta.exportName);
			if (!decl) {
				return sendJson(res, 404, {
					ok: false,
					error: `未找到声明 ${meta.exportName}`,
				});
			}
			const value = tsLiteralToJson(decl.content);
			return sendJson(res, 200, { ok: true, value, type: meta.title });
		} catch (e) {
			return sendJson(res, 400, {
				ok: false,
				error: `解析失败: ${e.message}`,
			});
		}
	}

	// ---- 保存数据 ----
	if (pathname === "/api/data" && method === "POST") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", () => {
			try {
				const { file, value } = JSON.parse(body);
				if (value === null || typeof value !== "object") {
					return sendJson(res, 400, {
						ok: false,
						error: "数据必须是数组或对象",
					});
				}
				const meta = DATA_FILES.find((d) => d.file === file);
				if (!meta) {
					return sendJson(res, 404, {
						ok: false,
						error: "未知数据文件",
					});
				}
				const source = readFileSafe(path.join(DATA_DIR, file));
				const decl = extractDeclarations(source, meta.exportName);
				if (!decl) {
					return sendJson(res, 404, {
						ok: false,
						error: `未找到声明 ${meta.exportName}`,
					});
				}
				const newContent = jsonToTsLiteral(value);
				const updated =
					source.slice(0, decl.start) +
					newContent.trimEnd() +
					source.slice(decl.end);
				writeFileWithBackup(path.join(DATA_DIR, file), updated);
				sendJson(res, 200, { ok: true });
			} catch (e) {
				sendJson(res, 400, {
					ok: false,
					error: String(e.message || e),
				});
			}
		});
		return;
	}

	// ---- 删除数据条目 ----
	if (pathname === "/api/data/delete" && method === "POST") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", () => {
			try {
				const { file, index, categoryName } = JSON.parse(body);
				const meta = DATA_FILES.find((d) => d.file === file);
				const schema = DATA_SCHEMAS[file];
				if (!meta || !schema) {
					return sendJson(res, 404, {
						ok: false,
						error: "未知数据文件",
					});
				}
				if (index === undefined || index < 0) {
					return sendJson(res, 400, {
						ok: false,
						error: "无效的索引",
					});
				}
				const source = readFileSafe(path.join(DATA_DIR, file));
				const decl = extractDeclarations(source, meta.exportName);
				if (!decl) {
					return sendJson(res, 404, {
						ok: false,
						error: `未找到声明 ${meta.exportName}`,
					});
				}
				const data = tsLiteralToJson(decl.content);
				if (schema.kind === "map") {
					const name = (categoryName || "").trim();
					if (!data[name] || !Array.isArray(data[name])) {
						return sendJson(res, 400, {
							ok: false,
							error: "类别不存在",
						});
					}
					if (index >= data[name].length) {
						return sendJson(res, 400, {
							ok: false,
							error: "索引越界",
						});
					}
					data[name].splice(index, 1);
					if (data[name].length === 0) delete data[name];
				} else {
					if (!Array.isArray(data) || index >= data.length) {
						return sendJson(res, 400, {
							ok: false,
							error: "索引越界",
						});
					}
					data.splice(index, 1);
				}
				const newContent = jsonToTsLiteral(data);
				const updated =
					source.slice(0, decl.start) +
					newContent.trimEnd() +
					source.slice(decl.end);
				writeFileWithBackup(path.join(DATA_DIR, file), updated);
				sendJson(res, 200, { ok: true });
			} catch (e) {
				sendJson(res, 400, {
					ok: false,
					error: String(e.message || e),
				});
			}
		});
		return;
	}

	// ---- 一键构建 ----
	if (pathname === "/api/build" && method === "POST") {
		if (buildProc && !buildProc.killed) {
			return sendJson(res, 409, { ok: false, error: "构建已在进行中" });
		}
		const buildStart = Date.now();
		buildProc = spawn("pnpm", ["build"], {
			cwd: ROOT,
			shell: true,
			env: process.env,
		});
		let output = "";
		buildProc.stdout.on("data", (d) => (output += d.toString()));
		buildProc.stderr.on("data", (d) => (output += d.toString()));
		buildProc.on("close", (code) => {
			buildProc = null;
			// 记录构建历史（持久化到 admin/build-history.json）
			const history = loadBuildHistory();
			history.unshift({
				time: new Date().toISOString(),
				ok: code === 0,
				exitCode: code,
				durationMs: Date.now() - buildStart,
			});
			history.length = Math.min(history.length, 10);
			try {
				fs.writeFileSync(
					path.join(__dirname, "build-history.json"),
					JSON.stringify(history, null, "\t"),
					"utf-8",
				);
			} catch (e) {
				/* 忽略 */
			}
			sendJson(res, 200, {
				ok: code === 0,
				exitCode: code,
				output: output.slice(-12000), // 只返回末尾输出
			});
		});
		return;
	}

	// ---- 系统状态 ----
	if (pathname === "/api/status" && method === "GET") {
		const configSource = readFileSafe(CONFIG_FILE);
		const commentSource = readFileSafe(COMMENT_CONFIG_FILE);
		const allSwitches = [
			...parseSwitches(configSource),
			...parseSwitches(commentSource),
		];
		const switchCount = allSwitches.length;
		const backups = fs.existsSync(BACKUP_DIR)
			? fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".bak"))
			: [];
		const distDir = path.join(ROOT, "dist");
		let distSize = 0;
		let distBuiltAt = null;
		if (fs.existsSync(distDir)) {
			distSize = dirSize(distDir);
			try {
				distBuiltAt = fs.statSync(distDir).mtime.toISOString();
			} catch {
				/* 忽略 */
			}
		}
		const siteStart = /siteStartDate:\s*"([\d-]+)"/.exec(configSource);
		let days = null;
		if (siteStart) {
			days = Math.max(
				0,
				Math.floor(
					(Date.now() - Date.parse(siteStart[1])) /
						(24 * 60 * 60 * 1000),
				),
			);
		}
		return sendJson(res, 200, {
			ok: true,
			project: path.basename(ROOT),
			root: ROOT,
			dataFiles: DATA_FILES.length,
			dataItemTotal: countDataItems(),
			switchCount,
			onSwitchCount: allSwitches.filter((s) => s.value).length,
			days,
			distSize,
			distBuiltAt,
			buildHistory: loadBuildHistory(),
			buildRunning: !!buildProc,
			backupCount: backups.length,
			dev: devProc
				? {
						running: true,
						port: extractDevUrl(devLog)
							? new URL(devUrl).port
							: DEV_PORT,
						url: devUrl || `http://localhost:${DEV_PORT}`,
					}
				: { running: false },
		});
	}

	// ---- 备份管理：列表 ----
	if (pathname === "/api/backups" && method === "GET") {
		const backups = listBackups().map((b) => {
			let target = null;
			let exists = false;
			if (b.kind === "file") {
				target = resolveBackupTarget(b.name, b.original);
				exists = !!target;
			} else {
				const rel = backupManifest()[b.name] || "";
				if (rel && !rel.includes("..")) {
					target = rel;
					exists = fs.existsSync(path.join(ROOT, rel));
				} else if (b.original) {
					target = `src/content/posts/${b.original}`;
					exists = fs.existsSync(
						path.join(POSTS_DIR, b.original),
					);
				}
			}
			return { ...b, target, exists };
		});
		return sendJson(res, 200, { ok: true, backups });
	}

	// ---- 备份管理：还原 ----
	if (pathname === "/api/backups/restore" && method === "POST") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", () => {
			try {
				const { name } = JSON.parse(body);
				if (!name || path.basename(name) !== name) {
					return sendJson(res, 400, { ok: false, error: "无效的备份名" });
				}
				const backupPath = path.join(BACKUP_DIR, name);
				if (!fs.existsSync(backupPath)) {
					return sendJson(res, 404, { ok: false, error: "备份不存在" });
				}
				const stat = fs.statSync(backupPath);
				if (stat.isDirectory()) {
					// 目录型备份（文章等）：保留备份，直接复制还原
					const rel = backupManifest()[name];
					const target =
						rel && !rel.includes("..")
							? path.join(ROOT, rel)
							: path.join(POSTS_DIR, name.slice(0, -5));
					if (!target || !target.startsWith(ROOT)) {
						return sendJson(res, 400, { ok: false, error: "无法确定还原位置" });
					}
					fs.promises
						.mkdir(BACKUP_DIR, { recursive: true })
						.then(() => restoreDirBackup(backupPath, target))
						.then(() => sendJson(res, 200, { ok: true, target }))
						.catch((e) =>
							sendJson(res, 400, {
								ok: false,
								error: String(e.message || e),
							}),
						);
					return;
				}
				// 文件型备份
				const entry = listBackups().find((b) => b.name === name);
				const target = resolveBackupTarget(
					name,
					entry && entry.original
						? entry.original
						: path.basename(name, ".bak"),
				);
				if (!target) {
					return sendJson(res, 400, { ok: false, error: "无法确定还原位置" });
				}
				writeFileWithBackup(
					target,
					fs.readFileSync(backupPath, "utf-8"),
				);
				sendJson(res, 200, { ok: true, target });
			} catch (e) {
				sendJson(res, 400, { ok: false, error: String(e.message || e) });
			}
		});
		return;
	}

	// ---- 备份管理：删除 ----
	if (pathname === "/api/backups/delete" && method === "POST") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", () => {
			try {
				const { name } = JSON.parse(body);
				if (!name || path.basename(name) !== name) {
					return sendJson(res, 400, { ok: false, error: "无效的备份名" });
				}
				const backupPath = path.join(BACKUP_DIR, name);
				if (!fs.existsSync(backupPath)) {
					return sendJson(res, 404, { ok: false, error: "备份不存在" });
				}
				const m = backupManifest();
				delete m[name];
				saveBackupManifest(m);
				fs.promises
					.rm(backupPath, { recursive: true, force: true })
					.then(() => sendJson(res, 200, { ok: true }))
					.catch((e) =>
						sendJson(res, 400, {
							ok: false,
							error: String(e.message || e),
						}),
					);
			} catch (e) {
				sendJson(res, 400, { ok: false, error: String(e.message || e) });
			}
		});
		return;
	}

	// ---- dev server 管理 ----
	if (pathname === "/api/dev" && method === "GET") {
		const alive = devProc && !devProc.killed;
		return sendJson(res, 200, {
			ok: true,
			running: !!alive,
			port: extractDevUrl(devLog) ? new URL(devUrl).port : DEV_PORT,
			url: devUrl || `http://localhost:${DEV_PORT}`,
			output: tailLog(devLog, 4000),
		});
	}

	if (pathname === "/api/dev/start" && method === "POST") {
		if (devProc && !devProc.killed) {
			return sendJson(res, 200, {
				ok: true,
				running: true,
				url: devUrl || `http://localhost:${DEV_PORT}`,
			});
		}
		devLog = "";
		devUrl = null;
		const outDecoder = new StringDecoder("utf8");
		const errDecoder = new StringDecoder("utf8");
		devProc = spawn("pnpm", ["dev", "--port", String(DEV_PORT)], {
			cwd: ROOT,
			shell: true,
			env: process.env,
		});
		const onData = (chunk) => {
			devLog += stripAnsi(chunk);
			// 日志中可能输出实际端口（如端口被占用后自动递增）
			const found = extractDevUrl(devLog);
			if (found) devUrl = found;
		};
		devProc.stdout.on("data", (d) => onData(outDecoder.write(d)));
		devProc.stderr.on("data", (d) => onData(errDecoder.write(d)));
		devProc.on("close", () => {
			outDecoder.end();
			errDecoder.end();
			devProc = null;
		});
		setTimeout(() => {
			sendJson(res, 200, {
				ok: true,
				running: true,
				url: devUrl || `http://localhost:${DEV_PORT}`,
			});
		}, 1200);
		return;
	}

	if (pathname === "/api/dev/stop" && method === "POST") {
		if (devProc && !devProc.killed) {
			devProc.kill();
			devProc = null;
		}
		return sendJson(res, 200, { ok: true, running: false });
	}

	// ---- 文章列表 ----
	if (
		pathname === "/api/posts" &&
		method === "GET" &&
		!url.searchParams.get("slug")
	) {
		return sendJson(res, 200, { ok: true, posts: listPosts() });
	}

	// ---- 读取单篇文章 ----
	if (
		pathname === "/api/posts" &&
		method === "GET" &&
		url.searchParams.get("slug")
	) {
		const slug = safeSlug(url.searchParams.get("slug"));
		if (!slug)
			return sendJson(res, 400, { ok: false, error: "无效的文章目录名" });
		const file = path.join(POSTS_DIR, slug, "index.md");
		if (!fs.existsSync(file))
			return sendJson(res, 404, {
				ok: false,
				error: "文章不存在: " + slug,
			});
		try {
			return sendJson(res, 200, {
				ok: true,
				slug,
				content: fs.readFileSync(file, "utf-8"),
			});
		} catch (e) {
			return sendJson(res, 400, {
				ok: false,
				error: String(e.message || e),
			});
		}
	}

	// ---- 保存文章（自动备份原文件） ----
	if (pathname === "/api/posts" && method === "POST") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", () => {
			try {
				const { slug, content } = JSON.parse(body);
				const safe = safeSlug(slug);
				if (!safe)
					return sendJson(res, 400, {
						ok: false,
						error: "无效的文章目录名",
					});
				if (typeof content !== "string")
					return sendJson(res, 400, {
						ok: false,
						error: "内容必须是字符串",
					});
				const dir = path.join(POSTS_DIR, safe);
				const file = path.join(dir, "index.md");
				if (!fs.existsSync(file))
					return sendJson(res, 404, {
						ok: false,
						error: "文章不存在: " + safe,
					});
				writeFileWithBackup(file, content);
				sendJson(res, 200, { ok: true });
			} catch (e) {
				sendJson(res, 400, {
					ok: false,
					error: String(e.message || e),
				});
			}
		});
		return;
	}

	// ---- 新建文章（创建目录 + index.md 模板） ----
	if (pathname === "/api/posts/create" && method === "POST") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", () => {
			try {
				const { title, published } = JSON.parse(body);
				if (!title || !String(title).trim())
					return sendJson(res, 400, {
						ok: false,
						error: "请填写文章标题",
					});
				const today =
					published || new Date().toISOString().split("T")[0];
				// 生成目录名：postN-标题（数字自动递增，标题含中文保留）
				let n = 1;
				for (const p of listPosts()) {
					const m = /^post(\d+)/.exec(p.slug);
					if (m) n = Math.max(n, parseInt(m[1], 10) + 1);
				}
				const clean = String(title)
					.trim()
					.replace(/[\\/:*?"<>|]/g, "")
					.slice(0, 40);
				const slug = `post${n}【${clean}】`;
				const dir = path.join(POSTS_DIR, slug);
				if (fs.existsSync(dir))
					return sendJson(res, 400, {
						ok: false,
						error: "目录已存在: " + slug,
					});
				const template = `---\ntitle: ${JSON.stringify(String(title).trim())}\npublished: ${today}\ndescription: ""\ntags: []\ncategory: 未分类\ndraft: true\n---\n\n# ${String(title).trim()}\n\n`;
				fs.mkdirSync(dir, { recursive: true });
				fs.writeFileSync(path.join(dir, "index.md"), template, "utf-8");
				sendJson(res, 200, { ok: true, slug });
			} catch (e) {
				sendJson(res, 400, {
					ok: false,
					error: String(e.message || e),
				});
			}
		});
		return;
	}

	// ---- 删除文章（备份后删除整个目录） ----
	if (pathname === "/api/posts/delete" && method === "POST") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", () => {
			try {
				const { slug } = JSON.parse(body);
				const safe = safeSlug(slug);
				if (!safe)
					return sendJson(res, 400, {
						ok: false,
						error: "无效的文章目录名",
					});
				const dir = path.join(POSTS_DIR, safe);
				const file = path.join(dir, "index.md");
				if (!fs.existsSync(dir))
					return sendJson(res, 404, {
						ok: false,
						error: "文章不存在: " + safe,
					});
				// 备份 index.md 与目录内全部文件（fs.cpSync 在中文路径下崩溃，手动递归复制）
				if (!fs.existsSync(BACKUP_DIR))
					fs.mkdirSync(BACKUP_DIR, { recursive: true });
				const ts = new Date()
					.toISOString()
					.replace(/[:.]/g, "-")
					.slice(0, 19);
				const backupDir = path.join(BACKUP_DIR, `${safe}.del.${ts}`);
				fs.mkdirSync(backupDir, { recursive: true });
				copyRecursive(dir, backupDir);
				const m = backupManifest();
				m[`${safe}.del.${ts}`] = path
					.relative(ROOT, dir)
					.replace(/\\/g, "/");
				saveBackupManifest(m);
				// fs.rmSync 在中文路径下崩溃（Node 24 Windows bug），改用异步版本
				fs.promises
					.rm(dir, { recursive: true, force: true })
					.then(() => {
						sendJson(res, 200, { ok: true });
					})
					.catch((e) => {
						sendJson(res, 400, {
							ok: false,
							error: String(e.message || e),
						});
					});
			} catch (e) {
				sendJson(res, 400, {
					ok: false,
					error: String(e.message || e),
				});
			}
		});
		return;
	}

	// ---- AI 小助手配置：读取配置文件 ----
	if (pathname === "/api/ai-reply/config" && method === "GET") {
		const cfg = readAiReplyConfig();
		return sendJson(res, 200, { ok: true, ...cfg });
	}

	// ---- AI 小助手配置：保存到配置文件 ----
	if (pathname === "/api/ai-reply/config" && method === "POST") {
		let bodyBuf = "";
		req.on("data", (chunk) => (bodyBuf += chunk));
		req.on("end", () => {
			try {
				const body = bodyBuf ? JSON.parse(bodyBuf) : {};
				const model = String(body.model || "").trim();
				const nick = String(body.nick || "").trim();
				const email = String(body.email || "").trim();
				const url = String(body.url || "").trim();
				writeAiReplyConfig({ model, nick, email, url });
				return sendJson(res, 200, { ok: true });
			} catch (e) {
				sendJson(res, 400, {
					ok: false,
					error: String(e.message || e),
				});
			}
		});
		return;
	}

	sendJson(res, 404, { ok: false, error: "未知 API" });
}

// ============ HTTP 服务 ============
const server = http.createServer((req, res) => {
	const url = new URL(req.url, `http://${req.headers.host}`);

	// API
	if (url.pathname.startsWith("/api/")) {
		return handleApi(req, res, url);
	}

	// 静态页面
	let filePath;
	if (url.pathname === "/") {
		filePath = path.join(__dirname, "index.html");
	} else if (url.pathname === "/logo.png") {
		// 后台左上角图标：使用博客 logo
		filePath = path.join(
			ROOT,
			"public",
			"assets",
			"home",
			"default-logo.png",
		);
	} else {
		filePath = path.join(__dirname, url.pathname);
	}

	fs.readFile(filePath, (err, data) => {
		if (err) {
			res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
			return res.end("Not Found");
		}
		const ext = path.extname(filePath);
		const mime =
			{
				".html": "text/html; charset=utf-8",
				".js": "text/javascript; charset=utf-8",
				".css": "text/css; charset=utf-8",
				".svg": "image/svg+xml",
				".png": "image/png",
				".jpg": "image/jpeg",
				".webp": "image/webp",
				".ico": "image/x-icon",
			}[ext] || "application/octet-stream";
		res.writeHead(200, { "Content-Type": mime });
		res.end(data);
	});
});

server.on("error", (err) => {
	if (err.code === "EADDRINUSE") {
		console.error(`端口 ${PORT} 已被占用，管理后台可能已在运行。`);
		console.error(`请直接访问 http://localhost:${PORT}`);
		console.error(
			`如需重启：先关闭已有实例（结束 node.exe 进程），再重新启动。`,
		);
		process.exit(1);
	}
	throw err;
});

server.listen(PORT, () => {
	console.log("==========================================");
	console.log("  博客管理后台已启动");
	console.log(`  地址: http://localhost:${PORT}`);
	console.log("  按 Ctrl+C 停止服务");
	console.log("==========================================");
});
