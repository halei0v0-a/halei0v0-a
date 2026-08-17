/**
 * 音乐播放列表（后台「数据管理 - 音乐播放列表」编辑）
 * cover / url 使用相对路径（如 assets/music/cover/xxx.webp），
 * 音频文件可拖入「数据管理 - 音乐管理」自动复制到 public/assets/music/
 */
export interface MusicItem {
	id: number;
	title: string;
	artist: string;
	cover: string;
	url: string;
	duration: number;
}

export const localMusicList: MusicItem[] = [
	{
		"id": 1,
		"title": "萤萤微光",
		"artist": "泠鸢yousa",
		"cover": "assets/music/cover/OIP-C.webp",
		"url": "assets/music/url/萤萤微光.mp3",
		"duration": 0,
	},
	{
		"title": "羽肿 - Windy Hill",
		"artist": "羽肿",
		"cover": "assets/music/cover/羽肿 - Windy Hill.jpg",
		"url": "assets/music/url/羽肿 - Windy Hill.m4a",
		"id": 2,
	},
	{
		"title": "烟袋斜街 - 接个吻，开一枪",
		"artist": "接个吻，开一枪",
		"cover": "assets/music/cover/烟袋斜街 - 接个吻，开一枪 .jpg",
		"url": "assets/music/url/烟袋斜街 - 接个吻，开一枪 .mp3",
		"id": 3,
	}
];