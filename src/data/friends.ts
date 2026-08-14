// 友情链接数据配置
// 用于管理友情链接页面的数据

export interface FriendItem {
	id: number;
	title: string;
	imgurl: string;
	desc: string;
	siteurl: string;
	tags: string[];
}

// 友情链接数据
export const friendsData: FriendItem[] = [
	{
		"id": 3,
		"title": "halei0v0导航站",
		"imgurl": "https://avatars.githubusercontent.com/u/206404910?v=4",
		"desc": "This  blog guideline ornered by halei, sharing some front-end technology and life bits.",
		"siteurl": "https://halei0v0-a.github.io",
		"tags": [
			"Blog",
		]
	},
	{
		"id": 4,
		"title": "THW's Blog",
		"imgurl": "https://image.tianhw.top/avatar.webp",
		"desc": "前途似海，来日方长",
		"siteurl": "https://blog.tianhw.top",
		"tags": [
			"Blog",
		]
	}
];

// 获取所有友情链接数据
export function getFriendsList(): FriendItem[] {
	return friendsData;
}

// 获取随机排序的友情链接数据
export function getShuffledFriendsList(): FriendItem[] {
	const shuffled = [...friendsData];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
