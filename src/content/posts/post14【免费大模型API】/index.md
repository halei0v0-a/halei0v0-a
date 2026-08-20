---
title: 免费大模型API  
published: 2026-08-11  
description: 国内外低门槛免费模型API分享整理与体验。  
tags: [AI,API]  
category: AI  
draft: false
---

# 免费大模型API汇总

:::note[注意]

第一部分汇总国外低门槛注册的模型API，第二部分汇总国内需实名的免费API。只总结可长期白嫖的，新注册提供额度和第三方小众平台不在收录范围内。

:::

## 国外低门槛免费模型API

### 一、Opencode

<svg width='234' height='42' viewBox='0 0 234 42' fill='none' xmlns='http://www.w3.org/2000/svg'><g clip-path='url(#clip0_1311_95049)'><path d='M18 30H6V18H18V30Z' fill='#CFCECD'/><path d='M18 12H6V30H18V12ZM24 36H0V6H24V36Z' fill='#656363'/><path d='M48 30H36V18H48V30Z' fill='#CFCECD'/><path d='M36 30H48V12H36V30ZM54 36H36V42H30V6H54V36Z' fill='#656363'/><path d='M84 24V30H66V24H84Z' fill='#CFCECD'/><path d='M84 24H66V30H84V36H60V6H84V24ZM66 18H78V12H66V18Z' fill='#656363'/><path d='M108 36H96V18H108V36Z' fill='#CFCECD'/><path d='M108 12H96V36H90V6H108V12ZM114 36H108V12H114V36Z' fill='#656363'/><path d='M144 30H126V18H144V30Z' fill='#CFCECD'/><path d='M144 12H126V30H144V36H120V6H144V12Z' fill='#211E1E'/><path d='M168 30H156V18H168V30Z' fill='#CFCECD'/><path d='M168 12H156V30H168V12ZM174 36H150V6H174V36Z' fill='#211E1E'/><path d='M198 30H186V18H198V30Z' fill='#CFCECD'/><path d='M198 12H186V30H198V12ZM204 36H180V6H198V0H204V36Z' fill='#211E1E'/><path d='M234 24V30H216V24H234Z' fill='#CFCECD'/><path d='M216 12V18H228V12H216ZM234 24H216V30H234V36H210V6H234V24Z' fill='#211E1E'/></g><defs><clipPath id='clip0_1311_95049'><rect width='234' height='42' fill='white'/></clipPath></defs></svg>

Opencode的Zen套餐提供部分免费模型的使用

OpencodeAPI接口：https://opencode.ai/zen/v1

:::note[注意]

Opencode的Zen需使用GitHub注册登录

DeepSeek V4 flash和mimo V2.5的上下文只有200K，不是满血的1M，HY3的上下文是256K

:::

:::warning[重要通知]

opencode zen已于2026.08.21移除DeepSeek V4 flash free该模型该模型目前需付费使用！

:::

