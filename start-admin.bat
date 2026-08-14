@echo off
chcp 65001 >nul
title 博客管理后台
cd /d "%~dp0"

rem ==========================================
rem   AI 评论自动回复配置（可选，不填则 AI 回复功能不可用）
rem   通过系统环境变量配置，不要写入本文件或任何本地文件：
rem     setx TWIKOO_ADMIN_PASS "你的Twikoo管理密码"
rem     setx AI_ADMIN_KEY "你的OpenRouterKey"
rem   可选：
rem     setx OPENROUTER_MODEL "deepseek/deepseek-chat-v3-0324:free"
rem     setx TWIKOO_REPLY_NICK "halei0v0"
rem     setx TWIKOO_REPLY_EMAIL "你的博主邮箱(可选，填了评论会带站长标识)"
rem ==========================================

echo ==========================================
echo   正在启动博客管理后台...
echo   地址: http://localhost:4830
echo   关闭窗口即停止服务
echo ==========================================
echo.

start "" "http://localhost:4830"
node admin/server.mjs

pause
