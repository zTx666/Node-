# 初次使用 #
## 1.目录结构
+ config ---->服务配置文件 配置服务器端口、主机、静态文件位置以及数据库基本配置
    + config.dev ---->开发模式时使用的配置文件
    + config.prod ---->生产模式时使用的配置文件
    + index ---->根据process.env.OS=="Windows_NT"导出上面两个文件
+ controllers ---->控制层 主要服务层 
    + databases ---->数据库配置以及开启服务
    + http ---->http服务开启以及配置
    + router ---->控制路由
+ log ---->日志层
+ node_modules ---->依赖以及npm包
+ public ---->静态文件
    + js 
    + css 
    + img 
+ router ---->路由分配 以及 路由处理
    + index ---->全部路由处理
+ view ---->视图层 html 
    + index ---->主页
serve.js 开启服务

> 开启服务方式1： node serve.js 
> 开启服务方式2： npm start
