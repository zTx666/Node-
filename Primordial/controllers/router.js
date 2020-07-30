//路由储存规则
/*{
    get:{
        "/reg":fn1,
        "login":fn2
    },
    post:{
        "/reg":fn1,
        "login":fn2
    }
    ···
}*/
let router = {};//把路由表每一个路由对应一个方法，作为json
/**
 * 
 * @param {get|post} method 
 * @param {api接口路径} url 
 * @param {处理方法 回调} fn 
 */
 function addRouter(method,url,fn){//每被调用就添加一个到路由表
    method = method.toLowerCase();
    url = url.toLowerCase();
    router[method] = router[method] || {};//最初是空对象允许为空，所以每添加一个重新赋值
    router[method][url] = fn;//区分完方式后根据不同路径使用不同的方法
}
//查找路由表
function findRouter(method,url){
    method = method.toLowerCase();
    url = url.toLowerCase();
    //判断是否存在该方式和该路径
    if(!router[method] || !router[method][url]){
        //没有该方式，也没有该路径 说明后台没有这种处理方式
        return null;
    }else{//否则说明有这种方式 把添加过后的路由方法返回 即处理方式
        return router[method][url];//对应的fn
    }
}
//导出这两个方法
module.exports = {
    addRouter,
    findRouter,
    router
}