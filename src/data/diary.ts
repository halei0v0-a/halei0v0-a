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
		id: 1,
		content:
			"哈哈~我的博客诞生啦！欢迎大家来访，希望你们喜欢这里的内容！🎉",
		date: "2025-10-08",
		images: ["/images/diary/start1.jpeg", "/images/diary/start2.jpeg"],
	},
	{
		id: 2,
		content:
			"2025.10.24博客更新到V5.3并部署到了Vercel和Netlify上使用新域名！！🎉但是作者也是同一时间推出了V6.1【莫名其妙Vercel和netlify部署到环境预览会报错，未解决，但好像不影响就不管了】",
		date: "2025-10-24",
		images: ["/images/diary/start3.jpeg", "/images/diary/show1.jpeg"],
	},
	{
		id: 3,
		content: "2025.11.22博客更新到V7.5",
		date: "2025-11-22",
		images: ["/images/diary/7.5更新.png"],
	},
	{
		id: 4,
		content:
			"2026.08.08备用博客部署到Edgeone Pages海外版，多的不说，这坑是真多，光一个部署和添加域名就花了我1小时，然后愣是还要手动点申请域名免费证书，真够无语的，不过好歹是成功了。现在Vercel注册新账号还要手机验证码是我没想到的。Edgeone Pages目前海外版可以只用邮箱注册。",
		date: "2026-08-10",
		images: [
			"https://picture.halei0v0.ccwu.cc/images/Classification/%E4%BA%8C%E6%AC%A1%E5%85%83/2026-04-25%2000-17%20%E3%80%90%E5%93%B2%E9%A3%8E%E5%A3%81%E7%BA%B8%E3%80%91%E5%B9%BB%E6%83%B3%E8%89%BA%E6%9C%AF-%E6%80%A7%E6%84%9F.png",
		],
	},
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
