---
title: Edgeone Pages部署博客遇到的问题
published: 2026-08-10
description: 本次备用博客使用Edgeone Pages部署的一些感受
tags: [技术, 静态网站]
category: 博客
image: "https://picture.halei0v0.ccwu.cc/images/Classification/%E4%BA%8C%E6%AC%A1%E5%85%83/2026-04-06%2006-16%2021.webp"
draft: false
---

# 使用Edgeone Pages部署博客

**问题：**

:::tip[注意1]

Edgeone Pages在自定义域名的时候如果你使用的是Cloudflare请注意！

:::

如果你用的是子域名注意：

Edgeone Pages给的TXT记录名中的域名是**不全**的而CNAME记录名中的域名又给多了后缀。

我被这东西卡了20分钟没看出来(ˉ▽ˉ；)...



:::tip[注意2]

Edgeone Pages部署单文件不能超过25MB，我的图床视频功能直接卡死。。。。

:::

【我的4K视频啊，只能用Vercel放大视频文件了】
