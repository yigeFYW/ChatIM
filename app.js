var config = require(__dirname+"/env");//引入配置文件
var express = require("express");
var app = require("express")();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var bodyParser = require('body-parser');
var multer = require('multer');
var Redis = require("ioredis");
var redis = new Redis({
    port:config.database.redis.port || 6379,
    host:config.database.redis.host || "127.0.0.1",
    family:4,
    password:config.database.redis.password || null,
    db:config.database.redis.select || 0
});
server.listen(config.listen);
//静态文件库
app.use(express.static('public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
var router =  express.Router();



//测试
router.get("/",function(req,res){
    redis.keys('*',function(err,result){
        console.log(result);
    });
    //console.log(config.database);
    res.sendfile(__dirname + '/index.html');
});

router.post("/",function(req,res){
    console.log(req.body);
    res.send("ok"+JSON.stringify(req.body));
});



app.use("/",router);



