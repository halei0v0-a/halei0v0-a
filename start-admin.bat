@echo off
chcp 65001 >nul
title 博客管理后台
cd /d "%~dp0"

echo ==========================================
echo   正在启动博客管理后台...
echo   地址: http://localhost:4830
echo   关闭窗口即停止服务
echo ==========================================
echo.

start "" "http://localhost:4830"
node admin/server.mjs

pause