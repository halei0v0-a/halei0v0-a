---
title: Linux新手实用指南
published: 2026-08-13
description: 记录一些 Linux 下反复用到的实用操作：一条命令的快速搭建脚本，以及 Screen 会话管理的基本用法。
tags: [Linux,教程]
category: 教程
draft: false
---

# Linux新手实用指南

> 写给自己也写给刚接触 Linux 的朋友。这篇没有高深的东西，都是我在服务器和开发板上反复用到、每次都要翻笔记的操作，干脆整理成文。

## 快速搭建脚本

很多环境（尤其是开发板）第一次上手，最烦的就是装环境要敲一堆命令。我常用的做法是直接跑一段现成脚本，比如下面这条，是在 zero3 上快速部署用的：

```shell
wget -qO pi.sh https://cafe.cpolar.cn/wkdaily/zero3/raw/branch/main/zero3/pi.sh && chmod +x pi.sh && ./pi.sh
```

拆开看就三步：

1. `wget -qO pi.sh` 把脚本下载下来，`-q` 静默模式，`-O` 指定保存为 `pi.sh`
2. `chmod +x pi.sh` 给脚本加上执行权限
3. `./pi.sh` 直接运行

脚本跑完后，同目录下一般会多出一个类似 `LoCyanFrpPureApp-master.tar.gz` 的压缩包，这是内网穿透客户端的源码包。解压出来就能用了：

```shell
tar -zxvf LoCyanFrpPureApp-master.tar.gz
cd LoCyanFrpPureApp-master
```

内网穿透这个东西，简单说就是把没有公网 IP 的设备（比如家里的服务器、手上的开发板）暴露到公网上去，别人通过一个域名或者端口就能访问到。自己局域网里折腾的东西，配上它就能在外面访问了。

:::note

用网上的脚本前最好先看一眼内容，确认是官方或信得过的源再执行。毕竟是一行 `root` 权限跑完的东西。

:::

## Screen 命令的使用方法

Screen 是一个命令行工具，可以让你在一个物理终端里开多个虚拟会话。每个会话独立运行，**就算断开 SSH 连接，会话里的程序也不会停**。跑长任务（备份、传输、编译）的时候特别好用，不用一直挂着终端等它跑完。

### 创建新会话

```shell
screen -S session_name
```

`session_name` 是你给会话起的名字，方便之后认出它是干嘛的。

### 退出会话（让程序继续跑）

在会话里按 `Ctrl+a`，然后按 `d`。这会"分离"会话——你退出去了，但里面的程序照常运行。

### 查看已有的会话

```shell
screen -ls
```

会列出所有活动的会话，包括名字和状态。

### 重新进入会话

```shell
screen -r session_name
```

`session_name` 填你想回去的那个会话的名字。刚才分离的程序，回来就能接着看。

### 窗口操作

一个 Screen 会话里还能再开多个窗口，各跑各的：

| 快捷键 | 作用 |
| --- | --- |
| `Ctrl+a c` | 创建新窗口 |
| `Ctrl+a n` | 切换到下一个窗口 |
| `Ctrl+a p` | 切换到上一个窗口 |
| `Ctrl+a k` | 杀死当前窗口 |

### 删除会话

不需要的会话直接干掉：

```shell
screen -S session_name -X quit
```

## 写在后面（1）

常用的其实就这么多：一条脚本快速搭环境，`screen -S` 起会话、`Ctrl+a d` 分离、`screen -r` 回去，够应付绝大多数场景了。以后攒到新操作再往这篇里补。

## 认识你的 Linux

开始之前，先搞明白自己在跟什么打交道。

Linux 不是某一个系统，而是一大家子。你买 VPS 时看到的 Ubuntu、Debian、CentOS、AlmaLinux，都是"Linux 发行版"。它们内核一样，但包管理器和预装的东西不一样。不过别慌，命令 90% 通用，区别主要在装软件那一步，后面会单独讲。

打开终端后的界面叫 Shell，你现在敲的每一条命令，本质都是让 Shell 帮你执行一个程序。`ls`、`cd`、`mkdir` 这些，其实都是装在系统里的程序，只是太常用，大家都记成"命令"了。

## 连接服务器

拿到一台 VPS 或者开发板，第一步是连上去。

### SSH 登录

Windows 用户直接用 PowerShell，Mac 和 Linux 用终端，输入：

```shell
ssh root@你的服务器IP
```

`root` 是用户名，换成你自己创建的账号也行。第一次连会问你要不要信任这台机器，输 `yes` 回车，然后输密码，就进去了。

看到类似 `root@ubuntu:~#` 的提示符，恭喜，你已经站在服务器门口了。`~` 表示当前用户的家目录，`#` 表示你是 root，`$` 表示普通用户。

