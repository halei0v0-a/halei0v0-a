/**
 * AI 回复配置（本地后台可编辑，随代码部署到 EdgeOne Pages）
 * 注意：这里只放非敏感配置；密钥（TWIKOO_ADMIN_PASS / AI_ADMIN_KEY）只从环境变量读取
 */
export const aiReplyConfig = {
	/** OpenRouter 模型 ID */
	model: "nvidia/nemotron-3-super-120b-a12b:free",
	/** 回复昵称 */
	nick: "halei0v0博客小助手",
	/** 小助手邮箱（非博主邮箱，避免被标记为站长 master） */
	email: "halei0v0-a@skymail.ink",
	/** 小助手主页（可留空） */
	url: "https://openrouter.ai/collections/free-models",
};
