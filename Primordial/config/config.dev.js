//开发模式
//数据库基础数据以及服务端口路径配置
const path = require("path");
module.exports={
    //数据库配置
    db_host:"localhost",//服务器地址
    db_port:3306,//服务器数据库端口
    db_user:"",//数据库用户名
    db_psw:"",//数据库密码
    db_name:"test",//要用的数据库
    //http服务配置
    http_host:'localhost',
    http_port:8081,//服务访问的端口
    http_root:path.resolve(__dirname,"../views/"),//服务访问的文件根目录
    http_upload:path.resolve(__dirname,"../public/upload"),//服务上传文件的目录
};
