var express = require('express');
var bodyParser = require('body-parser');
var bodyParse = require('./node_modules/parser.js');
var mysql = require('mysql');
var user = require('./user');
var post = require('./post');
var forum = require('./forum');
var thread = require('./thread');
var common = require('./common.js')

var arg = process.argv[2];

if(arg == 0) {
    var connection = mysql.createConnection({
      host     : '127.0.0.1',
      user     : 'petrosyan',
      password : 'root',
      database: 'forum_db0'
    });
    bodyParse.initialize();
    var port = 8081;
}
else if (arg == 1) {
    var connection = mysql.createConnection({
      host     : '127.0.0.1',
      user     : 'petrosyan',
      password : 'root',
      database: 'forum_db_prod'
    });
    var port = 8000;
}
else {
    var connection = mysql.createConnection({
      host     : '127.0.0.1',
      user     : 'petrosyan',
      password : 'root',
      database: 'forum_db'
    });
    var port = 8080;
}

//todo use pool connection for better results

var app = express();
app.use(bodyParser.json());
console.log(port);

app.post('/db/api/clear/', function(req, res) {
    bodyParse.init('/db/api/clear/', function(){
        common.clear(req.body, connection, function(code, response) {
            res.send(JSON.stringify({'code': code, 'response': response}));
    });
    }, res);
});

app.get('/db/api/status/', function(req, res){
    bodyParse.init('/db/api/status/', function(){
        common.status(req.query, connection, function(code, response) {
            res.send(JSON.stringify({'code': code, 'response': response}));
    });
    }, res);
});

app.post('/db/api/user/create/', function(req, res) {
    bodyParse.init('/db/api/user/create/', function(){
    user.create(req.body, connection, function(code, response){
        res.send(JSON.stringify({'code': code, 'response': response}));
    });
    }, res);
});
app.post('/db/api/user/follow/', function(req,res){
    bodyParse.init('/db/api/user/follow/', function(){
    user.follow(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    });
    }, res);
});
app.post('/db/api/user/unfollow/', function(req, res) {
    bodyParse.init('/db/api/user/unfollow/', function(){
    user.unfollow(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    });
}, res);
});
app.post('/db/api/user/updateProfile/', function(req, res) {
    bodyParse.init('/db/api/user/updateProfile/', function(){
    user.updateProfile(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/user/updateProfile/');
    });
    }, res);
});
app.get('/db/api/user/listFollowers/', function(req, res){
    bodyParse.init('/db/api/user/listFollowers/', function(){
    user.listFollowers(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    });
    }, res);
});
app.get('/db/api/user/listFollowing/', function(req, res) {
    bodyParse.init('/db/api/user/listFollowing/', function(){
    user.listFollowing(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    });
    }, res);
});
app.get('/db/api/user/details/', function(req, res) {
    bodyParse.init('/db/api/user/details/', function(){
    user.details(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/user/details/');
    });
    }, res);
    
});
app.get('/db/api/user/listPosts/', function(req, res) {
    bodyParse.init('/db/api/user/listPosts/', function(){
    user.listPosts(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/user/listPosts/');
    });  
    }, res);
});

app.post('/db/api/post/create/', function(req, res) {
    // console.time('/db/api/post/create');
    // console.log('/db/api/post/create');
    bodyParse.init('/db/api/post/create/', function(){
    post.create(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/post/create');
    });
    }, res);
});
app.get('/db/api/post/details/', function(req, res) {
    // console.time('/db/api/post/details/');
    // console.log('/db/api/post/details/');
    bodyParse.init('/db/api/post/details/', function(){
    post.details(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/post/details/');
    })
    }, res);
});
app.get('/db/api/post/list/', function(req, res) {
    // console.time('/db/api/post/list/');
    // console.log('/db/api/post/list/');
    bodyParse.init('/db/api/post/list/', function(){
    post.list(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/post/list/');
    }); 
    }, res);
});
app.post('/db/api/post/remove/', function(req, res) {
    // console.time('/db/api/post/remove/');
    // console.log('/db/api/post/remove/');
    bodyParse.init('/db/api/post/remove/', function(){
    post.remove(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/post/remove/');
    }); 
    }, res);
});
app.post('/db/api/post/restore/', function(req, res) {
    // console.time('/db/api/post/restore/');
    // console.log('/db/api/post/restore/');
    bodyParse.init('/db/api/post/restore/', function(){
    post.restore(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/post/restore/');
    });  
    }, res);
});
app.post('/db/api/post/update/', function(req, res) {
    // console.time('/db/api/post/update/');
    // console.log('/db/api/post/update/');
    bodyParse.init('/db/api/post/update/', function(){
    post.update(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/post/update/');
    }); 
    }, res);   
});
app.post('/db/api/post/vote/', function(req, res) {
    // console.time('/db/api/post/vote/');
    // console.log('/db/api/post/vote/');
    bodyParse.init('/db/api/post/vote/', function(){
    post.vote(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/post/vote/');
    });  
    }, res);
});

