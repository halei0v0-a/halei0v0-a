---
title: 打造自己的Minecraft服务器控制面板
published: 2026-01-10
description: MCSManager详细教程。
tags: [工具]
category: 教程
draft: false
---



# 打造自己的Minecraft服务器控制面板：MCSManager详细教程

MCSManager Panel（简称MCSM Panel）是一个多语言、轻量级、开箱即用、支持多实例的Minecraft服务器控制面板，还支持Docker。它可以帮你在一台机器上同时管理多个游戏服务器，网页上点点鼠标就能开服、关服、看控制台、传文件，比手动敲命令省事得多，适合和朋友一起玩。

这篇从环境要求到安装配置，再到进阶用法，一步步说清楚。

## 1. 运行环境

MCSManager Panel可以在Windows和Linux平台上运行，不需要数据库，也不要求什么复杂系统配置。核心依赖只有一个：**Node.js**。

所需Node.js版本：14.17.6或更高。

如果系统里没有 Node.js，网上搜对应系统的安装方法装一个，版本别太老就行。

## 2. 安装

### Windows系统

Windows 下 MCSM Panel 已经编译成了一键运行版本，不用装环境：

1. 从官方网站下载：https://mcsmanager.com/
2. 下载后解压，运行启动脚本即可
3. 浏览器访问 `http://localhost:23333/` 进入面板

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

:::note

如果你打算关掉终端后服务还一直跑着，除了 systemd，也可以用我另一篇写的 [Screen 用法](/posts/post17linux新手实用指南/) 来挂着。

:::

如果安装脚本不起作用，可以尝试手动安装：

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

## 3. 首次登录

打开 `http://localhost:23333/`，第一次访问会要求你**设置管理员账号和密码**，设置完就能进面板了。这一步很重要，账号密码一定记好，忘了的话恢复很麻烦（后面权限管理部分会说）。

## 4. 开服流程（小白版）

1. **准备服务端**：去你的服务器提供商下载服务端文件（比如 Paper、Spigot 的 jar 包），放进一个单独的文件夹
2. **添加实例**：面板「实例」页面点「新建实例」，选择 Minecraft Java 版，指定服务端 jar 文件路径和启动内存（2G 起步，人越多越高）
3. **启动**：回到实例列表点启动，等控制台输出 `Done` 就说明开服成功了
4. **联机**：局域网的话直接连你电脑的局域网 IP；外网联机需要做端口映射或内网穿透

## 5. 数据目录

Web配置和数据：`/opt/mcsmanager/web/data/`

Daemon配置和数据：`/opt/mcsmanager/daemon/data/`

备份的时候优先备份这两个目录。

## 6. 升级

在每次升级之前，强烈建议备份数据目录。升级步骤参考：https://github.com/MCSManager/MCSManager/wiki/Update-MCSManager

## 7. 项目介绍

MCSManager Panel由三个项目组成，你在安装时使用的代码是编译和集成的结果。

- **Web后端**：控制中心，负责后端API、用户数据管理以及与守护程序的通信和身份验证。
- **前端/UI**：后端的用户界面，负责通过Web界面显示统计信息、发送请求以及与守护程序的通信。该项目的最终产品是纯静态文件。
- **守护程序**：被控制的远程节点，负责控制本地的所有实例和管理实际的实例进程。它能够与所有对象通信。

三个服务拆开的好处是：你可以在一台机器上跑 Web 面板，在好几台服务器上分别跑 Daemon，实现**一台面板管多台机器**。

## 8. 搭建开发环境

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

## 9. 浏览器兼容性

MCSManager Panel支持主流现代浏览器，如Chrome、Firefox、Safari和Opera。不再支持IE。

## 10. 国际化

MCSManager的国际化由Lazy、KevinLu2000、zijiren233和Unitwk完成。

## 11. 权限管理

控制面板在运行时会检查用户列表。如果没有可用用户，将创建一个默认的管理员用户。

如果你忘记了唯一的管理员帐户，你可以备份所有当前用户数据，生成一个新的管理员帐户，然后覆盖以前的帐户。

用户数据目录：`/opt/mcsmanager/web/data/Users/*.json`

# 结语

到这就把 MCSManager 从安装到开服的全流程走完了。面板本身不难，难的是把服务器调教好——端口映射、插件、性能参数这些，慢慢折腾吧。