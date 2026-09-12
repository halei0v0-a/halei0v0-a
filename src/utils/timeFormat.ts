import { siteConfig } from "../config";

/**
 * Format relative time for diary moments
 * @param dateString ISO date string
 * @param minutesAgo text for minutes
 * @param hoursAgo text for hours
 * @param daysAgo text for days
 */
export function formatRelativeTime(
	dateString: string,
	minutesAgo: string,
	hoursAgo: string,
	daysAgo: string,
): string {
	let timeGap = 8; // Default UTC+8
	if (siteConfig.timeZone >= -12 && siteConfig.timeZone <= 12) {
		timeGap = siteConfig.timeZone;
	}

	const now = new Date();
	const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
	const localNow = utc + timeGap * 60 * 60 * 1000;
	const date = new Date(dateString);
	const diffInMinutes = Math.floor((localNow - date.getTime()) / (1000 * 60));

	if (diffInMinutes < 60) {
		return `${diffInMinutes}${minutesAgo}`;
	}
	if (diffInMinutes < 1440) {
		const hours = Math.floor(diffInMinutes / 60);
		return `${hours}${hoursAgo}`;
	}
	// 超过24小时显示绝对日期
	const localeMap: Record<string, string> = {
		zh_CN: "zh-CN", zh_TW: "zh-TW", en: "en-US",
		ja: "ja-JP", ko: "ko-KR",
	};
	const locale = localeMap[siteConfig.lang || "zh_CN"] || "zh-CN";
	const entryYear = date.getFullYear();
	const currentYear = localNow ? new Date(localNow).getFullYear() : now.getFullYear();
	if (entryYear !== currentYear) {
		return date.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
	}
	return date.toLocaleDateString(locale, { month: "long", day: "numeric" });
}
