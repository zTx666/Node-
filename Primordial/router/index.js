const {addRouter,router} = require('../controllers/router');
addRouter('get','/',(res,data)=>{
    res.writeHead(301, {'Location': '/index.html'});
    res.end();
})
addRouter('get','/index',(res,data)=>{
    res.writeJson({
        time:new Date(),
        user:'xiaozhang'
    });
    res.end();
})
addRouter('get','/index2',(res,data)=>{
    res.writeJson({
        time:new Date(),
        user:'xiaozhang2'
    });
    res.end();
})