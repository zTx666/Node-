const express = require("express");
const body = require("body-parser");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const db = require("./libs/databases.js");
const fs = require("fs");
const multer = require("multer");
const {
    http_port,
    http_root,
    http_upload
} = require("./config");
const app = express();
let upload = multer({
    dest: 'www/uploads/touxiang/'
}); //配置muliter的文件上传路径
app.use(upload.any()); //引用中间件
app.use(body.urlencoded({ //在使用中间件的时候必须先把他绑定在req上，先use一下
    extended: false
}));
//配置监听8081 由nginx 80端口反向代理
app.listen(http_port);
//第一步 初始化连接数据库信息
var canReg = false;
//注册路由
app.post("/register", (req, res, next) => {
    let {
        username,
        psw
    } = req.body;
    db.query(`SELECT * FROM users WHERE name='${username}'`, (err, data) => {
        if (err) {
            console.log("数据库有错误！");
        } else if (data.length > 0) {
            res.write(JSON.stringify({
                error: 1, //有错就传到前台一个1
                msg: "User is existed!"
            }));
            res.end();
            canReg = false;
        } else { //没错返回前台一个0
            res.write(JSON.stringify({
                error: 0,
                msg: "User can use!"
            }));
            res.end();
            canReg = true;
        }
    })
})
//注册保存路由
app.post("/save", (req, res, next) => { //如果请求的地址是/save 就确认保存 
    if (canReg) {
        let {
            username,
            psw
        } = req.body;
        //把新注册的用户写入数据库
        db.query(`INSERT INTO users (name,password) VALUES ('${username}','${psw}')`, (err, data) => {
            if (err) {
                console.log("注册失败！");
            } else {
                res.send({
                    error: 0, //有错就传到前台一个1
                    msg: "注册成功!!"
                });
                canReg = false;
            }
        });
    } else {
        res.send({
            error: 1,
            msg: "User is existed!"
        }); //有错就传到前台一个1
    }
});

