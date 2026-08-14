---
title: Aria2【Linux版本使用教程】
published: 2026-02-03
description: 关于磁力链接下载器Aria2的使用经验分享。
tags: [工具,Linux]
category: 工具分享
image: "https://n.sinaimg.cn/sinakd20201124s/224/w512h512/20201124/b36e-kefmphe2201724.png"
draft: false
---

# 【Linux】Aria2使用指南

## 1. 基本介绍

**aria2** 是一个轻量级、多协议的命令行下载工具，支持 **HTTP、HTTPS、FTP、SFTP、BitTorrent、Metalink** 等协议。它最厉害的一点是可以把同一个文件拆成多个连接同时下载，速度提升非常明显。服务器上挂下载任务，或者想下个大文件，用它就对了。

没有图形界面，所有操作靠一条命令完成，第一次用可能不习惯，用顺了会觉得比任何下载器都清爽。

## 2. 安装方法

### Debian/Ubuntu

```shell
sudo apt update
sudo apt install aria2
```

### CentOS/RHEL

```shell
sudo yum install aria2
```

### Fedora

```shell
sudo dnf install aria2
```

装完验证一下：

```shell
aria2c --version
```

能输出版本号就说明装好了。

## 3. 常用下载示例

### 单文件下载

```shell
aria2c http://example.com/file.zip
```

### 多文件下载

一条命令下载多个文件：

```shell
aria2c http://example.com/file1.zip http://example.com/file2.zip
```

### 断点续传

下载到一半断了，加个 `-c` 接着下，不用重新开始：

```shell
aria2c -c http://example.com/largefile.zip
```

### 多线程下载（4个连接）

```shell
aria2c -x 4 http://example.com/largefile.zip
```

`-x 4` 表示每个服务器最多开 4 个连接，文件越大提速越明显。

### 磁力链接下载

```shell
aria2c "magnet:?xt=urn:btih:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

直接把磁力链接丢给它就行，适合没有 BT 客户端的服务器环境。

## 4. 进阶功能

### 限速

下载太猛把带宽吃满会影响其他服务，限个速：

```shell
aria2c --max-download-limit=500K http://example.com/file.zip
```

### 指定下载目录

默认下到当前目录，想放到指定位置用 `-d`：

```shell
aria2c -d /path/to/directory http://example.com/file.zip
```

:::note

**指定目录**命令一定要记住，非常好用！下载目录自动创建，不用提前建。

:::

### 后台运行（守护进程）

服务器上挂着下载任务，不想占着终端，加 `--daemon`：

```shell
aria2c --daemon http://example.com/file.zip
```

:::note

**后台运行（守护进程）**命令一定要记住，非常好用！关掉 SSH 也不影响下载。

:::

### 使用配置文件

下载参数写多了，每次敲一遍很烦。可以写进配置文件 `~/.aria2/aria2.conf`：

```shell
continue=true
max-connection-per-server=4
dir=/path/to/downloads
max-download-limit=1M
```

然后这样运行：

```shell
aria2c --conf-path=/path/to/aria2.conf http://example.com/file.zip
```

配置文件里也可以直接写下载链接，之后只需要运行 `aria2c --conf-path=...`，它会自动读取文件里最后的部分作为下载地址。

### 启用 JSON-RPC 远程控制

这是 aria2 的灵魂功能：让它在后台跑着，随时通过接口给它派发下载任务。AriaNg、Aria2 Pro 之类的网页面板都是靠这个接口工作的：

```shell
aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all --rpc-listen-port=6800
```

默认端口 6800。开了 RPC 之后，配合网页面板（比如 AriaNg），浏览器里点点就能添加任务、看进度，体验和图形下载器没区别。

## 5. 实用技巧

### 静默模式

输出刷屏看着烦，安静点：

```shell
aria2c -q --show-console-readout=false http://example.com/file.zip
```

### 文件完整性校验

下载完自动校验文件完整性，防止下到损坏的文件：

```shell
aria2c --check-integrity http://example.com/file.zip
```

### 定时任务下载

配合 crontab，每天凌晨 3 点自动下载（先把下载地址写进配置文件更稳）：

```shell
0 3 * * * /usr/bin/aria2c -d /path/to/directory http://example.com/dailyfile.zip
```

## 6. 总结

aria2 在 Linux 下不仅支持多协议高速下载，还能通过 RPC 与网页面板或其他程序集成，非常适合服务器环境里做批量、自动化的下载任务。装机必备，值得一试。