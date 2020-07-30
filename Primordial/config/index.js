//判断环境导出不同环境配置数据
const process = require("process");
let mode = (process.env.OS=="Windows_NT"?"dev":"prod");//根据用户环境判断是开发模式还是生产模式
console.log("当前模式为"+(mode=="dev"?"开发模式":"生产模式"));
module.exports={
    mode,//k y相同 只写k
    ...(mode=="dev"?require("./config.dev"):require("./config.prod"))//解构对象 ES6 三个点（...）代表释放对象
};

