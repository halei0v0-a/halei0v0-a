@echo off
chcp 65001 >nul
title 博客管理后台
cd /d "%~dp0"

rem ==========================================
rem   AI 小助手：密钥只在 EdgeOne Pages 环境变量中
rem   （TWIKOO_ADMIN_PASS / AI_ADMIN_KEY），本地无需配置
rem   模型/昵称/邮箱/网址：在后台「AI 小助手」页编辑，
rem   保存后 push 部署生效
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