![preview](https://blogpicture.halei0v0.ccwu.cc/images/Classification/%E7%B4%A0%E6%9D%90/2026-08-12%2009-39%20%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE(5).png)

可自定义API模型调取

![preview](https://blogpicture.halei0v0.ccwu.cc/images/Classification/%E7%B4%A0%E6%9D%90/2026-08-12%2009-39%20%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE(6).png)

目前免费的模型

![gallery image](https://blogpicture.halei0v0.ccwu.cc/images/.thumbnails/Classification_%E7%B4%A0%E6%9D%90_2026-08-12%2009-43%20%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE(10).png)

可满足日常中强度使用

![gallery image](https://blogpicture.halei0v0.ccwu.cc/images/.thumbnails/Classification_%E7%B4%A0%E6%9D%90_2026-08-12%2009-40%20%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE(8).png)

:::tip[补充]

文本模型推荐：deepseek/deepseek-v4-flash  
图片识别推荐：xiaomi/mimo-v2.5

:::

![gallery image](https://blogpicture.halei0v0.ccwu.cc/images/.thumbnails/Classification_%E7%B4%A0%E6%9D%90_2026-08-12%2009-42%20%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE(9).png)

### 二、Openrouter

![img](https://openrouter.ai/brand/v2/nav-lockup-light@2x.png)

Openrouter提供较低额度的API模型调用，不如Opencode，但胜在可直接邮箱注册无需使用Github登录

OpenrouterAPI接口：https://openrouter.ai/api/v1

:::note[注意]

Openrouter免费版API限制调用 20次/分钟 和 50次/天。

可通过一次性充值 $10 后，每日限制可提升至 1,000次

:::

免费模型列表[https://openrouter.ai/collections/free-models](https://openrouter.ai/collections/free-models)

代码能力：cohere/north-mini-code:free

文本能力：nvidia/nemotron-3.5-content-safety:free

:::tip[补充]

Openrouter的north-mini-code:free可正常调用

Opencode的north-mini-code:free无法正常调用

:::

### 三、Agnes AI

[Agnes AI](https://platform.agnes-ai.com/)【新加坡AI公司】

接口：https://apihub.agnes-ai.com/v1

免费模型：

1.文本模型【限制：免费版20次每分钟】

Agnes 2.0 Flash

Agnes 2.5 Flash

2.视频模型【限制：免费版1次每分钟】

agnes-video-v20

3.图片模型

agnes-image-21-flash【限制：免费版1次每分钟】

:::tip
可作为备用选择
:::

:::note
outlook邮箱及outlook邮箱注册的GitHub账号无法注册，但我的自建邮箱却可以，可以注意一下。
:::


### 四、NVIDIA NIM

优点：可以用大模型（glm5.2等）

缺点：不好用，太慢了

40次每分钟，1000次每天

【不详细介绍了】

## 国内免费模型API

### 一、魔搭社区（ModelScope）

:::note[注意]

我认为比较好的平台，需使用已绑定身份证照片实名的阿里云账号。

:::

* 免费额度：提供每日约 2000次 的免费API调用额度。
* 特点：阿里旗下的开源模型社区，支持直接调用 DeepSeek-R1、Qwen 等最新开源模型。非常适合结合 Dify、n8n 等工具进行零成本搭建智能体（Agent）或工作流实战。

### 二、硅基流动（SiliconFlow）

- 免费额度：许多开源模型长期免费，虽然提供的免费模型都一般。（新用户注册通常赠送高达 2000万 Tokens的免费额度）

- 特点：这是一站式大模型API聚合平台，集成了 Qwen、DeepSeek、Kimi、GLM 等众多国内外顶尖模型。

- 优势：许多开源模型长期免费，且完全兼容 OpenAI 接口，支持直接替换 Base URL 使用。

- 官称免费模型[大模型 API 价格方案 - 硅基流动 SiliconFlow](https://siliconflow.cn/pricing)

  1. 对话模型

     [GLM-Z1-9B-0414](https://cloud.siliconflow.cn/models?target=THUDM%2FGLM-Z1-9B-0414)

     [GLM-4-9B-0414](https://cloud.siliconflow.cn/models?target=THUDM%2FGLM-4-9B-0414)

     [DeepSeek-OCR](https://cloud.siliconflow.cn/models?target=deepseek-ai%2FDeepSeek-OCR)

     [DeepSeek-R1-0528-Qwen3-8B (Free)](https://cloud.siliconflow.cn/models?target=deepseek-ai%2FDeepSeek-R1-0528-Qwen3-8B)

     [Qwen3.5-4B](https://cloud.siliconflow.cn/models?target=Qwen%2FQwen3.5-4B)

     [Qwen3-8B](https://cloud.siliconflow.cn/models?target=Qwen%2FQwen3-8B)

     [Qwen2.5-7B-Instruct (Free)](https://cloud.siliconflow.cn/models?target=Qwen%2FQwen2.5-7B-Instruct)

     [PaddleOCR-VL-1.5](https://cloud.siliconflow.cn/models?target=PaddlePaddle%2FPaddleOCR-VL-1.5)

     [Hunyuan-MT-7B](https://cloud.siliconflow.cn/models?target=tencent%2FHunyuan-MT-7B)

     [bge-m3](https://cloud.siliconflow.cn/models?target=BAAI%2Fbge-m3)

     [bge-reranker-v2-m3](https://cloud.siliconflow.cn/models?target=BAAI%2Fbge-reranker-v2-m3)

     [bge-large-zh-v1.5](https://cloud.siliconflow.cn/models?target=BAAI%2Fbge-large-zh-v1.5)

     [bge-large-en-v1.5](https://cloud.siliconflow.cn/models?target=BAAI%2Fbge-large-en-v1.5)

  2. 生图模型

     [Kolors](https://cloud.siliconflow.cn/models?target=Kwai-Kolors%2FKolors)

  3. 语音模型

     [TeleSpeechASR](https://cloud.siliconflow.cn/models?target=TeleAI%2FTeleSpeechASR)

     [SenseVoiceSmall](https://cloud.siliconflow.cn/models?target=FunAudioLLM%2FSenseVoiceSmall)

  

### 三、火山引擎（字节豆包）

- 免费额度：每日提供200万 Tokens的免费额度。
- 特点：额度每日刷新，非常适合高频调用的个人开发者或中小型项目，支持豆包大模型及DeepSeek等热门模型。

### 四、腾讯云（混元大模型）

- 免费额度：提供每年 100万 Tokens的免费额度。
- 特点：包含 `hunyuan-lite` 等轻量级模型，适合对成本敏感且需要腾讯生态支持的场景。

# 总结补充

> 个人比较中意Opencode和魔搭社区（ModelScope）

**国内免费大模型 API 平台**  
阿里云百炼（通义千问系列）  
火山引擎（豆包大模型）  
腾讯云（混元大模型）  
百度千帆大模型平台（文心一言系列）  
智谱 AI 开放平台（GLM 系列）  
科大讯飞星火开放平台  
小米 MiMo API 开放平台  
硅基流动（SiliconFlow，聚合平台）  
魔搭社区（ModelScope，阿里开源社区）  
零一万物（Yi 系列）  
百川智能（Baichuan 系列）  
阶跃星辰（Step 系列）  
月之暗面（Kimi 开放平台）  
商汤科技（SenseNova 日日新）  
昆仑万维（天工 Skykwork）

**国外免费大模型 API 平台**  
Google AI Studio（Gemini 系列，提供 Free Tier）  
Groq（提供极速的 Llama、Mixtral 等开源模型免费推理）  
OpenRouter（API 聚合路由，包含大量免费的开源模型）  
Hugging Face（Inference API，提供基础免费调用层）  
Mistral AI（La Plateforme，提供部分模型免费层/试用额度）  
Cohere（提供 Trial API Key 用于开发测试）  
Cloudflare Workers AI（提供 Serverless 的免费 AI 推理额度）  
Together AI（注册赠送免费 Credits，支持众多开源模型）  
NVIDIA NIM（提供模型推理微服务的免费试用额度）  
AI21 Labs（提供 Jamba 等模型的 Studio 免费试用）  
Deepinfra（注册赠送免费额度，主打开源模型部署）  
Ollama / LM Studio（支持本地部署并自动生成兼容 OpenAI 格式的本地免费 API）
