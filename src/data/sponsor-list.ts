/**
 * 打赏记录列表（后台「数据管理 - 赞助-打赏记录」添加/编辑）
 */
export interface SponsorItem {
	id: number;
	name: string;
	avatar: string;
	amount: string;
	date: string;
}

export const sponsorList: SponsorItem[] = [];