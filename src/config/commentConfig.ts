import type { CommentConfig } from "../types/config";

export const commentConfig: CommentConfig = {
	enable: true, // 是否启用评论功能
	type: "twikoo",
	twikoo: {
		envId: "https://tool.halei0v0.dpdns.org",
		lang: "zh-CN",
		visitorCount: true, // 是否显示访客数
		// 本地 JS 优先，如需 CDN 可改为：
		// https://registry.npmmirror.com/twikoo/1.7.14/files/dist/twikoo.min.js（国内推荐）
		// https://cdn.jsdelivr.net/npm/twikoo@1.7.14/dist/twikoo.min.js（国际）
		jsUrl: "/assets/js/twikoo.all.min.js",
		// Twikoo 自定义 CSS 文件地址，为空则不加载
		cssUrl: "/assets/css/twikoo-custom.css",
	},
	waline: {
		serverURL: "https://waline.vercel.app",
		lang: "zh-CN",
		emoji: [
			"https://unpkg.com/@waline/emojis@1.4.0/weibo",
			"https://unpkg.com/@waline/emojis@1.4.0/bilibili",
			"https://unpkg.com/@waline/emojis@1.4.0/bmoji",
		],
		login: "enable",
		visitorCount: true, // 是否显示访客数
	},
	artalk: {
		server: "https://artalk.example.com/",
		locale: "zh-CN",
		visitorCount: true, // 是否显示访客数
	},
	giscus: {
		repo: "your-github-username/your-repo-name",
		repoId: "your-repo-id",
		category: "Announcements",
		categoryId: "your-category-id",
		mapping: "pathname",
		strict: "0",
		reactionsEnabled: "1",
		emitMetadata: "0",
		inputPosition: "top",
		theme: "preferred_color_scheme",
		lang: "zh-CN",
		loading: "lazy",
	},
	disqus: {
		shortname: "halei0v0-a",
	},
};