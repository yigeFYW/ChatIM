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


//定义链接
var sockets = {};
var names = {};

//路由
router.get("/",function(req,res){
    redis.keys('*',function(err,result){
        console.log(result);
    });
    //console.log(config.database);
    res.sendfile(__dirname + '/index.html');
});

// router.post("/register",function(req,res){
//     var nick_name = req.body.nick_name;
//     var sex = req.body.sex;
//     var province = req.body.province;
//     var city = req.body.city;
//     var area = req.body.area;
//     var jd = req.body.jd;
//     var wd = req.body.wd;
//     res.send("ok"+JSON.stringify(req.body));
// });


app.use("/",router);



io.on("connection",function(socket){
    //对于没有认证的不做任何事情
    var sid = socket.id.substr(2);
    sockets[sid] = socket;

    router.post("/register",function(req,res){
        var nick_name = req.body.nick_name;
        var sex = req.body.sex;
        var province = req.body.province;
        var city = req.body.city;
        var area = req.body.area;
        var jd = req.body.jd;
        var wd = req.body.wd;
        check_name(req.body).then(function(data){
            if(!data){
                res.send("有此人了");
                res.end();
            }
            return save_name(data);
        },function(err){
            console.log(err);
        }).then(function(data){
            res.send("ok"+JSON.stringify(req.body));
        });
    });



    //监听断开链接事件
    socket.on("disconnect",function(){
        delete sockets[socket.id];//删除用户
    });
});


//存入redis
function check_name(data) {
    return new Promise(function(resolve,reject){
        redis.sismember("socket:names",data.nick_name,function(err,result){
            if(err){
                reject(err);
            }else{
                if(result == 0) {
                    //可以注册
                    resolve(data);
                }else if(result == 1){
                    resolve(false);
                }
            }
        });
    });
}

function save_name(data){
    return new Promise(function(resolve,reject){
        redis.incr("socket:uid");
        redis.get("socket:uid",function(err,result){
            if(err){
                reject(err);
            }else{
                redis.hmset("socket:uid:"+result,data);
                //data.socketid = socket.id;
                redis.sadd("socket:names",data.nick_name,function(err,result){
                    if(err){
                        reject(err);
                    }else{
                        if(result == 1){
                            console.log(result);
                            resolve(data);
                        }
                    }
                });
            }
        });
    });
}

