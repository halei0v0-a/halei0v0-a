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

:::warning[警告]

已证实LinuxONE的服务器不能用于生产力负载！仅可用于架构测试软件。自己想用来部署网站就别想了，一坨**💩**。建议自己买16一个月的2H2G香港云服务器。

:::

注册地址：[https://linuxone.cloud.marist.edu/#/register?flag=VM](https://linuxone.cloud.marist.edu/#/register?flag=VM)

:::note[注意]

注册完成后创建服务器大概有两个月左右的有效时间

:::

:::note[注意]

不要在这个服务器安装1panel等服务器运维面板，我就是手闲，服务器强制关机，账号登不上去，IP无法自动注册账户需审核(ˉ▽ˉ；)...

:::

## 服务器配置：

2核2G 50G硬盘

IP质量不高：148.100.76.62

国内连接速度快

## 如何连接服务器

建立ssh连接，创建服务器令牌时ssh连接密钥文件会同步下载到本地。

如：`halei.pem`

将文件放在`C:\用户\{你的用户名}\.ssh`目录下

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

### 详细条款

这就是正式条款全文，会**吊销访问权（revoked）**的违规行为如下：

**明确禁止的用途（条款 4-5）**

- 开发/测试/移植**商业闭源软件**——只能用于开源软件
- 任何**生产环境负载**（production workload）
- **压力测试、性能测试、基准测试**，发布测试结果也严格禁止

**禁止存储的数据（条款 9）**

- 医疗信息(PHI)、PCI/DSS 支付卡数据、FERPA 学生信息、GLB 银行数据、任何个人身份信息——被泄露需上报第三方的数据都不能放

**滥用行为（条款 12a）**

- 干扰服务、绕过提供的接口/指令用其他方式访问
- 违反出口管制法律（美国/纽约州法律）
- 过度使用网络/计算资源，或对云平台和其他用户造成风险 → 会被限流(throttle)甚至终止

**账户安全义务（条款 12c、13）**

- 不得用密码登录（只能用 SSH 密钥）
- 不得把 LinuxONE 密钥用于第三方应用
- 一个邮箱只能注册一个账户；账户下所有活动你负责（包括你授权的第三方）
- 必须及时安装安全更新，否则 IBM 不担责

**其他注意**

- 最长使用 120 天，到期资源被回收，需自行提前取回数据（条款 7）
- 无备份、无任何担保，按"AS-IS"提供（条款 6、19）
- 版权投诉（DMCA）会终止重复侵权者账户（条款 15）
- 涉嫌违规时 Marist/IBM 在**调查期间**就有权暂停服务（条款 12a）

### 被ban的日志

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

### **被ban的直接原因，对照条款：**

1. **条款 12c：禁止密码访问，只能用 SSH 密钥** 面板是网页+密码登录的管理工具，明晃晃地违反"Only SSH keys are allowed"。这是 Marist 监控里最显眼的违规信号。【这我能说啥？】
2. **条款 12a：对共享云平台造成风险** 面板会开放公网管理端口、内置弱密码/默认凭据，是全球扫描器的头号攻击目标。你的实例一旦被入侵，就会变成挖矿/扫描僵尸机，威胁整个共享云平台——管理员看到面板特征直接封，毫不犹豫。
3. **条款 4：只允许开源软件开发/测试** 面板属于服务器生产运维工具，用途不符这台机器的定位。

**结论：别再在这台机器上装任何管理面板了。** 这台免费机器的规则就是"纯 SSH 密钥 + 命令行 + 只做开源开发测试"。想要面板体验，去装个正经的 VPS 用；这台机器上用 `mc` / WinSCP / rsync 就够了

### 问了下AI

部署Halo技术上可以：Halo 是开源软件（GPL），Java 有 s390x 版本，能跑起来。但**大概率又会把你封了**，原因和上次一模一样：

- **公开博客 = 生产负载**：条款 4 明确禁止 production workload，Halo 装上去就是跑对外服务，不是"开发/测试"
- **要开公网端口**：默认 8090，又是扫描器重点目标，后台还是密码登录——正是上次被封的同一套模式
- 博客会存访客/评论等个人信息，踩到条款 9 的敏感数据红线
