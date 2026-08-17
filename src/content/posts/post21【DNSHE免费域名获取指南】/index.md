---
title: "免费域名获取指南：DNSHE 注册 ccwu.cc 并托管到 Cloudflare"
published: 2026-08-16
description: "DNSHE 免费二级域名注册全流程：优先选择 ccwu.cc 后缀（初始 10 年有效期、可免费续期、支持托管 Cloudflare），附 Cloudflare 托管与解析配置步骤。"
tags: [域名, DNSHE, Cloudflare, 免费资源]
category: 教程
draft: false
comment: true
sourceLink: "https://my.dnshe.com/"
---

# 免费域名获取指南：DNSHE 注册 ccwu.cc 并托管到 Cloudflare

> 自建博客、VPS、NAS 都离不开一个域名。DNSHE 提供永久免费的二级域名注册，其中 **ccwu.cc** 后缀注册即得 10 年有效期，到期前还能免费续期，并且可以完整托管到 Cloudflare。

## DNSHE 是什么

[DNSHE](https://my.dnshe.com/) 是一个免费域名注册与 DNS 服务平台，面向开发者、学生和开源爱好者，无需信用卡、无需实名认证，邮箱验证即可注册账号并申请免费域名。

免费域名可以用来：

- 自建博客、个人主页
- VPS / NAS 的远程访问入口
- Cloudflare 邮箱路由（免费收发信）
- DDNS 动态解析、临时项目测试

## 后缀选择：优先 ccwu.cc

DNSHE 提供多个免费后缀，实测差异很大：

| 后缀 | 初始有效期 | 特点 |
| --- | --- | --- |
| **ccwu.cc** | 约 10 年 | 注册即得 10 年，到期前 180 天可点「免费续期」无限续，推荐首选 |
| bbroott.com | 约 10年 | 临时项目、补充测试 |
| cc.cd | 约 1 年 | 已进入 PSL，可托管 Cloudflare |
| cn.mt | 约 1 年 | 测试用途、短期项目 |

**为什么选 ccwu.cc：**

1. **有效期 10 年**：注册后直接获得约 10 年有效期，免去每年手动续期的麻烦，适合长期备用
2. **免费续期**：到期前 180 天后台会出现「免费续期」按钮，点击即续期，可一直续下去
3. **可托管 Cloudflare**：ccwu.cc 已进入 PSL（Public Suffix List），可以像正式域名一样完整托管到 Cloudflare，使用 CDN、SSL、缓存、规则等功能

> 提醒：DNSHE 上免费的 `.com` 后缀目前无法托管到 Cloudflare，按本指南操作会卡在激活阶段，请勿选择。

## 注册步骤

1. 打开注册入口：<https://my.dnshe.com/register.php>
2. 使用邮箱接收验证码，填写必填信息完成注册（无需实名）
3. 登录后台，左侧菜单进入「域名管理」→「注册新域名」
4. 在根域名下拉菜单中选择 **ccwu.cc**
5. 输入想要的前缀（字母、数字和连字符，最短 2 个字符），确认完整域名无误后点击注册
6. 回到「我注册的域名」列表确认状态

注册后状态显示「未解析」是正常的，托管到 Cloudflare 后会自动更新。

## 托管到 Cloudflare

### 1. 在 Cloudflare 添加站点

1. 注册并登录 <https://dash.cloudflare.com>
2. 点击「添加站点」，选择「连接已有域名」
3. 输入刚注册的完整域名（例如 `yourname.ccwu.cc`）
4. 选择「免费」套餐（US$0），已包含 Universal SSL 证书、DNS 解析、全球 CDN
5. 进入「更新名称服务器」页面，复制 Cloudflare 分配的两个 NS 地址

### 2. 回到 DNSHE 修改 DNS 服务器

1. 在 DNSHE 「域名管理」中找到你的域名
2. 点击「DNS 服务器」
3. 删除默认的 `ns1.dnshe.com`、`ns2.dnshe.com`，填入 Cloudflare 的两个 NS 地址（每行一个）
4. 保持「强制替换冲突记录」勾选，保存设置

### 3. 等待激活并添加解析

名称服务器修改后全球同步需要几分钟到 24 小时。回到 Cloudflare：

- 域名状态从「等待中」变为「活动」即托管成功
- 状态长时间不变时，可点击「重新检查名称服务器」

激活后在 DNS 页面添加解析记录，常见配置：

| 类型 | 名称 | 内容 | 代理状态 |
| --- | --- | --- | --- |
| A | `@` | 服务器 IPv4 地址 | 橙云或灰云 |
| CNAME | `www` | `@` | 橙云 |
| A | `blog` | 服务器 IPv4 地址 | 橙云 |
| A | `nas` | 家宽公网 IP | 视情况选择 |

- **橙云（Proxied）**：流量经过 Cloudflare，启用 CDN 与防护，适合网站、博客、静态页面
- **灰云（DNS only）**：只做解析不经代理，适合 SSH、面板后台、NAS 等非网页服务

## 注意事项

- **不要注册 `.com` 免费后缀**：无法托管到 Cloudflare，激活会一直失败
- **留意续期**：ccwu.cc 到期前 180 天记得点「免费续期」按钮；其他 1 年后缀每年续
- **政策可能变动**：DNSHE 后缀列表、有效期和 Cloudflare 兼容性以官方后台为准，之前出现过 ccwu.cc 短暂暂停注册的情况，建议尽快注册
- **合规使用**：免费域名请勿用于违法违规用途

> 参考资料：
> - [DNSHE 官方](https://www.dnshe.com/)
> - [科技老王：DNSHE 免费域名注册教程（ccwu.cc 实测 10 年有效期）](https://kejilaowang.com/dnshe-free-domain-cloudflare-ccwu/)
> - [TG-FF：如何申请免费域名并托管到 Cloudflare](https://tg-ff.com/blog/free-domain-cloudflare/)
> - [HQY：DNSHE 所有免费域名均可托管到 Cloudflare](https://www.hqy.ip-ddns.com/post/10180.html)