### 用密钥免密登录

密码登录每次都要敲，还怕被暴力破解。推荐直接上密钥：

```shell
ssh-keygen -t ed25519
```

一路回车，会在 `~/.ssh/` 下生成一对密钥：`id_ed25519`（私钥，别给别人）和 `id_ed25519.pub`（公钥，随便发）。

然后把你电脑上的公钥塞到服务器上：

```shell
ssh-copy-id root@你的服务器IP
```

之后再登录就不用输密码了。如果服务器上没这个命令，手动追加也行：

```shell
mkdir -p ~/.ssh
echo "你的公钥内容" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

:::note

`chmod` 后面那串数字叫权限位，`700` 是只有自己能读写执行，`600` 是只有自己能读写。密钥文件权限太松（比如 644），sshd 会直接拒绝用密钥登录，这是新手最容易踩的坑。

:::

## 文件和目录

### 在目录间穿梭

```shell
pwd          # 我现在在哪
ls           # 当前目录有什么
ls -la       # 连隐藏文件一起，带详细信息
cd /etc      # 绝对路径跳转
cd ..        # 回上一级
cd ~         # 回家目录
```

第一次见 `/etc`、`/var` 这些目录会懵，其实记住几个常用的就够了：

| 目录 | 装什么 |
| --- | --- |
| `/` | 根目录，一切从这里开始 |
| `/home` | 普通用户的家目录 |
| `/root` | root 的家目录 |
| `/etc` | 各种配置文件 |
| `/var/log` | 日志 |
| `/var/www` | 很多 Web 服务默认的网站目录 |
| `/tmp` | 临时文件，重启就清空 |

### 增删改查

```shell
mkdir blog            # 新建目录
touch test.txt        # 新建空文件
cp a.txt b.txt        # 复制
mv a.txt blog/        # 移动，也能当重命名用
rm test.txt           # 删文件
rm -rf blog/          # 删目录（-r 递归，-f 不询问）
cat a.txt             # 看文件全部内容
less a.txt            # 分页看，q 退出
head -n 20 a.txt      # 看前 20 行
tail -f /var/log/syslog   # 实时滚动看日志，Ctrl+C 退出
```

:::danger

`rm -rf` 没有回收站，删了就没了。特别是 `rm -rf /` 这种带根目录的，手一抖服务器就没了。慎用。

:::

### 在服务器上编辑文件

服务器上没有图形界面，改配置全靠终端编辑器。新手别一上来就学 vim，先用 nano：

```shell
nano /etc/nginx/nginx.conf
```

底部有快捷键提示：`Ctrl+O` 保存，`Ctrl+X` 退出，`Ctrl+W` 搜索。就这么简单。

vim 功能更强但学习曲线陡，等用熟了再碰也行。真要学就记住三个模式：按 `i` 进入编辑，`Esc` 退回普通模式，`:wq` 保存退出，`:q!` 不保存退出。够用。

## 用户和权限

### 为什么要建普通用户

一直用 root 干活方便是方便，但风险也大。正确姿势是建个普通用户，平时用他登录，需要管理员权限时临时借一下 root 的力：

```shell
adduser newuser          # 创建用户（会一步步问你密码等信息）
usermod -aG sudo newuser # 把用户加进 sudo 组（Debian/Ubuntu 系）
```

之后 `newuser` 登录，在命令前加 `sudo` 就能以管理员身份执行：

```shell
sudo apt update
```

### 文件权限到底怎么回事

每个文件都有三组权限，分别管"所有者、所属组、其他人"能不能"读（r=4）、写（w=2）、执行（x=1）"。

```shell
chmod 755 script.sh   # 所有者可读写执行，其他人只能读和执行
chmod 644 file.txt    # 所有者可读写，其他人只能读
chown user:group file # 改文件所有者
```

`755` 怎么来的：7=4+2+1，5=4+1。三位数字从左到右就是三组权限。网站根目录里的文件通常 644，目录 755，脚本要看情况给 755。

## 装软件：三个派系

Linux 装软件不像 Windows 下载安装包，而是用系统的包管理器，一条命令装完还自动处理依赖。

### Debian/Ubuntu 系

```shell
sudo apt update          # 先刷新软件源
sudo apt install nginx   # 安装
sudo apt upgrade         # 升级所有已装软件
sudo apt remove nginx    # 卸载
```

### CentOS/RHEL/Fedora 系

```shell
sudo dnf install nginx
sudo dnf update
sudo dnf remove nginx
```

老一点的 CentOS 7 用 `yum`，命令格式一样。

装好之后你可能会发现有些软件源里没有，这时候要么添加第三方源，要么直接去官网下编译好的包。新手阶段先别碰编译，等会了再说。

## 系统更新

刚买的 VPS 第一件事就是更新系统，把安全补丁打上：

```shell
sudo apt update && sudo apt upgrade
```

`&&` 的意思是前一条成功了才执行后一条。看到要改配置文件时，选"保持现有版本"（N 或 KEEP）一般最稳。

## 服务管理：systemd

现代 Linux 管理服务的统一工具是 systemd。装完的软件、你写的程序，都能注册成"服务"让它常驻后台、开机自启。

```shell
sudo systemctl start nginx      # 启动
sudo systemctl stop nginx       # 停止
sudo systemctl restart nginx    # 重启
sudo systemctl enable nginx     # 开机自启
sudo systemctl status nginx     # 看状态，按 q 退出
```

看到 `active (running)` 就是活着，`failed` 说明起不来，立刻 `journalctl -u nginx` 看日志找原因。

想让自己写的程序常驻，可以在 `/etc/systemd/system/` 下建一个 `.service` 文件：

```ini
[Unit]
Description=我的小服务

