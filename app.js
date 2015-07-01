var express = require('express');
var bodyParser = require('body-parser');
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
    // console.time('/db/api/clear/');
    // console.log('/db/api/clear/');
    common.clear(req.body, connection, function(code, response){
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/clear/');
    });
});

app.get('/db/api/status/', function(req, res){
    // console.time('/db/api/status/');
    // console.log('/db/api/status/');
    common.status(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/status/');
    });
});

app.post('/db/api/user/create/', function(req, res) {
    // console.time('/db/api/user/create/');
    // console.log('/db/api/user/create/');
    user.create(req.body, connection, function(code, response){
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/user/create/');
    });
});
app.post('/db/api/user/follow/', function(req,res){
    // console.time('/db/api/user/follow/');
    // console.log('/db/api/user/follow/');
    user.follow(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/user/follow/');
    });
});
app.post('/db/api/user/unfollow/', function(req, res) {
    // console.time('/db/api/user/unfollow/');
    // console.log('/db/api/user/unfollow/');
    user.unfollow(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/user/unfollow/');
    });
});
app.post('/db/api/user/updateProfile/', function(req, res) {
    // console.time('/db/api/user/updateProfile/');
    // console.log('/db/api/user/updateProfile/');
    user.updateProfile(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/user/updateProfile/');
    });
});
app.get('/db/api/user/listFollowers/', function(req, res){
    // console.time('/db/api/user/listFollowers/');
    // console.log('/db/api/user/listFollowers/');
    user.listFollowers(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/user/listFollowers/');
    });
});
app.get('/db/api/user/listFollowing/', function(req, res) {
    // console.time('/db/api/user/listFollowing/');
    // console.log('/db/api/user/listFollowing/');
    user.listFollowing(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/user/listFollowing/');
    });
});
app.get('/db/api/user/details/', function(req, res) {
    // console.time('/db/api/user/details/');
    // console.log('/db/api/user/details/');
    user.details(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/user/details/');
    });
});
app.get('/db/api/user/listPosts/', function(req, res) {
    // console.time('/db/api/user/listPosts/');
    // console.log('/db/api/user/listPosts/');
    user.listPosts(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/user/listPosts/');
    });  
});

app.post('/db/api/post/create', function(req, res) {
    // console.time('/db/api/post/create');
    // console.log('/db/api/post/create');
    post.create(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/post/create');
    });
});
app.get('/db/api/post/details/', function(req, res) {
    // console.time('/db/api/post/details/');
    // console.log('/db/api/post/details/');
    post.details(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/post/details/');
    })
});
app.get('/db/api/post/list/', function(req, res) {
    // console.time('/db/api/post/list/');
    // console.log('/db/api/post/list/');
    post.list(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/post/list/');
    }); 
});
app.post('/db/api/post/remove/', function(req, res) {
    // console.time('/db/api/post/remove/');
    // console.log('/db/api/post/remove/');
    post.remove(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/post/remove/');
    }); 
});
app.post('/db/api/post/restore/', function(req, res) {
    // console.time('/db/api/post/restore/');
    // console.log('/db/api/post/restore/');
    post.restore(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/post/restore/');
    });  
});
app.post('/db/api/post/update/', function(req, res) {
    // console.time('/db/api/post/update/');
    // console.log('/db/api/post/update/');
    post.update(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/post/update/');
    });    
});
app.post('/db/api/post/vote/', function(req, res) {
    // console.time('/db/api/post/vote/');
    // console.log('/db/api/post/vote/');
    post.vote(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/post/vote/');
    });  
});

app.post('/db/api/forum/create', function(req, res) {
    // console.time('/db/api/forum/create');
    // console.log('/db/api/forum/create');
    forum.create(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/forum/create');
    })
});
app.get('/db/api/forum/details', function(req, res) {
    // console.time('/db/api/forum/details');
    // console.log('/db/api/forum/details');
    forum.details(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        //console.timeEnd('/db/api/forum/details');
    })
});
app.get('/db/api/forum/listPosts', function(req, res) {
    // console.time('/db/api/forum/listPosts');
    // console.log('/db/api/forum/listPosts');
    forum.listPosts(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/forum/listPosts');
    })
});
app.get('/db/api/forum/listThreads', function(req, res) {
    // console.time('/db/api/forum/listThreads');
    // console.log('/db/api/forum/listThreads');
    forum.listThreads(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/forum/listThreads');
    })
});
app.get('/db/api/forum/listUsers', function(req, res) {
    // console.time('/db/api/forum/listUsers');
    // console.log('/db/api/forum/listUsers');
    forum.listUsers(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/forum/listUsers');
    })

});

app.post('/db/api/thread/close', function(req, res) {
    // console.time('/db/api/thread/close');
    // console.log('/db/api/thread/close');
    thread.close(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        console.timeEnd('/db/api/thread/close');
    })
});
app.post('/db/api/thread/create', function(req, res) {
    // console.time('/db/api/thread/create');
    // console.log('/db/api/thread/create');
    thread.create(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/create');
    })
});
app.get('/db/api/thread/details', function(req, res) {
    // console.time('/db/api/thread/details');
    // console.log('/db/api/thread/details');
    thread.details(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/details');
    })
});
app.get('/db/api/thread/list', function(req, res) {
    // console.time('/db/api/thread/list');
    // console.log('/db/api/thread/list');
    thread.list(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/list');
    })
});
app.get('/db/api/thread/listPosts', function(req, res) {
    // console.time('/db/api/thread/listPosts');
    // console.log('/db/api/thread/listPosts');
    thread.listPosts(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/listPosts');
    })
});
app.post('/db/api/thread/open', function(req, res) {
    // console.time('/db/api/thread/open');
    // console.log('/db/api/thread/open');
    thread.open(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/open');
    })
});
app.post('/db/api/thread/remove', function(req, res) {
    // console.time('/db/api/thread/remove');
    // console.log('/db/api/thread/remove');
    thread.remove(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/remove');
    })
});
app.post('/db/api/thread/restore', function(req, res) {
    // console.time('/db/api/thread/restore');
    // console.log('/db/api/thread/restore');
    thread.restore(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/restore');
    })
});
app.post('/db/api/thread/subscribe', function(req, res) {
    // console.time('/db/api/thread/subscribe');
    // console.log('/db/api/thread/subscribe');
    thread.subscribe(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/subscribe');
    })
});
app.post('/db/api/thread/unsubscribe', function(req, res) {
    // console.time('/db/api/thread/unsubscribe');
    // console.log('/db/api/thread/unsubscribe');
    thread.unsubscribe(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/unsubscribe');
    })
});
app.post('/db/api/thread/update', function(req, res) {
    // console.time('/db/api/thread/update');
    // console.log('/db/api/thread/update');
    thread.update(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/update');
    })
});
app.post('/db/api/thread/vote', function(req, res) {
    // console.time('/db/api/thread/vote');
    // console.log('/db/api/thread/vote');
    thread.vote(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
        // console.timeEnd('/db/api/thread/vote');
    })
});

app.listen(port);