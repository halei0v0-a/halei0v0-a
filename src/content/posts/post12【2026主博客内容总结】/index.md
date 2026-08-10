---
title: 2026主博客内容总结
published: 2026-06-01
description: 本博客 2026 年全部文章的汇总整理，包含工具教程、资源分享、AI 工具推荐与日常记录。
tags: [总结, 汇总]
category: 总结
draft: false
---

# 2026主博客内容总结

本文整理了本博客在 **2026 年** 发布的全部文章内容（加密文章除外），涵盖工具教程、资源分享、AI 工具推荐、游戏分享与日常记录，共 11 篇。原文内容完整保留，按发布时间排序。

## 1. 打造自己的Minecraft服务器控制面板（2026-01-10）

> MCSManager 详细教程：安装、配置、使用，打造属于自己的 Minecraft 服务器控制面板。

# 打造自己的Minecraft服务器控制面板：MCSManager详细教程

在广袤的Minecraft世界中，你是否曾梦想拥有一个自己的服务器，与朋友们畅游其中？MCSManager Panel（简称MCSM Panel）是一个多语言、轻量级、开箱即用、支持多实例的Minecraft服务器控制面板，还支持Docker。它可以帮助你轻松管理多个物理服务器，实时创建游戏服务器，并提供安全可靠的用户权限系统，确保多用户之间的流畅体验。

在本教程中，我们将详细介绍如何安装、配置和使用MCSManager Panel，以及一些高级功能。让我们一起来打造自己的Minecraft服务器控制面板吧！

## 1. 运行环境

MCSManager Panel可以在Windows和Linux平台上运行，无需复杂的数据库或系统配置。作为一个轻量级控制面板，你只需要安装Node.js即可。

所需Node.js版本：14.17.6或更高。

## 2. 安装

### Windows系统

对于Windows系统，MCSM Panel已经编译成了一键运行版本。

1. 从官方网站下载：https://mcsmanager.com/

### Linux系统

快速安装，只需一条命令：

```shell
wget -qO- https://raw.githubusercontent.com/mcsmanager/Script/master/setup.sh | bash
```

这个脚本适用于Ubuntu、Centos、Debian和Archlinux的AMD64架构系统。安装完成后，使用以下命令启动服务：

```shell
systemctl start mcsm-{web,daemon}
```

MCSManager的组件和运行目录位于：`/opt/mcsmanager/`

如果安装脚本不起作用，你可以尝试手动安装：

```shell
# 切换到安装目录，如果不存在请提前创建
cd /opt/
# 下载运行环境（Node.js），如果已经安装了Node.js 14+，请忽略此步骤
wget https://nodejs.org/dist/v14.17.6/node-v14.17.6-linux-x64.tar.gz
# 解压缩归档
tar -zxvf node-v14.17.6-linux-x64.tar.gz
# 将程序添加到系统PATH
ln -s /opt/node-v14.17.6-linux-x64/bin/node /usr/bin/node
ln -s /opt/node-v14.17.6-linux-x64/bin/npm /usr/bin/npm

# 准备安装目录
mkdir /opt/mcsmanager/
cd /opt/mcsmanager/

# 下载MCSManager
wget https://github.com/MCSManager/MCSManager/releases/latest/download/mcsmanager_linux_release.tar.gz
tar -zxf mcsmanager_linux_release.tar.gz

./install-dependency.sh

# 请打开两个终端或使用Screen

# 首先启动守护程序
./start-daemon.sh

# 启动Web服务（在第二个终端中执行）
./start-web.sh

# 访问 http://localhost:23333/ 查看Web界面
# 通常情况下，Web应用程序将自动扫描并连接到本地守护程序。
```

需要注意的是，上述步骤没有注册面板组件到系统服务中，你需要使用`screen`来管理它，或者手动注册系统服务。

## 3. 数据目录

Web配置和数据：`/opt/mcsmanager/web/data/`

Daemon配置和数据：`/opt/mcsmanager/daemon/data/`

## 4. 升级

在每次升级之前，强烈建议备份数据目录。升级步骤参考：https://github.com/MCSManager/MCSManager/wiki/Update-MCSManager

## 5. 项目介绍

MCSManager Panel由三个项目组成，你在安装时使用的代码是编译和集成的结果。

- **Web后端**：控制中心，负责后端API、用户数据管理以及与守护程序的通信和身份验证。
- **前端/UI**：后端的用户界面，负责通过Web界面显示统计信息、发送请求以及与守护程序的通信。该项目的最终产品是纯静态文件。
- **守护程序**：被控制的远程节点，负责控制本地的所有实例和管理实际的实例进程。它能够与所有对象通信。

## 6. 搭建开发环境

这部分面向开发者，如果你不是开发者，可以安全地忽略这些内容。一旦这些项目在开发环境中运行，你可以继续开发或预览它们。请确保遵守许可证。

### Web项目

```shell
git clone https://github.com/MCSManager/MCSManager.git
cd MCSManager
npm install
npm run start
# 默认情况下，使用ts-node来直接运行TypeScript代码
# 默认运行在端口23333。
```

### UI项目

```shell
git clone https://github.com/MCSManager/UI.git
cd UI
npm install
npm run serve
# 在 http://localhost:8080/ 预览界面
# 所有请求将被重定向到端口23333。
```

### Daemon项目

```shell
git clone https://github.com/MCSManager/Daemon.git
cd Daemon
npm install
npm run start
# 运行后，请通过Web界面将守护程序连接到控制面板。
# 默认情况下，运行在端口24444。
```

## 7. 浏览器兼容性

MCSManager Panel支持主流现代浏览器，如Chrome、Firefox、Safari和Opera。不再支持IE。

## 8. 国际化

MCSManager的国际化由Lazy、KevinLu2000、zijiren233和Unitwk完成。

## 9. 权限管理

控制面板在运行时会检查用户列表。如果没有可用用户，将创建一个默认的管理员用户。

如果你忘记了唯一的管理员帐户，你可以备份所有当前用户数据，生成一个新的管理员帐户，然后覆盖以前的帐户。

用户数据目录：`/opt/mcsmanager/web/data/Users/*.json`

# 快去试试吧~~

---

## 2. Vmware虚拟机【下载使用教程】（2026-01-11）

> VMware 下载方法及下载链接。

# **一、什么是虚拟机**

