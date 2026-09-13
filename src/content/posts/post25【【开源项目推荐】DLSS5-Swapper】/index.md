---
title: "【开源项目推荐6】DLSS5-Swapper"  
published: 2026-09-13  
updated: 2026-09-13  
description: "大力水手民间版，让20/30/40系显卡用上DLSS5"  
tags: [DLSS5]  
category: 开源项目推荐  
draft: false  
pinned: false  
comment: true
---





# 【开源项目推荐】DLSS5-Swapper
DLSS5-Swapper::github{repo="rakanki911/DLSS5-Swapper"}
### 前言
很多玩家面临过一个共同的问题：手里的老游戏不支持 DLSS，或者使用的非旗舰显卡无法享受最新的帧生成和超分技术。DLSS5-Swapper 就是为了解决这些限制而诞生的。它并非单一软件，而是一个整合了 ReShade、Feeder 和 OptiScaler 的综合性工具包。其核心逻辑是通过 DLL 替换、API 桥接和注入，将高级超分与画质增强方案强行应用到原本不支持的游戏中。

以下是该工具包的核心组件解析及详细的兼容性指南。

### 核心组件解析

DLSS5-Swapper 的强大之处在于它整合了三条不同的技术路线，针对不同场景发挥作用：

1. Feeder：主力注入工具。对于没有原生 DLSS 支持的游戏，Feeder 负责将 DLSS 相关功能直接注入到游戏进程中，实现“无中生有”。
2. OptiScaler：替换与桥接中枢。对于已经支持 DLSS 或 FSR 的游戏，它可以替换底层的神经模型。此外，它还能将 DX11 或 Vulkan 渲染路径桥接到 DX12，以输出 FSR 画面。
3. ReShade：后处理与覆盖层。除了常规的画质调色，它还负责提供游戏内覆盖层（Overlay），允许玩家在游戏运行时直接调整参数。

### 硬件与系统支持

系统方面，DLSS5-Swapper 仅支持 Windows 10 和 Windows 11 的 64 位版本，但兼容 32 位和 64 位的游戏。

显卡支持分为两种情况：  
原生支持：RTX 20、30、40 以及最新的 50 系列。特别是 RTX 50 系列（Blackwell 架构）以及 RTX PRO Blackwell，可以直接运行工具包内捆绑的最新神经模型。据修改版运行时作者反馈，更老的 RTX 系列也有报告称可以支持。  
非原生支持：如果你使用的是老款 N 卡或非 N 卡，工具包本身不直接提供完整支持。你需要自行寻找并提供修改版的 `nvngx_dlssnr.dll` 文件。工具包的设计不会覆盖你手动放入的修改版 DLL。建议将显卡驱动升级至 616.56 版本以获得最佳兼容性。

### API 兼容性详解

不同 DirectX 版本的支持情况差异较大，配置时需要对症下药：

DirectX 12：兼容性最好。原生 DLSS、Feeder 注入以及 OptiScaler 均可正常使用。  
DirectX 11：Feeder 支持 32 位和 64 位游戏；OptiScaler 则取决于具体游戏是否 eligible（符合条件）。  
DirectX 9 与 DirectX 8：DX9 支持 32/64 位。DX8 仅支持 32 位，且必须通过 dgVoodoo2 先将 DX8 转换为 DX11，然后再交由 Feeder 处理。  
DirectX 10：Feeder 放弃了对 DX10 的直接支持。如果遇到 DX10 游戏，请在游戏设置中切换到 DX11。  
Vulkan 与 OpenGL：主要通过 ReShade 和 Feeder 支持。部分符合条件的 Vulkan 游戏也可以调用 OptiScaler。

### 关键注意事项与避坑指南

在实际折腾过程中，有几个技术细节需要特别注意，否则容易导致游戏崩溃或功能失效：

游戏内覆盖层（Overlay）限制严格。目前仅支持带有 ReShade 附加组件支持的 64 位 DirectX 11 和 12 游戏。并且，该功能目前仅适配了 DLSS5-Feeder 和 RenoDX v4.7。

OptiScaler 的桥接逻辑。OptiScaler 的 DX11 和 Vulkan 路径默认使用 DX12 桥接并输出 FSR 画面。如果你需要更改 Vulkan 后端设置，务必在操作前恢复原始文件。需要明确的是，OptiScaler 的定位是替换和桥接，它不是用来模拟非 DLSS 环境的模拟器。

DLSS5-Swapper 本质上是一个高度模块化的底层修改工具。它打破了官方对超分技术和画质增强的硬件与 API 壁垒，但代价是需要玩家对游戏的渲染 API 和 DLL 注入机制有一定的了解。合理搭配 Feeder 和 OptiScaler，足以让大量老游戏焕发新生。

### 兼容性 (Compatibility)
| 类别 (Category) | 支持情况 / 支持详情 (Support) |
| :--- | :--- |
| **系统 (System)** | Windows 10/11 64位系统；兼容 32 位和 64 位游戏。 |
| **ReShade / Feeder 显卡** | RTX 20 / 30 / 40 / 50 系列；据捆绑的修改版运行时的作者称，也支持更旧的系列显卡。 |
| **OptiScaler 显卡** | 启用了原生 DLSS 的 64 位游戏。捆绑的神经模型在 Blackwell 架构（RTX 50 / RTX PRO Blackwell）上运行；较旧的显卡需要您自行提供修改版的 `nvngx_dlssnr.dll` 文件（该文件不会被覆盖）。推荐使用 616.56 版本驱动。 |
| **DirectX 12** | 支持原生 DLSS、Feeder 或符合条件的 OptiScaler 游戏。 |
| **DirectX 11** | 32/64 位游戏支持 Feeder；支持符合条件的 OptiScaler 游戏。 |
| **DirectX 9 / 8** | **DX9**：支持 32/64 位；<br>**DX8**：支持 32 位（通过 dgVoodoo2 → DX11 → Feeder 链路实现）。 |
| **Vulkan / OpenGL** | 支持 ReShade / Feeder；符合条件的 Vulkan 游戏也可使用 OptiScaler。 |
| **DirectX 10** | Feeder 不直接支持；在可用时请选择 DX11。 |
| **游戏内覆盖层 (In-game overlay)** | 支持 ReShade 附加组件的 64 位 DirectX 11 / 12 游戏；仅限 DLSS5-Feeder 和 RenoDX v4.7。 |
| **备注 (Notes)** | **关于 OptiScaler**：其 DX11/Vulkan 路径默认使用带有 FSR 输出的 DX12 桥接。若要更改 Vulkan 后端，请先恢复原始文件。OptiScaler 并非模拟器/非 DLSS 路径。 |