app.post('/db/api/forum/create/', function(req, res) {
    // console.time('/db/api/forum/create');
    // console.log('/db/api/forum/create');
    bodyParse.init('/db/api/forum/create/', function(){
    forum.create(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/forum/create');
    })
    }, res);
});
app.get('/db/api/forum/details/', function(req, res) {
    // console.time('/db/api/forum/details');
    // console.log('/db/api/forum/details');
    bodyParse.init('/db/api/forum/details/', function(){
    forum.details(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        //console.timeEnd('/db/api/forum/details');
    })
    }, res);
});
app.get('/db/api/forum/listPosts/', function(req, res) {
    // console.time('/db/api/forum/listPosts');
    // console.log('/db/api/forum/listPosts');
    bodyParse.init('/db/api/forum/listPosts/', function(){
    forum.listPosts(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/forum/listPosts');
    })
    }, res);
});
app.get('/db/api/forum/listThreads/', function(req, res) {
    // console.time('/db/api/forum/listThreads');
    // console.log('/db/api/forum/listThreads');
    bodyParse.init('/db/api/forum/listThreads/', function(){
    forum.listThreads(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/forum/listThreads');
    })
    }, res);
});
app.get('/db/api/forum/listUsers/', function(req, res) {
    // console.time('/db/api/forum/listUsers');
    // console.log('/db/api/forum/listUsers');
    bodyParse.init('/db/api/forum/listUsers/', function(){
    forum.listUsers(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/forum/listUsers');
    })
    }, res);

});

app.post('/db/api/thread/close/', function(req, res) {
    // console.time('/db/api/thread/close');
    // console.log('/db/api/thread/close');
    bodyParse.init('/db/api/thread/close/', function(){
    thread.close(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/close');
    })
    }, res);
});
app.post('/db/api/thread/create/', function(req, res) {
    // console.time('/db/api/thread/create');
    // console.log('/db/api/thread/create');
    bodyParse.init('/db/api/thread/create/', function(){
    thread.create(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/create');
    })
    }, res);
});
app.get('/db/api/thread/details/', function(req, res) {
    // console.time('/db/api/thread/details');
    // console.log('/db/api/thread/details');
    bodyParse.init('/db/api/thread/details/', function(){
    thread.details(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/details');
    })
    }, res);
});
app.get('/db/api/thread/list/', function(req, res) {
    // console.time('/db/api/thread/list');
    // console.log('/db/api/thread/list');
    bodyParse.init('/db/api/thread/list/', function(){
    thread.list(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/list');
    })
    }, res);
});
app.get('/db/api/thread/listPosts/', function(req, res) {
    // console.time('/db/api/thread/listPosts');
    // console.log('/db/api/thread/listPosts');
    bodyParse.init('/db/api/thread/listPosts/', function(){
    thread.listPosts(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/listPosts');
    })
    }, res);
});
app.post('/db/api/thread/open/', function(req, res) {
    // console.time('/db/api/thread/open');
    // console.log('/db/api/thread/open');
    bodyParse.init('/db/api/thread/open/', function(){
    thread.open(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/open');
    })
    }, res);
});
app.post('/db/api/thread/remove/', function(req, res) {
    // console.time('/db/api/thread/remove');
    // console.log('/db/api/thread/remove');
    bodyParse.init('/db/api/thread/remove/', function(){
    thread.remove(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/remove');
    })
    }, res);
});
app.post('/db/api/thread/restore/', function(req, res) {
    // console.time('/db/api/thread/restore');
    // console.log('/db/api/thread/restore');
    bodyParse.init('/db/api/thread/restore/', function(){
    thread.restore(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/restore');
    })
    }, res);
});
app.post('/db/api/thread/subscribe/', function(req, res) {
    // console.time('/db/api/thread/subscribe');
    // console.log('/db/api/thread/subscribe');
    bodyParse.init('/db/api/thread/subscribe/', function(){
    thread.subscribe(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/subscribe');
    })
    }, res);
});
app.post('/db/api/thread/unsubscribe/', function(req, res) {
    // console.time('/db/api/thread/unsubscribe');
    // console.log('/db/api/thread/unsubscribe');
    bodyParse.init('/db/api/thread/unsubscribe/', function(){
    thread.unsubscribe(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/unsubscribe');
    })
    }, res);
});
app.post('/db/api/thread/update/', function(req, res) {
    // console.time('/db/api/thread/update');
    // console.log('/db/api/thread/update');
    bodyParse.init('/db/api/thread/update/', function(){
    thread.update(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/update');
    })
    }, res);
});
app.post('/db/api/thread/vote/', function(req, res) {
    // console.time('/db/api/thread/vote');
    // console.log('/db/api/thread/vote');
    bodyParse.init('/db/api/thread/vote/', function(){
    thread.vote(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/vote');
    })
    }, res);
});

app.listen(port);