//引入sesion 使用中间件express-session
app.use(cookieParser('sessiontest'));
//session配置
app.use(session({
    secret: 'sessiontest', //与cookieParser中的一致 session的名字
    resave: true, //是否重新保存
    saveUninitialized: true,//无论有没有session cookie，每次请求都设置个session cookie
    cookie: {
        maxAge: 1000 * 60 * 20 
    }, //过期时间
}));
//主页渲染路由 判断登陆
app.post("/index_load", (req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*");
    if (req.session.isLoading) {
        let {
            name,
            status
        } = req.session.userData;
        res.send({
            error: 0,
            status,
            name
        });
    } else {
        req.session.originalUrl = req.originalUrl ? req.originalUrl : null;
        res.send({
            error: 1,
            msg: "请您先登录！"
        });
    }
})
//个人信息主页路由
app.post("/self", (req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*");
    if (req.session.isLoading) {
        db.query(`SELECT * FROM users WHERE name='${req.session.userData.id}'`, (err, data) => {
            if (err) {
                res.send({
                    error: 1,
                    msg: "获取失败，数据库有错误！",
                    user_data: req.session.userData
                });
            } else {
                res.send({
                    error: 0,
                    msg: "获取成功！",
                    data
                });
            }
        })
    } else {
        res.send({
            error: 1,
            msg: "获取失败！你可能没登陆哦"
        });
    }
})
//登录主页路由+后台检验
app.post("/login", (req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*");
    //如果路径是log 就是要登陆
    //1.拿到数据
    //2.校验数据 检查用户名是否存在
    //3.返回信息
    let {
        username,
        psw
    } = req.body;
    db.query(`SELECT * FROM users WHERE name='${username}'`, (err, data) => {
        if (err) {
            console.log("数据库有错误！");
        } else if (data.length === 0) { //如果不存在 就给一个错误信息
            res.send({
                error: 1,
                msg: "UserName is unexisted!"
            });
        } else if (data.length > 0) { //否则说明存在 就验证密码 密码不正确
            db.query(`SELECT * FROM users WHERE name='${username}' AND password='${psw}'`, (err, upsw) => {
                if (err) {
                    console.log("数据库有错误！");
                } else if (upsw.length === 0) {
                    res.send({
                        error: 2,
                        msg: "UserPsw is Wrong!"
                    });
                } else { //否则用户名密码都正确
                    //保存一个session
                    db.query(`SELECT * FROM users WHERE name='${username}'`, (err, data) => {
                        var userData = {
                            name: data[0].user_name, //获取昵称
                            id: data[0].name, //获取账号id
                            status: data[0].status, //获取身份状态
                            email: data[0].user_email, //获取邮箱
                            phone: data[0].user_phone, //获取电话
                            address: data[0].user_address, //获取地址
                            touxiang: data[0].user_img_src //获取头像路径
                        }
                        let loginTime = new Date();
                        console.log("登录时间：" + loginTime)
                        console.log("用户登陆信息" + JSON.stringify(userData));
                        req.session.isLoading = true;
                        req.session.userData = userData;
                        req.session.save();
                    });
                    res.send({
                        error: 0,
                        msg: "Yes!Logging in!"
                    });

                }
            })

        }
    });
})
//用户注销路由 销毁session
app.post("/exit", (req, res, next) => {
    if (req.session.isLoading) {
        let exitTime = new Date();
        console.log("退出时间：" + exitTime);
        console.log("用户登陆信息" + JSON.stringify(req.session.userData));
        req.session.destroy();
        res.send({
            error: 0,
            msg: "退出成功！"
        });
    } else {
        res.json({
            error: 1,
            msg: "请先登录！"
        });
    }
})
//用户信息更新路由
app.post("/self_alter", async (req, res, next) => {
    let {
        key,
        val
    } = req.body;
    if (req.session.userData.id) {
        try {
            let sql = "UPDATE users SET " + key + "='" + val + "' WHERE name=" + "'" + req.session.userData.id + "'";
            await db.query(sql);
            let alterTime = new Date();
            console.log("修改时间：" + alterTime);
            console.log("用户" + req.session.userData.id + "修改了" + req.body.key);
            res.send({
                error: 0,
                err_msg: "ok!"
            });
        } catch (e) {
            console.log(e);
            res.send({
                error: 1,
                info: "dadabase error"
            });
        }
    }
})
//头像上传目录
app.post("/uploadImg", (req, res, next) => {
    if (req.session.isLoading) {
        console.log(req.files);
        let imgName = req.session.userData.id + req.files[0].originalname;
        fs.rename(req.files[0].path, "www/uploads/touxiang/" + imgName, function (err) {
            if (err) {
                throw err;
            } else {
                console.log("上传成功！");
            }
        })
        let sql = "UPDATE users SET user_img_src='" + imgName + "' WHERE name=" + "'" + req.session.userData.id + "'"
        db.query(sql, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                console.log("ok");
                req.session.userData.touxiang = imgName;
            }
        })
    } else {
        res.redirect("/login.html");
    }
})

//留言的路由
app.post("/add", async (req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*");
    let {
        msg,name
    } = req.body;
    if(!req.session.isLoading){
        req.session.originalUrl = req.originalUrl ? req.originalUrl : null;
        res.send({
            error: 2,
            info: "error login"  
        });
    }
    else if (!msg) {
        res.send({
            error: 1,
            info: "params not null"
        });
    } else {
        if(!name || name==""){
            name="ztx";
        }
        try {
            await db.query(`INSERT INTO liuyan (msg,name) VALUES ('${msg}')`);
            let id = await db.query(`SELECT id FROM liuyan WHERE msg='${msg}'`);
            res.send({
                error: 0,
                err_msg: "ok!",
                id
            });
        } catch (e) {
            console.log(e);
            res.send({
                error: 1,
                info: "dadabase error"
            });
        }
    }

})

//删除留言
app.post("/del", async (req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*");
    let {
        id
    } = req.body;
    if (!id) {
        res.send({
            error: 1,
            info: "params not null"
        });
    } else {
        id = Number(id);
        if (isNaN(id)) {
            res.send({
                error: 1,
                info: "params invalid"
            });
        } else {
            try {
                await db.query(`DELETE FROM liuyan WHERE id='${id}'`);
                console.log("删除了" + id);
                res.send({
                    error: 0,
                    err_msg: "ok!",
                    id
                });
            } catch (e) {
                console.log(e);
                res.send({
                    error: 1,
                    info: "dadabase error"
                });
            }
        }
    }
})
//留言删除路由
app.post("/list", async (req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*");
    try {
        let data = await db.query(`SELECT * FROM liuyan`);
        res.send({
            error: 0,
            info: "ok",
            data
        });
    } catch (e) {
        console.log(e);
        res.send({
            error: 1,
            info: "dadabase error"
        });
    }
})
//静态资源访问
app.use(express.static(http_root));
console.log("访问了" + http_port);