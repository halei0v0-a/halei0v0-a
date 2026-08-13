---
title: 免费两个月的低门槛服务器
published: 2026-08-13
description: 国内外低门槛免费社区服务器推荐。
tags: [云服务器]
category: 云服务器
draft: false
---

# LinuxONE Community Cloud

![LinuxONE Community Cloud](https://linuxone.cloud.marist.edu/resources/images/linuxone.png)

## LinuxONE社区云

注册地址：[https://linuxone.cloud.marist.edu/#/register?flag=VM](https://linuxone.cloud.marist.edu/#/register?flag=VM)

:::nite[注意]

注册完成后创建服务器大概有两个月左右的有效时间

:::

:::nite[注意]

不要在这个服务器安装1panel等服务器运维面板，我就是手闲，服务器强制关机，账号登不上去，IP无法自动注册账户需审核(ˉ▽ˉ；)...

:::

## 服务器配置：

2核2G 50G硬盘

IP质量不高：148.100.76.62

国内连接速度快

## 如何连接服务器

建立ssh连接，创建服务器令牌时ssh连接密钥文件会同步下载到本地。

如：`halei.pem`

将文件放在`C:\用户\{你的用户名}\\.ssh`目录下

win+R输入cmd打开命令行

建立ssh连接：

```shell
ssh -i ~/.ssh/halei.pem linux1@148.100.76.62
```

:::tip[提示]

默认用户名为linux1,后面加你的服务器地址，前面halei.pem按实际情况输入对应文件名

:::

## 快速搭建基本服务

推荐一个我用于搭建开发板的脚本，ssh连接成功后粘贴回车即可

```shell
wget -qO pi.sh https://cafe.cpolar.cn/wkdaily/zero3/raw/branch/main/zero3/pi.sh && chmod +x pi.sh && ./pi.sh
```

:::warning[警告]

一定一定不要安装1panle！我就被ban了，账户登不上去也无法重新注册，提示需1天审核。详细见补充

:::

:::note[脚本来源]

[wukongdaily/OrangePiShell: 在Linux上快速部署一些好用的docker项目。起初只是为了香橙派制作。推荐使用1panel面板轻松管理docker。](https://github.com/wukongdaily/OrangePiShell)

:::

## 问题和解决方法：

1.无法登录
解决方法：登录名`linux1`，密码：密钥文件
2.用户无权限
解决方法：`sudo su`
3.`sftp`无权限
解决方法：#给用户`linux1`授权目录/var/www/html
chown linux1 /var/www/html
4.外网无法访问端口
解决方法：sudo iptables -I INPUT -p tcp --dport <port#> -j ACCEPT

## 补充

```shell
[1Panel 2026-08-13 00:10:52 install Log]: ======================= 开始安装 =======================
设置1Panel安装目录 (默认为/opt):
[1Panel 2026-08-13 00:10:54 install Log]: 您选择的安装路径是 /opt
[1Panel 2026-08-13 00:10:54 install Log]: ... 在线安装Docker Compose
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 63.9M  100 63.9M    0     0  32.5M      0  0:00:01  0:00:01 --:--:-- 32.5M
[1Panel 2026-08-13 00:10:56 install Log]: Docker Compose安装成功
设置1Panel端口 (默认是 41047):
Broadcast message from root@onlyone (Thu 2026-08-13 00:10:57 UTC):

The system will power off now!


Broadcast message from root@onlyone (Thu 2026-08-13 00:10:57 UTC):

The system will power off now!


Broadcast message from root@onlyone (Thu 2026-08-13 00:10:57 UTC):

The system will power off now!

Connection to 148.100.76.62 closed by remote host.
Connection to 148.100.76.62 closed.
```

