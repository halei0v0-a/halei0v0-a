---
title: 个人免费随机图床搭建
published: 2026-04-25
description: Vercel-Random-Picture-halei0v0我改编优化的一款随机图床，可部署到Eageone和Vercel pages。
tags: [项目,发布]
image: "https://picture.halei0v0.top/api/random/人文"
category: 项目
draft: false
---



# Random picture随机图床

> 关于我之一个月来都干了些什么，我只能说尝试了新的博客——基于Claw Cloud【"答辩免费服务器"】的Halo博客【博客是好东西】
>
> 今天一看，就两周没登陆账号，项目就被停了，数据库还因此直接罢工了，数据全部不见了
>
> 总结，还是静态的页面来的安全，虽然稍微有点门槛，但毕竟稳定长效不是吗？

## 项目地址

::github{repo="halei0v0/Vercel-Random-Picture-halei0v0"}

**由THW/THWH2O-ME的项目改写完善而来** 

::github{repo="H2O-ME/EdgeOne-Random-Picture"}

## 这是什么

一个基于 Vercel Pages 构建的随机图片分发系统，改自 THW 的项目。原版跑在 EdgeOne 上（THW's Demo：https://picture.tianhw.top/），我把它移植到 Vercel 并加了些自己的东西。

核心功能就一句话：**给你一张随机图片**。往部署好的图床丢一堆图，然后任何地方引用 `https://你的域名/api/random`，每次访问都会返回一张随机的图。我博客横幅的随机背景图就是靠它。

## 特性

- **极速响应**：基于 Vercel 全球边缘节点分发，国内访问也还算快
- **智能分发**：自动识别访问者设备类型（PC/移动端），返回适配尺寸的图片
- **沉浸式图库**：内置瀑布流图库页面，支持 Lightbox 预览、原图下载和 GSAP 动画
- **动感交互**：集成 GSAP 动画引擎，首页缩放和页面切换都有过渡效果
- **架构优化**：图片元数据在构建时自动生成，运行时不用扫描目录

## 快速开始

### 1. 准备图片

把图片素材直接放进 `public/images/{你创建的分类文件夹}` 目录就行：

- **无需重命名**：支持任何文件名
- **格式无忧**：支持 `.jpg`, `.jpeg`, `.jfif`, `.png`, `.gif`, `.webp`, `.bmp`, `.tiff` 等主流格式
- **支持子目录**：可以创建文件夹对图片进行分类管理，系统自动递归扫描
- **自动分类**：
  - 横屏图片（宽 > 高）：自动归类为 PC 端素材
  - 竖屏图片（高 >= 宽）：自动归类为移动端素材
- **自定义分类**：在 `public/images/Classification/` 目录下创建子文件夹，文件夹名自动作为分类名

  ```shell
  public/images/Classification/风景/
  public/images/Classification/动漫/
  public/images/Classification/人物/
  ```

  对应分类文件夹里的图片会被自动标记为该分类。

- **构建优化**：图片元数据在构建时自动生成

### 2. 安装与开发

```shell
# 安装依赖
pnpm install

# 启动本地开发服务器
pnpm dev
```

### 3. 部署

使用 Vercel Pages 部署项目，点击仓库里的一键部署按钮即可，相关配置会自动识别；也可以手动填：

- **框架预设**：选择 `Next.js`
- **构建命令**：`npm run build`
- **输出目录**：`.next`

部署完把你自己的图传进 `public/images/` 重新构建一次，就能用了。

## API 接口

- **随机图片重定向**: `GET /api/random`
- 指定类型:
  - PC 端: `/api/random?type=pc`
  - 移动端: `/api/random?type=mobile`
- **指定分类**: `/api/random?classification=风景`

  **或**：`/api/random/{分类名}`
- **组合筛选**: `/api/random?type=pc&classification=动漫`
- **JSON 格式**: `/api/random?redirect=false` (返回图片 URL 路径)
- **图库预览**: `GET /gallery`

日常最常用的两个：博客背景想要指定风格就 `/api/random/风景`，想要纯随机就 `/api/random`。

## 许可证

[MIT License](https://github.com/halei0v0/Vercel-Random-Picture-halei0v0/blob/main/LICENSE)