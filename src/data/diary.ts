// 日记数据配置
// 用于管理日记页面的数据

export interface DiaryItem {
	id: number;
	content: string;
	date: string;
	images?: string[];
	location?: string;
	mood?: string;
	tags?: string[];
}

// 示例日记数据
const diaryData: DiaryItem[] = [
	{
		"id": 1,
		"content": "哈哈~我的博客诞生啦！欢迎大家来访，希望你们喜欢这里的内容！🎉",
		"date": "2025-10-08",
		"images": [
			"/images/diary/start1.jpeg",
			"/images/diary/start2.jpeg",
		]
	},
	{
		"id": 2,
		"content": "2025.10.24博客更新到V5.3并部署到了Vercel和Netlify上使用新域名！！🎉但是作者也是同一时间推出了V6.1【莫名其妙Vercel和netlify部署到环境预览会报错，未解决，但好像不影响就不管了】",
		"date": "2025-10-24",
		"images": [
			"/images/diary/start3.jpeg",
			"/images/diary/show1.jpeg",
		]
	},
	{
		"id": 3,
		"content": "2025.11.22博客更新到V7.5",
		"date": "2025-11-22",
		"images": [
			"/images/diary/7.5更新.png",
		]
	},
	{
		"id": 4,
		"content": "2026.08.08备用博客部署到Edgeone Pages海外版，多的不说，这坑是真多，光一个部署和添加域名就花了我1小时，然后愣是还要手动点申请域名免费证书，真够无语的，不过好歹是成功了。现在Vercel注册新账号还要手机验证码是我没想到的。Edgeone Pages目前海外版可以只用邮箱注册。",
		"date": "2026-08-10",
		"images": [
			"https://picture.halei0v0.ccwu.cc/images/Classification/%E4%BA%8C%E6%AC%A1%E5%85%83/2026-04-25%2000-17%20%E3%80%90%E5%93%B2%E9%A3%8E%E5%A3%81%E7%BA%B8%E3%80%91%E5%B9%BB%E6%83%B3%E8%89%BA%E6%9C%AF-%E6%80%A7%E6%84%9F.png",
		]
	},
	{
		"content": "博客更新到v2.2.2版本啦~",
		"date": "2026-08-13",
		"images": [
			"https://blogpicture.halei0v0.ccwu.cc/images/Classification/%E4%BA%8C%E6%AC%A1%E5%85%83/2026-04-06%2006-16.png",
		],
		"id": 5,
	},
	{
		"content": "添加赞助小卡片，有没有人来赞助我吖？！",
		"date": "2026-08-14",
		"images": [
			"https://blogpicture.halei0v0.ccwu.cc/images/Classification/%E5%8D%9A%E5%AE%A2/2026-08-14%2011-27%20%E3%80%90%E5%93%B2%E9%A3%8E%E5%A3%81%E7%BA%B8%E3%80%91%E5%8F%A4%E5%BB%BA%E5%86%99%E6%84%8F-%E5%8F%A4%E5%BB%BA%E8%83%8C%E6%99%AF.webp",
		],
		"id": 6,
	},
	{
		"content": "哇咔咔，AI回复评论功能上线啦！！！还在测试阶段~~~快去试试！\n免费版 20次/分钟 和 50次/天大家别干废了。\n用的nemotron-3-ultra-550b-a55b可能会会的慢点。",
		"date": "2026-08-15",
		"id": 7,
	},
	{
		"content": "三角洲新赛季内容给你总结好了：德穆兰入侵，长弓溪谷2.0扩建，新标杆开大战场冲锋艇，钓鱼系统，自建房好友1v1，新干员旅人，黑潮爆破。具体内容如下：|一、德穆兰入侵|新赛季引入全新Boss及入侵事件。玩家在特定对局中将遭遇德穆兰及其麾下部队（含特殊狙击兵单位）的高强度围剿。成功应对入侵并击败Boss后，可开启专属认证箱获取高价值物资回报。|二、长弓溪谷2.0扩建与冲锋艇|长弓溪谷地图进行大规模扩建，新增地下河道等复杂地形。为适配水域作战，战场实装全新标杆载具“冲锋艇”。玩家可驾驶该船只进行快速战术转移，支持多人同乘，改变了原有开阔水域的机动逻辑。|三、钓鱼系统|作为长弓溪谷2.0的配套玩法加入。玩家可在指定水域或船只尾部的专属钓鱼位进行垂钓。钓获的物品可直接转化为对局内的实用物资，兼具战术收益与局内经济价值。|四、自建房好友1v1|新增自定义房间权限。玩家可创建私人对局并邀请好友进行1v1单挑，支持一定程度的规则自定义，主要用于枪法练习、武器后坐力测试或玩家间内部切磋。|五、新干员“旅人”（罗温）|S11赛季上线全新支援型干员“旅人”罗温。其核心机制为与搜救犬“四叶”的战术协同。四叶可先行探查危险点位、干扰敌方视野，并能向前线投递急救物资。当罗温倒地时，四叶可将其拖拽至附近掩体后方创造自救条件，显著提升了支援位的生存率与容错率。|六、黑潮爆破|游戏新���的5v5回合制竞技模式。玩法核心围绕炸弹的安放与拆除展开攻防对抗。该模式并非传统FPS爆破的简单复刻，而是深度保留了本作的干员技能体系与改枪系统，要求玩家在回合经济限制下，结合干员特长进行立体战术博弈。",
		"date": "2026-08-18",
		"id": 8,
	}
];

// 获取日记统计数据
export const getDiaryStats = () => {
	const total = diaryData.length;
	const hasImages = diaryData.filter(
		(item) => item.images && item.images.length > 0,
	).length;
	const hasLocation = diaryData.filter((item) => item.location).length;
	const hasMood = diaryData.filter((item) => item.mood).length;

	return {
		total,
		hasImages,
		hasLocation,
		hasMood,
		imagePercentage: Math.round((hasImages / total) * 100),
		locationPercentage: Math.round((hasLocation / total) * 100),
		moodPercentage: Math.round((hasMood / total) * 100),
	};
};

// 获取日记列表（按时间倒序）
export const getDiaryList = (limit?: number) => {
	const sortedData = [...diaryData].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);

	if (limit && limit > 0) {
		return sortedData.slice(0, limit);
	}

	return sortedData;
};

// 获取最新的日记
export const getLatestDiary = () => {
	return getDiaryList(1)[0];
};

// 根据ID获取日记
export const getDiaryById = (id: number) => {
	return diaryData.find((item) => item.id === id);
};

// 获取包含图片的日记
export const getDiaryWithImages = () => {
	return diaryData.filter((item) => item.images && item.images.length > 0);
};

// 根据标签筛选日记
export const getDiaryByTag = (tag: string) => {
	return diaryData
		.filter((item) => item.tags?.includes(tag))
		.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		);
};

// 获取所有标签
export const getAllTags = () => {
	const tags = new Set<string>();
	diaryData.forEach((item) => {
		if (item.tags) {
			item.tags.forEach((tag) => tags.add(tag));
		}
	});
	return Array.from(tags).sort();
};

export default diaryData;
