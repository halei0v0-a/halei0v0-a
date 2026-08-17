---
title: "OrangePi Zero3部署独角数卡网店（Dujiao-Next）完整教程"
published: 2026-08-17
description: "从零开始在 Orange Pi Zero 3（1GB 内存）上部署 Dujiao-Next 数字商品商城，包含系统内存优化、Cloudflare Tunnel 内网穿透、常见坑位避雷与广告屏蔽。"
tags: [OrangePi, Dujiao-Next, 独角数卡, Cloudflare, 自托管]
category: 教程
draft: false
comment: true
---

# OrangePi Zero3部署独角数卡（Dujiao-Next）完整教程

> 一台 1GB 内存的 Orange Pi Zero 3，跑起一套完整的数字商品商城（发卡系统），再用 Cloudflare Tunnel 免费打通公网访问。本文记录完整搭建过程、踩坑经历和优化方案。快速搭建运维服务和国内快速安装docker请参照[**Linux新手实用指南**](https://blog.halei0v0.ccwu.cc/posts/post17linux%E6%96%B0%E6%89%8B%E5%AE%9E%E7%94%A8%E6%8C%87%E5%8D%97/)开头的OrangePi Zero3快速搭建脚本

## 使用设备

| 项目 | 配置 |
| --- | --- |
| 开发板 | Orange Pi Zero 3 |
| 内存 | 981Mi（1GB） |
| 系统 | Orange Pi OS 1.0.2 Jammy（Ubuntu 22.04，内核 6.1.31-sun50iw9，arm64） |
| 存储 | 58G eMMC + 外接 7.5G 硬盘 |
| 价格 | 百元左右 |
| 环境 | 家庭局域网 |

## 涉及的服务

- **Dujiao-Next v1.4.3**：Go 编写的数字商品电商平台（前台店铺 + 后台管理 + SQLite）
- **Redis**：异步任务队列（asynq）依赖，下单发货等任务处理
- **Cloudflare Tunnel（cloudflared 2026.8.2）**：免费内网穿透，公网 HTTPS 访问

:::warning[注意]

Cloudflare Tunnel使用需要绑定信用卡！！！但是是免费套餐！

:::

- **一个绑定在Cloudflare的域名**

  > 免费域名获取指南参考[**DNSHE免费域名获取指南**](https://blog.halei0v0.ccwu.cc/posts/post21dnshe免费域名获取指南)

---

## 第一步：系统内存优化（1GB 必做）

跑任何重服务前，先把 1GB 内存榨干价值。之前我的开发板原始状态：空闲仅 61Mi，swap 占用 166Mi。

### 1.1 换用 zram 交换空间

系统自带 490M 磁盘级 zram，但参数不可控。用 zram-tools 接管：

```bash
apt install zram-tools
systemctl disable --now orangepi-zram-config   # 先禁系统自带的
echo 'ALGO=zstd' > /etc/default/zramswap
echo 'SIZE=512' >> /etc/default/zramswap
systemctl enable --now zramswap
```

> **坑位**：直接启动 zramswap 会报 `Device or resource busy`——因为系统自带服务已初始化了 zram 设备。先 `swapoff -a`、重置设备（`echo 1 > /sys/block/zramN/reset`）、卸载模块（`modprobe -r zram`）后再启动。

### 1.2 调低 swappiness

默认 60 导致内存没用完就疯狂写 swap，调成 10：

```bash
echo "vm.swappiness=10" > /etc/sysctl.d/99-swap.conf
sysctl -p /etc/sysctl.d/99-swap.conf
```

### 1.3 精简服务

```bash
# 砍掉重复的面板（1Panel 和 CasaOS 二选一）
systemctl disable --now casaos casaos-app-management casaos-message-bus casaos-local-storage
systemctl disable --now packagekit   # 图形更新后台，纯 SSH 用户用不到
```

优化效果：**used 466Mi → 325Mi，available 434Mi → 554Mi**。

---

## 第二步：部署 Dujiao-Next

### 2.1 下载安装（arm64）

```bash
mkdir -p /opt/dujiao-next && cd /opt/dujiao-next
wget https://github.com/dujiao-next/dujiao-next/releases/download/v1.4.3/dujiao-next_v1.4.3_Linux_arm64.tar.gz
tar -xzf dujiao-next_v1.4.3_Linux_arm64.tar.gz
cp config.yml.example config.yml
```

> **坑位**：国内 GitHub 直连只有 60-120KB/s，19M 的包下了 5 分钟，可用 ghproxy 镜像加速：`https://mirror.ghproxy.com/https://github.com/...`

### 2.2 配置密钥（重点坑位）

配置文件是 **YAML 嵌套结构**，密钥在 `app:` / `jwt:` / `user_jwt:` 区块下，键名只是 `secret_key:` / `secret:`。直接匹配 `jwt.secret:` 会**静默失败**（sed 匹配不到，配置保持默认值，启动时警告"密钥过弱"）。

正确做法——按默认值精确替换：

```bash
K1=$(openssl rand -hex 32); K2=$(openssl rand -hex 32); K3=$(openssl rand -hex 32)
sed -i "0,/secret_key: your-secret-key-change-in-production-please/s//secret_key: $K1/" config.yml
sed -i "0,/secret: your-secret-key-change-in-production-please/s//secret: $K2/" config.yml
sed -i "0,/secret: user-secret-key-change-in-production-please/s//secret: $K3/" config.yml
```

> **另一个坑**：base64 密钥里含 `/` 会破坏 sed 的 `/` 分隔符（`unknown option to 's'`）。改用 `openssl rand -hex`（纯十六进制）或 sed 用 `|` 分隔符。

### 2.3 安装 Redis

不装的话启动后 asynq 疯狂刷 `dial tcp 127.0.0.1:6379: connection refused`：

```bash
apt install -y redis-server
systemctl enable --now redis-server
redis-cli ping    # PONG
```

### 2.4 试运行 + systemd 托管

```bash
./dujiao-next    # 看到 app_start 0.0.0.0:8080 即成功
```

```ini
# /etc/systemd/system/dujiao-next.service
[Unit]
Description=Dujiao-Next
After=network.target redis-server.service

[Service]
WorkingDirectory=/opt/dujiao-next
ExecStart=/opt/dujiao-next/dujiao-next
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload && systemctl enable --now dujiao-next
```

访问 `http://IP:8080`（前台）和 `http://IP:8080/admin`（后台，默认账号 admin/admin123，**上线前务必改掉**）。

### 2.5 磁盘坑位：/var/log 被写满

Orange Pi 的日志盘是 50M 的 RAM 盘（orangepi-ramlog），sysstat 每天生成 536K 的 sar 统计文件，攒 48 个就把 50M 吃满，导致 `dpkg: cannot write to log file` 无法装任何包。

```bash
# 清理：只留最新 3 个 sar
cd /var/log/sysstat && ls -t sar* | tail -n +4 | xargs rm -f
# 限制保留天数
sed -i 's/^HISTORY=.*/HISTORY=7/' /etc/sysstat/sysstat
```

---

## 第三步：Cloudflare Tunnel 公网访问

免费、免备案、自带 HTTPS，比传统内网穿透更稳。

:::warning[注意]

要使用这项服务必须开通ZERO TRUST服务【有免费套餐】，之前使用网站BUG跳过绑卡环节的账户依旧可以使用，但新账户需要绑卡才能使用。【我也是注册了新号才发现的，BUG被修复了。。。。】

:::

### 3.1 安装 cloudflared（arm64）

```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -O /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared
cloudflared version
```

### 3.2 创建远程管理隧道

Zero Trust 面板 → **Networks → Tunnels → Create a tunnel**，复制 token，然后：

```bash
cloudflared service install <你的TOKEN>
```

自动生成 systemd 服务，开机自启、崩溃自动恢复：

```bash
systemctl status cloudflared   # active (running)
```

### 3.3 配置公网域名

面板 → 隧道 → **Public Hostname → Add**：

| 子域 | Service 类型 | URL |
| --- | --- | --- |
| shop.你的域名 | HTTP | localhost:8080 |
| ssh.你的域名 | SSH | localhost:22 |

添加时 Cloudflare 自动创建 CNAME（指向 `隧道ID.cfargotunnel.com`），1-2 分钟后生效。

### 3.4 502 排错

访问报 `502 Bad Gateway` 时按顺序排查：

1. **源站活着吗**：`curl -s http://127.0.0.1:8080/health` → 应返回 `{"status":"ok"}`
2. **隧道活着吗**：`journalctl -u cloudflared -n 20` → 应有 `Registered tunnel connection`
3. **Service 写法**：必须是 `http://localhost:8080`（不是 `https://`、不是其他端口）
4. **DNS**：域名必须托管在隧道账号的 Cloudflare DNS 里，CNAME 记录存在且开启代理（橙色云）

---

## 第四步：去掉后台广告

Dujiao-Next 后台运营仪表盘内置广告组件（`DashboardAd.vue`，从官方广告平台 `ads-gateway.dujiao-next.com` 拉取赞助商广告，带印象统计）。前端设计为"拉取失败则静默隐藏"，所以屏蔽广告网关即可，不影响任何功能：

```bash
echo "127.0.0.1 ads-gateway.dujiao-next.com" >> /etc/hosts
systemctl restart dujiao-next
```

验证：`curl -sI --max-time 5 https://ads-gateway.dujiao-next.com` 返回 exit 7（连接失败）即屏蔽成功。

> 其他域名（api.github.com 更新检查、api.telegram.org、支付网关）别动，只屏蔽 ads-gateway。

---

## 最终状态

| 服务 | 状态 | 内存 |
| --- | --- | --- |
| dujiao-next | systemd 自启 | ~10M |
| redis-server | systemd 自启 | ~20M |
| cloudflared | systemd 自启 | ~18M |
| zram swap (512M zstd) | systemd 自启 | 压缩内存 |

`free -h`：used 329Mi / available 562Mi，1GB 板子跑商城绰绰有余。

## 安全建议

1. **立刻改掉 admin 默认密码**，后台开启 2FA
2. 修改后台路径：config.yml 里 `web.admin_path` 改成不易猜测的字符串
3. 只放行必要端口（`ufw allow 8080`），SSH 建议改非 22 端口
4. 定期备份 `/opt/dujiao-next/db/`（SQLite 数据库）

## 总结

1GB 内存的小板子完全跑得动 Go 编写的 Dujiao-Next：系统优化（zram + swappiness + 服务精简）+ 单二进制部署 + Redis + Cloudflare Tunnel，整套下来内存占用不到 40%，稳定运行。最大的坑不在应用本身，而在系统细节——YAML 嵌套密钥、ramlog 日志盘、zram 设备占用——搞定这三处，部署一路畅通。