> 省流：**下载地址：**【来源于[蓝点网](https://dl.landian.news/?dir=soft/vmware/workstation)】
>
> [VMware-Workstation-Full-26H1](https://dl.landian.news/?dir=soft/vmware/workstation)：https://dl.landian.news/?dir=soft/vmware/workstation

虚拟机指通过软件模拟的具有完整硬件系统功能的、运行在一个完全隔离环境中的完整计算机系统，在实体计算机中能够完成的工作在虚拟机中都能够实现。

# **二、VMware的简介**

##### **1、大概介绍**

VMWare虚拟机软件是一个“虚拟PC”软件，它使你可以在一台机器上同时运行二个或更多系统。

##### **2、详细介绍**

VMware 是一款功能强大的桌面虚拟计算机软件，提供用户可在单一的桌面上同时运行不同的操作系统，和进行开发、测试 、部署新的应用程序的最佳解决方案。VMware可在一部实体机器上模拟完整的网络环境，以及可便于携带的虚拟机器，其更好的灵活性与先进的技术胜过了市面上其他的虚拟计算机软件。

# 三、下载VMware

:::note

因为VMware虚拟机免费以后官网下载比较麻烦，这里推荐直链下载，所以官网下载不做详细介绍。有需要可以参考[资料](https://zhuanlan.zhihu.com/p/10399355851)

:::

**下载地址：**【来源于[蓝点网]([soft/vmware/workstation • 蓝点网下载服务器](https://dl.landian.news/?dir=soft/vmware/workstation))】

[VMware-Workstation-Full-26H1](https://dl.landian.news/?dir=soft/vmware/workstation)：https://dl.landian.news/?dir=soft/vmware/workstation

**下面是更新日志：**

1. 特别提醒：VMware Workstation Pro 不在需要许可证密钥，现在可免费用于商业、教育和个人用途。

2. 错误修复：解决 VMware Workstation Pro for Linux 版在快照管理器中执行快照删除时的崩溃问题。

3. 错误修复：解决在 Windows 11 宿主机上使用 VMware Workstatio Pro 时，虚拟机锁定或解锁后卡死问题。

4. 错误修复：解决 kcompactd 内核进程导致 Linux 宿主机上的虚拟机出现卡死问题。

**下面是已知问题：**

升级到此版本后用户可能会碰到多显示器功能在特定拓扑中无法工作的问题，该问题由不同硬件和拓扑引起且情况不同，如果用户注意到将扩展显示器设置为单显示器那就是触发了这个问题，在多显示器的情况下也可能出现无法切换等问题。

---

## 3. Aria2【Linux版本使用教程】（2026-02-03）

> 关于磁力链接下载器 Aria2 的使用经验分享。

# 【Linux】Aria2使用指南

1. 基本介绍：**aria2** 是一个轻量级、多协议的命令行下载工具，支持 **HTTP、HTTPS、FTP、SFTP、BitTorrent、Metalink** 等协议，并可通过多连接同时从多个来源下载文件，大幅提升速度。
2. **安装方法**

* **Debian/Ubuntu**

  ```shell
  sudo apt update
  sudo yum install aria2
  ```

* **CentOS/RHEL**

  ```shell
  sudo yum install aria2
  ```

* **Fedora**

  ```shell
  sudo dnf install aria2
  ```

3. **常用下载示例**

* **单文件下载**

  ```shell
  aria2c http://example.com/file.zip
  ```

* **多文件下载**

  ```shell
  aria2c http://example.com/file1.zip http://example.com/file2.zip
  ```

* **断点续传**

  ```shell
  aria2c -c http://example.com/largefile.zip
  ```

* **多线程下载**（4个连接）

  ```shell
  aria2c -x 4 http://example.com/largefile.zip
  ```

* **磁力链接下载**

  ```shell
  aria2c "magnet:?xt=urn:btih:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  ```

4. **进阶功能**

* **限速**

  ```shell
  aria2c --max-download-limit=500K http://example.com/file.zip
  ```

* **指定目录**

  ```shell
  aria2c -d /path/to/directory http://example.com/file.zip\
  ```

  :::note

  **指定目录**命令一定要记住，非常好用！

  :::

* **后台运行（守护进程）**

  ```shell
  aria2c --daemon http://example.com/file.zip
  ```

  :::note

  **后台运行（守护进程）**命令一定要记住，非常好用！

  :::

* **使用配置文件**（`~/.aria2/aria2.conf`）

  ```shell
  continue=true
  max-connection-per-server=4
  dir=/path/to/downloads
  max-download-limit=1M
  ```

* 运行：

  ```shell
  aria2c --conf-path=/path/to/aria2.conf http://example.com/file.zip
  ```

  * **启用JSON-RPC远程控制**

    ```shell
    aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all --rpc-listen-port=6800
    ```

* **实用技巧**

  * **静默模式**：`-q --show-console-readout=false`

  * **文件完整性校验**：`--check-integrity`

  * **定时任务下载**（每天凌晨3点）

    ```shell
    0 3 * * * /usr/bin/aria2c -d /path/to/directory http://example.com/dailyfile.zip
    ```

    aria2 在 Linux 下不仅支持多协议高速下载，还能通过 RPC 与其他程序集成，非常适合服务器环境批量、自动化下载任务。

---

## 4. 三角洲游戏截图分享（2026-02-18）

> 关于三角洲的游玩截图分享。

2026.02.18【机密航天】（247.8万）

![截图1](https://cdn.jsdelivr.net/gh/halei0v0/warehouse@imgmd//imgmd/20260218203631198.png)

2026.02.27【机密巴克什】（102.1万）（自从上次打完以后运气一直不怎么样）

![截图2](https://cdn.jsdelivr.net/gh/halei0v0/warehouse@imgmd//imgmd/20260227202117249.png)

![屏幕截图(15)](https://cdn.jsdelivr.net/gh/halei0v0/warehouse@imgmd//imgmd/20260426023646464.png)

2026.04.26【监狱啥也不是！烦】

![image-20260308151815566](https://cdn.jsdelivr.net/gh/halei0v0/warehouse@imgmd//imgmd/20260426023643367.png)

2026.05.02【监狱小吃240万】

![屏幕截图(25)](https://cdn.jsdelivr.net/gh/halei0v0/warehouse@imgmd//imgmd/20260502051611814.png)

![屏幕截图(26)](https://cdn.jsdelivr.net/gh/halei0v0/warehouse@imgmd//imgmd/20260502051631016.png)

# 得吃【1】

2026.05.05

![屏幕截图(36)](https://cdn.jsdelivr.net/gh/halei0v0/warehouse@imgmd//imgmd/20260505041300983.png)

![屏幕截图(35)](https://cdn.jsdelivr.net/gh/halei0v0/warehouse@imgmd//imgmd/20260505041210836.png)

![屏幕截图(34)](https://cdn.jsdelivr.net/gh/halei0v0/warehouse@imgmd//imgmd/20260505041207591.png)

![屏幕截图(29)](https://cdn.jsdelivr.net/gh/halei0v0/warehouse@imgmd//imgmd/20260505041209269.png)

---

## 5. 高中全套课本资源（2026-03-04）

> 高中全套课本 PDF。

## 语文

> 此水几时休，此恨何时已？只愿君心似我心，定不负相思意。

- [普通高中教科书·语文必修上册(统编版).pdf](https://pan.huang1111.cn/s/BGj9Vh6)
- [普通高中教科书·语文必修下册(统编版).pdf](https://pan.huang1111.cn/s/zMOGQFM)
- [普通高中教科书·语文选修上册(统编版).pdf](https://pan.huang1111.cn/s/QzG8Nfm)
- [普通高中教科书·语文选修中册(统编版).pdf](https://pan.huang1111.cn/s/wevN7CK)
- [普通高中教科书·语文选修下册(统编版).pdf](https://pan.huang1111.cn/s/k2GDWcB)

## 数学

> 未知知麻，我复折几沓，卧看绕线千匝，挥手解下点线之差，只为你一小荣华。

- [普通高中教科书·数学必修一(人教A版).pdf](https://pan.huang1111.cn/s/O8ENwfL)
- [普通高中教科书·数学必修二(人教A版).pdf](https://pan.huang1111.cn/s/3ej9qSm)
- [普通高中教科书·数学选修一(人教A版).pdf](https://pan.huang1111.cn/s/vVZlYhE)
- [普通高中教科书·数学选修二(人教A版).pdf](https://pan.huang1111.cn/s/4RjMRFg)
- [普通高中教科书·数学选修三(人教A版).pdf](https://pan.huang1111.cn/s/bybKdFY)

## 英语

> No other love but you.(除你之外，别无所爱)

- [普通高中教科书·英语必修一(外研社版).pdf](https://pan.huang1111.cn/s/mxKveF1)
- [普通高中教科书·英语必修二(外研社版).pdf](https://pan.huang1111.cn/s/75jzRUg)
- [普通高中教科书·英语必修三(外研社版).pdf](https://pan.huang1111.cn/s/laLbVsL)
- [普通高中教科书·英语选修一(外研社版).pdf](https://pan.huang1111.cn/s/NkNq4s1)
- [普通高中教科书·英语选修二(外研社版).pdf](https://pan.huang1111.cn/s/E7j2Nib)
- [普通高中教科书·英语选修三(外研社版).pdf](https://pan.huang1111.cn/s/8QjzbcQ)
- [普通高中教科书·英语选修四(外研社版).pdf](https://pan.huang1111.cn/s/Lx72Ku6)

## 物理

> 我本漫无目的，通过你，让我有了光的形状。

- [普通高中教科书·物理必修一(人教版).pdf](https://pan.huang1111.cn/s/K9mOVUY)
- [普通高中教科书·物理必修二(人教版).pdf](https://pan.huang1111.cn/s/oXomPT8)
- [普通高中教科书·物理必修三(人教版).pdf](https://pan.huang1111.cn/s/nqnWbim)
- [普通高中教科书·物理选修一(人教版).pdf](https://pan.huang1111.cn/s/DVj2bc4)
- [普通高中教科书·物理选修二(人教版).pdf](https://pan.huang1111.cn/s/6ejz7fN)
- [普通高中教科书·物理选修三(人教版).pdf](https://pan.huang1111.cn/s/XqXALCl)

## 化学

> 熵变为正，焓变为负，即使世界绝对零度，爱你，依然自发。

- [普通高中教科书·化学必修一(人教版).pdf](https://pan.huang1111.cn/s/aE4LDcG)
- [普通高中教科书·化学必修二(人教版).pdf](https://pan.huang1111.cn/s/VLD4oud)
- [普通高中教科书·化学选修一(人教版).pdf](https://pan.huang1111.cn/s/YLaWWTA)
- [普通高中教科书·化学选修二(人教版).pdf](https://pan.huang1111.cn/s/ZqVmvhL)
- [普通高中教科书·化学选修三(人教版).pdf](https://pan.huang1111.cn/s/gglXkiQ)

## 生物

> 我有三道防线，也不能将你免疫。

- [普通高中教科书·生物必修一(人教版).pdf](https://pan.huang1111.cn/s/xbxnWfV)
- [普通高中教科书·生物必修二(人教版).pdf](https://pan.huang1111.cn/s/RYL9VIB)
- [普通高中教科书·生物选修一(人教版).pdf](https://pan.huang1111.cn/s/1Qjejfv)
- [普通高中教科书·生物选修二(人教版).pdf](https://pan.huang1111.cn/s/y5RoGS6)
- [普通高中教科书·生物选修三(人教版).pdf](https://pan.huang1111.cn/s/jR857fy)
-  [普通高中教科书必修+选择性必修(人教版)全册](https://pan.huang1111.cn/s/mx2DDi1)

## 政治

> 我是坚定的唯物主义者，直到遇见你，我希望有来世。

- [普通高中教科书·政治必修一(统编版).pdf](https://pan.huang1111.cn/s/dkWoYSV)
- [普通高中教科书·政治必修二(统编版).pdf](https://pan.huang1111.cn/s/2vje6iN)
- [普通高中教科书·政治必修三(统编版).pdf](https://pan.huang1111.cn/s/zMODQIM)
- [普通高中教科书·政治必修四(统编版).pdf](https://pan.huang1111.cn/s/9Qvz7Td)
- [普通高中教科书·政治选修一(统编版).pdf](https://pan.huang1111.cn/s/QzG2Ntm)
- [普通高中教科书·政治选修二(统编版).pdf](https://pan.huang1111.cn/s/wevK7UK)
- [普通高中教科书·政治选修三(统编版).pdf](https://pan.huang1111.cn/s/MNlBVTx)

## 历史

> 我爱上你，顺应历史发展潮流，符合历史发展规律。

- [普通高中教科书·历史必修上册(统编版).pdf](https://pan.huang1111.cn/s/BGj2VH6)
- [普通高中教科书·历史必修下册(统编版).pdf](https://pan.huang1111.cn/s/qg6lyc3)
- [普通高中教科书·历史选修一(统编版).pdf](https://pan.huang1111.cn/s/O8E2wtL)
- [普通高中教科书·历史选修二(统编版).pdf](https://pan.huang1111.cn/s/3ejzqHm)
- [普通高中教科书·历史选修三(统编版).pdf](https://pan.huang1111.cn/s/eNmD5cg)

## 地理

> 我四方踏雪，看尽春去秋华，天地浩大，我登上城楼月下，佛去你街上雪花，只为你描尽山水人家。

- [普通高中教科书·地理必修一(鲁教版).pdf](https://pan.huang1111.cn/s/bybDduY)
- [普通高中教科书·地理必修二(鲁教版).pdf](https://pan.huang1111.cn/s/5XjoBUl)
- [普通高中教科书·地理选修一(鲁教版).pdf](https://pan.huang1111.cn/s/4RjnRsg)
- [普通高中教科书·地理选修二(鲁教版).pdf](https://pan.huang1111.cn/s/A6jmbhB)
- [普通高中教科书·地理选修三(鲁教版).pdf](https://pan.huang1111.cn/s/Wz6mkt3)
- [普通高中教科书·地理必修一(人教版).pdf](https://pan.huang1111.cn/s/mxKmei1)

---

## 6. AIRI：开源 AI 数字桌宠 / 赛博生命（2026-03-08）

> 一个模型驱动的开源数字生命容器：能聊天、能听见、能开口说话，支持 Live2D / VRM 桌宠、游戏智能体与 MCP 工具。

# AIRI：开源 AI 数字桌宠 / 赛博生命

> 模型驱动的灵魂容器，什么都能做一点的桌宠：让 Neuro-sama 这样的虚拟伴侣也成为我们世界中的一员吧！

::github{repo="moeru-ai/airi"}

你是否梦想过拥有一个赛博生命（赛博 waifu、数字桌宠），一个能陪你玩耍、交谈的数字伴侣？今天给大家介绍一个能实现这个愿望的开源项目——**Project AIRI**。

## 🌐 相关链接

- [🌍 官网](https://airi.moeru.ai)
- [📚 中文文档](https://airi.moeru.ai/docs/zh-Hans/)
- [🚀 网页版在线体验](https://airi.moeru.ai/)
- [📦 桌面版下载（GitHub Releases）](https://github.com/moeru-ai/airi/releases/latest)
- [💬 Discord 社区](https://discord.gg/TgQ3Cu2F7A)

## 🧠 这是什么？

借助现代大语言模型的力量（如 ChatGPT、Claude），让 AI 和你角色扮演聊天早已不是难事——[Character.ai](https://character.ai)、[JanitorAI](https://janitorai.com/) 和 [SillyTavern](https://github.com/SillyTavern/SillyTavern)（酒馆）都是相当成熟的方案。但 AIRI 想推进的是另一件事：

> **让一个虚拟角色真正「住」进你的电脑、浏览器或移动设备里**——能说话、能听见、能显示自己的身体，还能逐步接入游戏、直播、Discord、Telegram 和 MCP 工具。

你可能听说过 [Neuro-sama](https://www.youtube.com/@Neurosama)，她是最出色的 AI VTuber 之一，能玩游戏、聊天并与观众互动。可惜她并不开源，直播下线后你就无法与她互动了。AIRI 正是受她启发的**开源替代方向**，让你随时随地拥有自己的数字生命。

## ✨ 特别之处

与其他 AI VTuber 开源项目不同，AIRI 从第一天起就大量使用 Web 技术（WebGPU、WebAudio、Web Workers、WebAssembly、WebSocket），把重心放在「角色如何进入真实环境」：

| 维度 | 说明 |
|------|------|
| 🫧 **身体** | 支持 Live2D 与 VRM 模型，拥有可互动的 2D / 3D 表现，自动眨眼、自动看、空闲眼睛移动 |
| 🎙️ **声音** | 整合 TTS（如 ElevenLabs）、STT 语音识别与说话检测，让角色可以开口、听见你说话 |
| 📖 **上下文** | 插件系统正在把应用状态、开发环境、游戏状态等上下文接入对话流程 |
| 🎮 **行动能力** | Minecraft、Factorio、Discord、Telegram 等服务模块，展示作为智能体参与外部世界的方向 |
| 📱 **可移植** | 网页、桌面、移动端共用基础设施，支持 PWA，手机上也能用 |

::::tip
**担心 Web 技术性能下降？** 不用太担心——浏览器版只是用来展示 Web 能做到什么，并不完全依赖它。桌面版默认支持 NVIDIA CUDA 与 Apple Metal 加速（基于 [candle](https://github.com/huggingface/candle)），且无需复杂的依赖管理。
::::

## ✅ 当前进度

- [x] **大脑**
  - [x] 玩 [Minecraft](https://www.minecraft.net)
  - [x] 玩 [Factorio](https://www.factorio.com)（已提供 [PoC 与 demo](https://github.com/moeru-ai/airi-factorio)）
  - [x] 在 [Telegram](https://telegram.org) / [Discord](https://discord.com) 聊天
  - [ ] 记忆（浏览器内数据库 DuckDB WASM / `pglite` 已完成，Alaya 记忆层施工中）
  - [ ] 纯浏览器本地推理（基于 WebGPU）
- [x] **耳朵**
  - [x] 浏览器 / Discord 音频输入
  - [x] 客户端语音识别与说话检测
- [x] **嘴巴**
  - [x] [ElevenLabs](https://elevenlabs.io/) 语音合成
- [x] **身体**
  - [x] VRM 模型控制与动画（自动眨眼 / 自动看 / 空闲眼睛移动）
  - [x] Live2D 模型控制与动画（自动眨眼 / 自动看 / 空闲眼睛移动）

## 🚀 怎么开始玩？

### 网页版（零配置体验）

打开 [airi.moeru.ai](https://airi.moeru.ai)，配置模型提供商（支持 OpenAI 兼容接口、OpenRouter、DeepSeek、Ollama、Qwen、Gemini、Claude 等）和 API Key，即可开始对话。也支持 PWA，手机上也能用，适合快速尝鲜。

### 桌面版（桌宠模式）

桌面版基于 Electron，可让 AIRI 以 Live2D / VRM 模型常驻桌面，提供系统托盘、窗口穿透、悬停淡化、本地模型接入等桌宠式交互。从 [GitHub Releases](https://github.com/moeru-ai/airi/releases/latest) 下载即可。

### 本地开发

想折腾源码的话：

```shell
pnpm i
pnpm dev        # 网页版
pnpm dev:tamagotchi  # 桌面版（aka 电子宠物）
```

项目还提供了拓麻歌子的 Nix 包（需启用 flakes）：

```shell
nix run github:moeru-ai/airi
```

::::note
**仍在快速演进**：发布版优先保证聊天、角色、模型显示与基础设置；Minecraft 智能体、Discord / Telegram 机器人、Factorio、插件宿主、MCP 等高级能力可能还需要从源码配置或参与开发。详细指南见[开发者文档](https://airi.moeru.ai/docs/zh-Hans/docs/contributing/)。
::::

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=moeru-ai/airi&type=Date)](https://www.star-history.com/#moeru-ai/airi&Date)

---

## 7. AltSendme - 开源免费的文件传输工具（2026-03-08）

> 从您的计算机直接、加密的文件传输到任何人、任何地方 — 无需注册，中间没有云存储。

# AltSendme - 文件传输不必复杂

> 从您的计算机直接、加密的文件传输到任何人、任何地方 — 无需注册，中间没有云存储。

把它想象成面向所有人的 AirDrop。

## 🌐 官方网站

[访问 AltSendme 官网](https://www.altsendme.com/zh)

## ✨ 工作原理

简单。安全。即时。

### 1. 拖放您的文件或文件夹

AltSendme 创建一个一次性共享代码（称为"票据"）。

### 2. 分享票据

复制它并发送给您的朋友 — 通过聊天、电子邮件或短信。

### 3. 他们直接接收

您的朋友在他们的应用中粘贴票据，传输即开始。

## 🎯 为什么人们喜欢 AltSendme

### 传输任何内容

可靠地发送任何大小或格式的文件或文件夹。

### 无需账户

打开、拖放、分享：就这样。

### 私密和加密

文件直接发送给您的朋友：永远不会在线存储。

### 快速传输

AltSendme 可以饱和高达 4Gbps 的连接。

### 跨平台

适用于 Windows、macOS 和 Linux。

### 开源和透明

完全开源的代码：检查、验证和信任。

## 🆚 为什么 AltSendme 更好

| 特性 | AltSendme | 云共享 (Drive, WeTransfer 等) |
|------|-----------|-------------------------------|
| 需要账户 | 否 | 是 |
| 文件大小限制 | 无限制 | 通常有限制 |
| 隐私 | 加密直接传输 | 存储在服务器上 |
| 速度 | 高达 4Gbps | 上传 + 下载 |
| 成本 | 免费 | 通常付费 |

## 💬 评价

**4.5 / 5 — Softpedia**

> "一个非常直接的文件传输应用。非常适合在网络上快速、简单地传输文件。"

## 🚀 立即试用

免费、开源，面向所有人开放

[立即试用 AltSendme](https://www.altsendme.com/zh)

---

## 8. FireRed-OpenStoryline - 完全自动的 AI 视频剪辑工具（2026-03-08）

> FireRed-OpenStoryline 将复杂的视频创作转化为自然直观的对话体验。兼顾易用性和企业级可靠性，让视频创作对初学者和创意爱好者都变得简单友好。

# FireRed-OpenStoryline - 完全自动的 AI 视频剪辑工具

> FireRed-OpenStoryline 将复杂的视频创作转化为自然直观的对话体验。兼顾易用性和企业级可靠性，让视频创作对初学者和创意爱好者都变得简单友好。

## 🌐 在线体验

- [🤗 HuggingFace Demo](https://fireredteam-firered-openstoryline.hf.space/)
- [🌐 Homepage](https://fireredteam.github.io/demos/firered_openstoryline/)
- [GitHub 仓库](https://github.com/FireRedTeam/FireRed-OpenStoryline)

## 💡 项目愿景

FireRed，字面意思红色的火苗，取自"星星之火，可以燎原"。我们将这团火苗取名为 FireRed，就是希望将我们在真实场景中打磨出的 SOTA 能力，像火种一样撒向旷野，点燃全球开发者的想象力，共同改变这个 AI 的世界。

## ✨ 核心特性

### 🌐 智能素材搜索与整理

自动在线搜索并下载符合你需求的图片和视频片段。基于用户主题素材进行片段拆分与内容理解。

### ✍️ 智能文案生成

结合用户主题、画面理解与情绪识别，自动构建故事线及契合的旁白。内置少样本（Few-shot）仿写能力，支持通过输入参考文本（如种草测评、日常碎碎念等）定义文案风格，实现语感、节奏与句式的精准复刻。

### 🎵 智能推荐音乐、配音与字体

支持导入私有歌单，根据视频内容和情绪自动推荐背景音乐并智能卡点。只需描述"克制一点"、"偏情绪化"、"像纪录片旁白"等风格，系统即可匹配合适的配音与字体，保证整体风格协调统一。

### 💬 对话式精修

支持快速删减、替换或重组片段；修改任意字幕文案；调整文字颜色、字体、描边、位置等视觉元素——所有操作均通过自然语言完成，即改即得。

### ⚡ 剪辑技能沉淀

可一键保存为专属剪辑 Skill，记录完整的剪辑逻辑。下次只需更换素材并选择对应 Skill，即可快速复刻同款风格，实现高效批量生产。

## 🏗️ 架构

![openstoryline 架构](https://raw.githubusercontent.com/FireRedTeam/fireredteam.github.io/main/demos/firered_openstoryline/pics/structure.jpg)

## 🎬 演示案例

| **种草视频** | **幽默有趣** | **好物分享** | **文艺风格** |
|------------|------------|------------|------------|
| | | | |

| **开箱视频** | **宠物说话** | **旅行Vlog** | **年终总结** |
|------------|------------|------------|------------|

### 🎨 效果说明

受限于开源素材的版权协议，第一行默认演示中的元素（字体/音乐）仅为基础效果。**强烈建议** 接入自建元素库教程，解锁商用级字体、音乐、特效等，可实现显著优于默认效果的视频质量。

### ⚠️ 画质说明

受限于 README 展示空间，演示视频经过极限压缩。实际运行默认保持原分辨率输出，支持自定义尺寸。

### 💡 Demo 说明

Demo 中：**第一行** 为默认开源素材效果（受限模式），**第二行** 为小红书 App「AI剪辑」元素库效果。👉 点击查看体验教程

### ⚖️ 免责声明

演示中包含的用户自摄素材及品牌标识仅作技术能力展示，版权归原作者所有。如有侵权请联系删除。

## 📦 安装

### 1. 克隆仓库

```bash
# 如果没有安装 git，参考官方网站进行安装：https://git-scm.com/install/
# 或手动打包下载，并解压
git clone https://github.com/FireRedTeam/FireRed-OpenStoryline.git
cd FireRed-OpenStoryline
```

### 2. 创建虚拟环境

按照官方指南安装 Conda（推荐 Miniforge，安装过程中建议勾选上自动配置环境变量）：https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html

```bash
# 要求 python >= 3.11
conda create -n storyline python=3.11
conda activate storyline
```

### 3. 资源下载与依赖安装

#### 3.1 一键安装（仅支持 Linux 和 MacOS）

```bash
sh build_env.sh
```

#### 3.2 手动安装

##### A. MacOS 或 Linux

**Step 1:** 安装 wget（如果尚未安装）

```bash
# MacOS: 如果你还没有安装 Homebrew，请先安装：https://brew.sh/
brew install wget

# Ubuntu/Debian
sudo apt-get install wget

# CentOS
sudo yum install wget
```

**Step 2:** 下载资源

```bash
sh download.sh
```

**Step 3:** 安装依赖

```bash
pip install -r requirements.txt
```

##### B. Windows

**Step 1:** 准备目录：在项目根目录下新建目录 `.storyline`。

**Step 2:** 下载并解压：

*   [下载模型 (models.zip)](https://image-url-2-feature-1251524319.cos.ap-shanghai.myqcloud.com/openstoryline/models.zip) -> 解压至 `.storyline` 目录。
*   [下载资源 (resource.zip)](https://image-url-2-feature-1251524319.cos.ap-shanghai.myqcloud.com/openstoryline/resource.zip) -> 解压至 `resource` 目录。

**Step 3:** 安装依赖

```bash
pip install -r requirements.txt
```

## 🚀 快速开始

注意：在开始之前，您需要先在 config.toml 中配置 API-Key。详细信息请参阅文档 [API-Key 配置](docs/source/zh/api-key.md)

### 1. 启动 MCP 服务器

#### MacOS or Linux

```bash
PYTHONPATH=src python -m open_storyline.mcp.server
```

#### Windows

```powershell
$env:PYTHONPATH="src"; python -m open_storyline.mcp.server
```

### 2. 启动对话界面

**方式 1：命令行界面**

```bash
python cli.py
```

**方式 2：Web 界面**

```bash
uvicorn agent_fastapi:app --host 127.0.0.1 --port 7860
```

## 🐳 Docker 部署

如果未安装 Docker，请先安装 https://www.docker.com/products/docker-desktop/

### 拉取镜像

```bash
# 从 Docker Hub 官方仓库拉取镜像
# 推荐海外用户使用
docker pull openstoryline/openstoryline:v1.0.0

# 从阿里云容器镜像服务拉取镜像
# 推荐国内用户使用（速度更快，更稳定）
docker pull crpi-6knxem4w8ggpdnsn.cn-shanghai.personal.cr.aliyuncs.com/openstoryline/openstoryline:v1.0.0
```

### 启动镜像

```bash
docker run \
  -v $(pwd)/config.toml:/app/config.toml \
  -v $(pwd)/outputs:/app/outputs \
  -v $(pwd)/run.sh:/app/run.sh \
  -p 7860:7860 \
  openstoryline/openstoryline:v1.0.0
```

启动后访问 Web 界面 http://0.0.0.0:7860

## 📁 项目结构

```
FireRed-OpenStoryline/
├── 🎯 src/open_storyline/           核心应用
│   ├── mcp/                         🔌 模型上下文协议
│   ├── nodes/                       🎬 视频处理节点
│   ├── skills/                      🛠️ Agent 技能库
│   ├── storage/                     💾 Agent 记忆系统
│   ├── utils/                       🧰 工具函数
│   ├── agent.py                     🤖 Agent 构建
│   └── config.py                    ⚙️ 配置管理
├── 📚 docs/                         文档
├── 🐳 Dockerfile                    Docker 配置
├── 💬 prompts/                      LLM 提示词模板
├── 🎨 resource/                     静态资源
│   ├── bgms/                        背景音乐库
│   ├── fonts/                       字体文件
│   ├── script_templates/            视频脚本模板
│   └── unicode_emojis.json          Emoji 列表
├── 🔧 scripts/                      工具脚本
├── 🌐 web/                          Web 界面
├── 🚀 agent_fastapi.py              FastAPI 服务器
├── 🖥️ cli.py                        命令行界面
├── ⚙️ config.toml                   主配置文件
├── 🚀 build_env.sh                  环境构建脚本
├── 📥 download.sh                   资源下载脚本
├── 📦 requirements.txt              运行时依赖
└── ▶️ run.sh                        启动脚本
```

## 📚 文档

### 📖 教程索引

- [API 申请与配置](docs/source/zh/api-key.md) - 如何申请和配置 API 密钥
- [使用教程](docs/source/zh/guide.md) - 常见用例和基本操作
- [常见问题](docs/source/zh/faq.md) - 常见问题解答

## 📋 TODO

- [ ] 添加口播类型视频剪辑功能
- [ ] 添加音色克隆功能
- [ ] 添加更多的转场/滤镜/特效功能
- [ ] 添加图像/视频生成和编辑能力
- [ ] 支持 GPU 渲染和高光裁切

## 🙏 致谢

本项目基于以下优秀的开源项目构建：

### 核心依赖

- [MoviePy](https://github.com/Zulko/moviepy) - 视频编辑库
- [FFmpeg](https://ffmpeg.org/) - 多媒体框架
- [LangChain](https://www.langchain.com/) - 提供预构建 Agent 的框架

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=FireRedTeam/FireRed-OpenStoryline&type=Date)](https://www.star-history.com/#FireRedTeam/FireRed-OpenStoryline&Date)

---

## 9. 个人免费随机图床搭建（2026-04-25）

> Vercel-Random-Picture-halei0v0 我改编优化的一款随机图床，可部署到 Eageone 和 Vercel pages。

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

## 新增功能

# Vercel Random Picture - halei0v0's Random Random Picture

一个基于 Vercel Pages 构建的随机图片分发系统。 【另一个THW基于EdgeOne的随机图片分发系统】 THW's Demo：https://picture.tianhw.top/

## 🌟 特性

- **🚀 极速响应**：基于 Vercel 全球边缘节点实现图片分发。
- **📱 智能分发**：自动识别访问者设备类型（PC/移动端），精准推送适配尺寸的图片。
- **🖼️ 沉浸式图库**：内置瀑布流图库，支持 Lightbox 预览、原图下载及 GSAP 丝滑动画。
- **✨ 动感交互**：集成 GSAP 动画引擎，实现沉浸式首页缩放与页面无缝过渡。
- **🛠️ 架构优化**：采用构建时元数据生成技术。

## 🛠️ 快速开始

### 1. 准备图片

只需将您的图片素材直接**放入** `public/images/{你创建的分类文件夹}` 目录即可：

- **无需重命名**：支持任何文件名。

- **格式无忧**：支持 `.jpg`, `.jpeg`, `.jfif`, `.png`, `.gif`, `.webp`, `.bmp`, `.tiff` 等主流格式。

- **支持子目录**：您可以创建文件夹对图片进行分类管理，系统会自动递归扫描。

- 自动分类：

  - **横屏图片**（宽 > 高）：自动归类为 PC 端素材。
  - **竖屏图片**（高 >= 宽）：自动归类为 移动端素材。
  - 【系统会自动识别图片比例】

- 📁 自定义分类：

  在

  ```shell
  public/images/Classification/
  ```

  目录下创建子文件夹，子文件夹的名称将自动识别作为分类名称。

  例如：

  ```shell
  public/images/Classification/风景/
  public/images/Classification/动漫/
  public/images/Classification/人物/
  ```

  放入对应分类文件夹中的图片将被自动标记为该分类。

- **构建优化**：图片元数据在构建时自动生成。

### 2. 安装与开发

```shell
# 安装依赖
pnpm install

# 启动本地开发服务器
pnpm dev
```

### 3. 部署

使用 Vercel Pages 部署项目

点击上方一键按钮即可快速部署，相关配置应该会自动识别，也可以照下方参数填写：

- **框架预设**：选择 `Next.js`
- **构建命令**：`npm run build`
- **输出目录**：`.next`

## 📡 API 接口

- **随机图片重定向**: `GET /api/random`

- 指定类型:
  - PC 端: `/api/random?type=pc`
  - 移动端: `/api/random?type=mobile`
  
- **指定分类**: `/api/random?classification=风景`

  **或**：`/api/random/{分类名}`

- **组合筛选**: `/api/random?type=pc&classification=动漫`

- **JSON 格式**: `/api/random?redirect=false` (返回图片 URL 路径)

- **图库预览**: `GET /gallery`

## 📄 许可证

[MIT License](https://github.com/halei0v0/Vercel-Random-Picture-halei0v0/blob/main/LICENSE)

---

## 10. MaaEnd-一款终末地辅助工具（2026-05-04）

> 终末地辅助工具推荐：明日方舟终末地全自动助手，解放双手的一站式工具。

# MaaEnd-终末地小助手
::::tip
官网：https://maaend.com
::::

::github{repo="MaaEnd/MaaEnd"}

# MaaEnd：明日方舟终末地全自动助手，解放双手的一站式工具

>作为《明日方舟：终末地》玩家，你是否也被日常清体力、刷基质、搞基建、解拼图、跑委托等重复操作搞得疲惫不堪？今天给大家介绍一款基于 MaaFramework 开发的开源免费终末地小助手 ——MaaEnd，让你从繁琐操作中解脱，专心体验剧情与开荒乐趣。

## 一、项目简介
MaaEnd 是面向《明日方舟：终末地》的全自动化辅助工具，由社区开发者基于 MaaFramework 与 MXU 打造，目前处于快速迭代阶段，支持自动更新，开箱即用。
项目地址：https://github.com/MaaEnd/MaaEnd
适用平台：PC（Win32）、安卓（ADB 连接）
核心定位：覆盖开荒、养成、基建、采集、战斗、贸易全流程的 "一键托管" 工具

## 二、核心功能一览（覆盖 90% 日常）
1. 日常一键预设（懒人福音）
内置日常全套、快速日常、挂机辅助、基质养成四套场景方案，一键切换，无需反复配置，上线即全自动完成当日任务。
2. 开荒 & 剧情全自动
实时开荒辅助：自动识别画面、补关键操作
自动剧情：跳过对话、智能选分支、快速过场
交互处理：点指引光标、翻说明书、关弹窗、清语音
自动拾取：闪光即捡，不遗漏掉落物与采集点
便捷赶路：秒传送、自动滑索，大幅提升跑图效率
3. 战斗辅助（解放双手）
自动普攻、闪避、放技能、开大招
连携攻击、目标锁定集火
适配大部分副本与协议空间战斗
4. 基质养成一条龙
基质筛选：按词条、稀有度、类型自动锁定 / 废弃
基质刷取：循环刷淤积点→自动领奖→一键筛选
完全省去手动点选与判断的时间
5. 基建 & 生产全自动化
生态农场：自动收菜、种植、浇水、整理背包
武库升级 & 制造：武器升级、装备批量制作
基建任务：自动领取产物、补货、收放线索
蓝图搬运工：批量导入蓝图，一键建工业流水线
6. 贸易 & 资源 & 社交自动化
自动倒卖：囤货、售卖、盯利润、控调度券
自动售卖：据点产品换券，一键完成
送货任务：三模式可选，按地区开关更灵活
委托抢单：自动抢单并传送后续
信用购物：按优先级、折扣自动购买
库存转移：帝江号跨区一键挪物资
好友相关：自动拜访、助力、批量加好友
Baker 嘴替：一键清会话红点
7. 其他高频自动化
自动吃药（理智药剂）
自动领取：日常、通行证、邮件、活动奖励
环境监测、协议空间清体力、野外巡回采集
自动给干员送礼、领回礼

## 三、使用亮点
自动更新：新版本无需手动下载，省心稳定
多端适配：PC 前台 / 后台运行、安卓 ADB 连接
开箱即用：可视化操作，无需编程基础
持续迭代：社区活跃，新功能快速上线
免费开源：无广告、无捆绑、安全透明

## 四、注意事项（重要）
项目处于快速迭代期，可能存在少量 BUG，遇到问题可提 Issue 反馈
请勿在森空岛官方社区讨论 Maa 相关工具，避免不必要风险
建议适度使用自动化，保留游戏核心体验

## 五、适合人群
上班族 / 学生党：没时间清日常，想高效养成
基建 / 资源党：讨厌重复操作，追求流水线效率
开荒玩家：专注剧情与探索，不想被琐事打断
矩阵 / 拼图苦手：AI 一键解题，不用查攻略

---

## 11. 破解游戏合集（2026-05-17）

> 近期破解游戏资源合集：生化危机9、黑神话悟空、剑星、Subnautica 2。

# 【破解游戏合集】四款热门游戏资源下载

---

## 目录

1. [生化危机9：安魂曲](#生化危机9安魂曲)
2. [黑神话：悟空](#黑神话悟空)
3. [剑星](#剑星)
4. [Subnautica 2：异星水域](#subnautica-2异星水域)

---

## 生化危机9：安魂曲

| **游戏名称** |                      生化危机：安魂曲                       |
| :----------: | :---------------------------------------------------------: |
| **发行日期** |                          2026/2/27                          |
| **破解日期** |                          2026/4/9                           |
| **DRM 保护** |                           Denuvo                            |
|  **破解组**  |                            Koyso                            |
| **下载地址** | [生化危机9: 安魂曲 下载](https://koysobackup.com/game/2654) |

*生化危机：安魂曲*将于**2026年2月27日**发售，登陆**PC (Steam平台)**、**PlayStation 5**、**Xbox Series X|S**和**Nintendo Switch 2**。该作由卡普空开发并发行，是生化危机系列的第九部正传作品。在《生化危机9》中，你将扮演FBI分析师格蕾丝·阿什克罗夫特（Grace Ashcroft），她被卷入一家与她母亲过去有着黑暗关联的酒店。游戏重返浣熊市，将生存恐怖与路径追踪、DLSS 4等现代技术以及第一人称和第三人称视角切换功能相结合。

### 版本 — 内含内容

**标准版**：游戏本体。

- **预购奖励**： **格蕾丝服装："末日"。**

**豪华版**：游戏本体 **+ "豪华套件"**，内含：

- **5套服装** (包括 **格蕾丝的"迪米特雷斯库"服装**)
- **4款武器皮肤** (包括 **S&S M232皮肤**)
- **2款"末日"滤镜**
- **浣熊先生挂件**
- **"浣熊市经典"音效包**
- **"1998年的信件"文件**

### 评测

*生化危机：安魂曲*看起来是一款既尊重经典恐怖元素又推动技术进步的续作。格蕾丝·阿什克罗夫特感觉像是一位脆弱的主角 — 她并非为残酷的战斗而生。你将探索走廊、解决谜题、管理补给，并尽量不要指望每次战斗都能如你所愿。

重返浣熊市令人感慨万千。在它被摧毁多年后再次看到它，重新找回了该系列曾经拥有的哥特式恐怖感。她调查的酒店不仅被怪物，也被记忆所萦绕——微妙的恐怖、晃动的阴影以及低语着看不见事物的房间。第一人称视角加剧紧张感；第三人称视角则提供更多喘息和规划的空间。

画面似乎是一流的。路径追踪使光照、反射和阴影比系列近期任何作品都更加逼真。DLSS 4和帧生成技术在不破坏视觉效果的情况下提升了帧率。但这意味着硬件配置将很重要——预计复杂光照的场景会给即使是性能不错的PC带来压力。

仍存在一些风险。Switch 2将不得不付出更多努力才能跟上——其画面保真度可能会有所下降。格蕾丝的故事偏向个人情感，对于渴望不间断动作的玩家来说可能会觉得节奏缓慢。尽管如此，这种慢节奏的铺垫赋予了恐怖感以分量。

**总结:** 生存恐怖的有望回归之作。《安魂曲》将技术升级与真实的恐惧感相结合。献给系列老玩家，以及准备好踏入恐惧世界的新玩家。

### PC系统配置要求

| 组件     | 最低配置                               | 推荐配置                                |
| -------- | -------------------------------------- | --------------------------------------- |
| 操作系统 | Windows 10 (64-bit)                    | Windows 11 (64-bit)                     |
| 处理器   | Intel Core i5-9600K / AMD Ryzen 5 3600 | Intel Core i7-10700K / AMD Ryzen 7 3700 |
| 内存     | 16 GB RAM                              | 16 GB RAM                               |
| 显卡     | GTX 1660 / RX 580                      | RTX 3060 / RX 6700 XT                   |
| 存储空间 | 50 GB SSD                              | 50 GB SSD                               |

### 如何下载

1. 点击下载按钮立即开始【[下载](https://koysobackup.com/game/2654)】
2. 下载完成后，右键.rar文件并点击解压到当前文件夹（使用WinRAR或7-zip）
3. 双击进入解压好的文件夹，找到.exe文件并运行
4. 玩。如果遇到丢失.dll错误，找到Redist或_CommonRedist文件夹，安装里面的程序

---

## 黑神话：悟空

| 游戏名称 |                   Black Myth: Wukong                   |
| :------: | :----------------------------------------------------: |
| 发行日期 |                       2024/8/19                        |
| 破解日期 |                       2026/4/28                        |
| DRM 保护 |                         Denuvo                         |
|  破解组  |                         Koyso                          |
| 下载地址 | [黑神话: 悟空 下载](https://koysobackup.com/game/2728) |

*《黑神话：悟空》*于2024年8月20日登陆PC和PlayStation 5平台，并于一年后，即2025年8月20日，登陆Xbox Series X|S。这是一款紧凑的、以Boss战为核心的动作角色扮演游戏，你将扮演天命之人，挥舞沉重的金箍棒，进行能够有效规避危险的短闪避，以及能创造出真实惩罚机会的格挡。战斗中途的变身可以打破固有的模式，而不仅仅是增加属性，游戏中的妖兽图鉴也深入挖掘了中国民间传说，在营造诡异氛围的同时，避免了流于俗套的奇幻设定。战斗逻辑清晰，动画生动传达意图，游戏鼓励玩家学习招式而非一味莽撞。

### 豪华版内容

- **铜云棒**
- **戏曲**装备套装（面具、护甲、护腕、战靴）
- **风铃**奇物
- **精选数字原声带**

### 评测

**战斗手感。** 悟空的招式简洁但富有表现力。短连击伤害高，硬直诚实，格挡窗口足够精确，值得学习而非盲目猜测。金箍棒打击感十足，有令人满意的"砰"声，一旦你开始将变身融入连招中，招式套路将变得更加丰富，而不会显得杂乱无章。

**Boss设计。** 战斗逻辑清晰——有明显的前摇提示，阶段变化是升级而非重置，战斗场地巧妙地引导玩家走位。少数Boss会依赖磨血战术或漫长的第二阶段，但大多数都奖励耐心、模式识别和巧妙的爆发时机。它充满挑战，但极少令人感到廉价。

**成长与构建。** 这并非一个拥有无限构建可能的沙盒游戏。成长路线集中：少量工具伴随着有意义的升级，而非海量的掉落物。优点在于清晰明了——你总能知道自己为何胜败。缺点是追求极致的玩家可能会渴望更多可调整的选项。

**视觉表现。** 游戏中的妖魔鬼怪融入了民间传说元素，使其个性鲜明；即使是"杂兵"也拥有独特的造型，而非简单的换皮。材质、光照和视觉特效让世界充满细节，同时不失可读性。音乐在恰当的时机响起，烘托出神话般的氛围。

**PC体验。** 游戏对配置要求较高。画面缩放技术（DLSS/FSR/XeSS）帮助很大，固态硬盘（SSD）是必不可少的。调整阴影和体积光通常能以最小的视觉损失换取最佳性能。手柄操作手感极佳；键鼠操作也尚可，但不如手柄自然。

**总结:** 一款专注、以Boss战为核心的动作游戏，拥有沉重的打击感、清晰可读的难度和充裕的风格。它尊重你的时间，但也会要求你去学习。

### PC系统要求

| 组件     | 最低配置                                                  | 推荐配置                                                     |
| -------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| 操作系统 | Windows 10 64位                                           | Windows 10 64位                                              |
| 处理器   | Intel Core i5-8400 / AMD Ryzen 5 1600                     | Intel Core i7-9700 / AMD Ryzen 5 5500                        |
| 内存     | 16 GB RAM                                                 | 16 GB RAM                                                    |
| 显卡     | NVIDIA GeForce GTX 1060 (6 GB) / AMD Radeon RX 580 (8 GB) | NVIDIA GeForce RTX 2060 / AMD Radeon RX 5700 XT / Intel Arc A750 |
| 存储空间 | 130 GB (推荐SSD)                                          | 130 GB (SSD)                                                 |

### 如何下载

1. 点击下载按钮立即开始【[下载](https://koysobackup.com/game/2728)】
2. 下载完成后，右键.rar文件并点击解压到当前文件夹（使用WinRAR或7-zip）
3. 双击进入解压好的文件夹，找到.exe文件并运行
4. 玩。如果遇到丢失.dll错误，找到Redist或_CommonRedist文件夹，安装里面的程序

---

## 剑星

| 游戏名称 |                    剑星                    |
| :------: | :----------------------------------------: |
| 发行日期 |                 2024/4/26                  |
| 破解日期 |                  2026/5/9                  |
|  破解组  |              Playzip【Koyso】              |
| 下载地址 | [剑星 下载](https://playzip.com/game/2780) |

领略由韩国开发商SHIFT UP倾情制作、广受好评的PlayStation®5人气大作《剑星》，现已针对PC进行优化。

人类的命运岌岌可危。地球为怪异而强大的生物所肆虐，惨遭遗弃。残存的人类余部已逃亡至位于外太空的拓殖区。

来自拓殖区的伊芙抵达满目疮痍的地球。她的任务明确：从破坏地球的邪恶生物孽奇拔手中收复失地，拯救人类。

但在逐一剿灭孽奇拔、探索人类文明遗迹的过程中，伊芙也逐渐拼凑起有关过去的真相。这时，她才意识到自己的任务并不那么简单。事实上，眼见并不一定为实……

手持利刃在残破不堪的地球上披荆斩棘，沉浸于眩目的疾速打斗。释放优雅又凌厉的连击，解锁新招式和武器升级，迎战史诗级头目，接受智慧与力量的双重挑战。

沉浸于细节逼真的后末日世界，享受融合唯美与惊悚的视效二重奏。

开启扣人心弦的人类命运之旅，您将全程探索各种深刻主题、发人深省的叙事和感人肺腑的真相。

### 如何下载

1. 点击下载按钮立即开始【[下载](https://playzip.com/game/2780)】
2. 下载完成后，右键.rar文件并点击解压到当前文件夹（使用WinRAR或7-zip）
3. 双击进入解压好的文件夹，找到.exe文件并运行
4. 玩。如果遇到丢失.dll错误，找到Redist或_CommonRedist文件夹，安装里面的程序

---

## Subnautica 2：异星水域

| 游戏名称 |                    Subnautica 2: 异星水域                    |
| :------: | :----------------------------------------------------------: |
| 发行日期 |                          2026/5/14                           |
| 破解日期 |                          2026/05/14                          |
|  破解组  |                       Playzip【Koyso】                       |
| 下载地址 | [Subnautica 2: 异星水域 下载](https://playzip.com/game/2808) |

《Subnautica 2：异星水域》是一款背景设定在全新外星世界的水下生存冒险游戏，也是由Unknown Worlds打造的《深海迷航》宇宙的最新篇章。

由于持续不断的冲突，故土已不再是宜居之所，幸而阿尔特拉为你们提供了一个开辟新生的机会。但当鸣蝉号载着你们这些拓荒人员前往新家园时，意外突然降临了。飞船的人工智能系统要求你继续执行任务。尽管被困异星，深陷几乎无法克服的困境，但你必须竭尽全力求得一线生机。人类在这个星球的未来，就掌握在你的手中。

### 单人游玩或与好友组队【破解不支持】

《Subnautica 2：异星水域》是一款以单人体验为核心的游戏，同时可与最多三名好友在线合作。游戏目前提供四名预设角色作为选择，在抢先体验阶段还将陆续推出更多角色和自定义选项。与好友携手探索这片被遗忘已久的废墟世界，学会适应这颗或许并不友好的星球。

### 适者生存

想要在深海中生存，并将这个星球打造成家园，就必须要学会充分利用身边的所有工具。驾驶蝌蚪号潜水器，探索生机勃勃的水下世界，穿越令人叹为观止的生物群落。设计基地，按需定制，让你的深潜冒险始终有个安全的归所。随着抢先体验版的不断开发，你也会获得更多工具、装备和载具。通过升级突破自己的极限，揭开淹没在这个奇异世界的诸多秘密。

### 如何下载

1. 点击下载按钮立即开始【[下载](https://playzip.com/game/2808)】
2. 下载完成后，右键.rar文件并点击解压到当前文件夹（使用WinRAR或7-zip）
3. 双击进入解压好的文件夹，找到.exe文件并运行
4. 玩。如果遇到丢失.dll错误，找到Redist或_CommonRedist文件夹，安装里面的程序
