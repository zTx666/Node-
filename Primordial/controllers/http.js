/**
 * 原生http服务
 */
const http = require("http");
const url = require("url");
const querystring = require("querystring");
const fs = require("fs");
const {
    Form
} = require("multiparty");
const zlib = require("zlib");
const {
    http_host,
    http_port,
    http_root,
    http_upload
} = require("../config");
const router = require("./router");
http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //服务器端设置跨源
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,FETCH");//接受请求方法
    res.writeJson = function (json) {
        res.setHeader("content-type", "application/json");
        res.write(JSON.stringify(json));
    };
    //根据不同方式来处理数据
    let {
        pathname,
        query
    } = url.parse(req.url, true); //用url的parse方法把url转化成json对象
    if (req.method == "POST") {
        /* 区分表单数据提交 文本形式 和 二级制形式 */
        if (req.headers["content-type"].startsWith("application/x-www-form-urlencoded")) {
            let arr = [];
            //以application/x-www-form-urlencoded开头是文本类型 默认需要拼接
            req.on("data", (buffer) => {
                arr.push(buffer);
            });
            req.on("end", () => {
                let post = querystring.parse(Buffer.concat(arr).toString());
                handle(req.method, pathname, query, post, {}); //写一个路由处理方法handle
            })
        } else { //如果开头不是文本类型的 就是上传文件
            let form = new Form({
                uploadDir: http_upload
            });
            form.parse(req);
            let post = {};
            let files = {};
            form.on("field", (name, value) => {
                post[name] = value;
            });
            form.on("file", (name, file) => {
                files[name] = value;
            })
            form.on("error", (err) => {
                console.log(err);
            })
            form.on("close", () => {
                //文件获取结束就去找文件路由对应的方式
                handle(req.method, pathname, query, post, files);
            })
        }
    } else {
        handle(req.method, pathname, query, {}, {});
    }
    /**
     * 
     * @param {*} method  get|post
     * @param {*} url   请求api
     * @param {*} get   get数据
     * @param {*} post  post数据
     * @param {*} files 文件数据
     */
    function handle(method, url, get, post, files) {
        //查找路由表
        let fn = router.findRouter(method, url);
        //如果没有找到说明是要文件
        if (!fn) {
            let filepath = http_root + pathname;
            fs.stat(filepath, (err, stat) => {
                if (err) {
                    console.log(filepath);
                    res.writeHead(404);
                    res.write("Not Found!");
                    res.end();
                } else {
                    //创建个文件流  并将它压缩后给浏览器
                    let rs = fs.createReadStream(filepath); //文件路径
                    let gz = zlib.createGzip();
                    rs.on("error", (err) => {
                        console.log(err);
                    })
                    //告诉浏览器是压缩文件
                    res.setHeader("content-encoding", "gzip");
                    rs.pipe(gz).pipe(res);
                }
            });
        } else { //说明有数据 就把数据带给路由处理
            fn(res, get, post, files);
        }
    }
}).listen(http_port);
console.log(`Server running at http://${http_host}:${http_port}/`);