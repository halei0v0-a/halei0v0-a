/**
 * 赞助打赏方式配置（后台「数据管理 - 赞助-打赏方式」编辑）
 * type: "image" 为扫码打赏（支付宝/微信等），填写 image 二维码图片地址
 * type: "link" 为跳转打赏平台（ko-fi/爱发电等），填写 link 平台地址
 * 图片/链接留空时，页面显示「暂未开放」
 */
export interface SponsorMethod {
	id: number;
	name: string;
	desc: string;
	icon: string;
	type: "image" | "link";
	image?: string;
	link?: string;
}

export const sponsorMethods: SponsorMethod[] = [
	{
		id: 1,
		name: "支付宝",
		desc: "使用 支付宝 扫码打赏",
		icon: "fa7-brands:alipay",
		type: "image",
		image: "",
	},
	{
		id: 2,
		name: "微信",
		desc: "使用 微信 扫码打赏",
		icon: "fa7-brands:weixin",
		type: "image",
		image: "",
	},
	{
		id: 3,
		name: "ko-fi",
		desc: "Buy a Coffee for halei0v0",
		icon: "simple-icons:kofi",
		type: "link",
		link: "",
	},
	{
		id: 4,
		name: "爱发电",
		desc: "通过 爱发电 进行打赏",
		icon: "simple-icons:afdian",
		type: "link",
		link: "",
	},
];