[Service]
ExecStart=/root/myapp/start.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

然后：

```shell
sudo systemctl daemon-reload
sudo systemctl enable myservice
sudo systemctl start myservice
```

## 防火墙：别把端口全敞开

云服务器通常有两道门：云控制台的"安全组"和系统自己的防火墙，两道都要放行。系统这侧新手用 `ufw`（Ubuntu 默认装了）：

```shell
sudo ufw allow 22        # 放行 SSH，千万别关 22 不放开
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable          # 启用，注意顺序，先把该放的放了
sudo ufw status          # 查看
```

放行之前先想清楚：这个端口是干嘛的？对外面要不要开？开得越少越安全。

## 日志：排查问题的主战场

服务挂了、网站 502、连不上数据库……一切问题都先去看日志。

```shell
journalctl -u nginx            # systemd 服务的日志
journalctl -u nginx -f         # 实时滚动
journalctl -u nginx --since "1 hour ago"
```

文件型日志在 `/var/log/` 下：

```shell
ls /var/log/
tail -f /var/log/nginx/error.log
```

报错看不懂也没关系，搜关键行（比如 `error`、`failed`），复制到搜索引擎，十有八九前人已经踩过。

## 实战：从零搭一个 Nginx 网站

理论说了一堆，来真的。目标：一台全新服务器，跑起一个网页，公网能访问。

### 第一步：更新系统

```shell
sudo apt update && sudo apt upgrade -y
```

### 第二步：装 Nginx

```shell
sudo apt install -y nginx
```

装完浏览器直接访问服务器 IP，看到 Nginx 欢迎页就成功了。

### 第三步：放自己的页面

```shell
sudo mkdir -p /var/www/blog
sudo nano /var/www/blog/index.html
```

写点内容：

```html
<!DOCTYPE html>
<html>
<head><title>我的第一个网站</title></head>
<body><h1>Hello, Linux!</h1></body>
</html>
```

### 第四步：改站点配置

```shell
sudo nano /etc/nginx/sites-available/blog
```

```nginx
server {
    listen 80;
    server_name 你的域名或者IP;

    root /var/www/blog;
    index index.html;
}
```

启用并测试：

```shell
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
sudo nginx -t          # 语法检查，显示 ok 再继续
sudo systemctl reload nginx
```

### 第五步：放行防火墙

```shell
sudo ufw allow 80
sudo systemctl enable nginx
```

### 第六步：内网穿透上线

如果是没公网 IP 的服务器（或者想用域名访问），回到文章开头那条脚本，把内网穿透跑起来，把本地 80 端口映射出去，一个能从外面访问的网站就完成了。

### 第七步：收尾检查

```shell
sudo systemctl status nginx   # 活着
curl -I http://127.0.0.1      # 本地请求看看响应
journalctl -u nginx | tail    # 有没有报错
```

## 新手常见坑

- **装完服务 404/502**：先 `systemctl status` 看服务死活，再查日志，别瞎调配置
- **端口被占**：`ss -tlnp` 看谁占着端口，或者换端口
- **权限不足**：网站目录文件权限不对就 755/644，服务起不来就去看 systemd 日志
- **忘了开防火墙**：本地通、外面不通，十有八九是防火墙或安全组没放行
- **断开连接程序就死**：用 `screen`（前面讲过）或者 systemd 把程序常驻

## 写在后面（2）

到这里，从 SSH 连接到搭起一个网站的全流程你就走了一遍。剩下的就是多折腾：配 HTTPS、装数据库、做定时任务……踩过的坑多了，就都会了。还是那句，这篇会持续补充，有新东西我会回来更新。