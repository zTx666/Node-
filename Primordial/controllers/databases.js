//数据库初始化配置 
const mysql = require("mysql");
const co = require("co-mysql");//引入co-mysql方法 将数据库操作变成异步
//引入配置文件
const {db_host,db_port,db_user,db_psw,db_name} = require("../config/index");
let con = mysql.createPool({//设置数据库
    host:db_host,
    port:db_port,
    user:db_user,
    password:db_psw,
    database:db_name
});
module.exports = co(con);//导出设置完成后的异步数据库