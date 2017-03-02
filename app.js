var config = require(__dirname+"/env");//引入配置文件
var express = require("express");
var app = require("express")();
var server = require("http").Server(app);
var io = require("socket.io")(server);
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


//测试
app.get("/",function(req,res){
    redis.keys('*',function(err,result){
        console.log(result);
    });
    res.sendfile(__dirname + '/index.html');
});





