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

// app.all('*', function(req, res) {
//     res.send('lol');
// });

app.post('/db/api/clear/', function(req, res) {
    common.clear(req.body, connection, function(code, response){
        res.send(JSON.stringify({'code': code, 'response': response}));
    });
});

app.get('/db/api/status/', function(req, res){
    common.status(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    });
});

app.post('/db/api/user/create/', function(req, res) {
    user.create(req.body, connection, function(code, response){
        res.send(JSON.stringify({'code': code, 'response': response}));
    });
});
app.post('/db/api/user/follow/', function(req,res){
    user.follow(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    });
});
app.post('/db/api/user/unfollow/', function(req, res) {
    user.unfollow(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    });
});
app.post('/db/api/user/updateProfile/', function(req, res) {
    user.updateProfile(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    });
});
app.get('/db/api/user/listFollowers/', function(req, res){
    user.listFollowers(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    });
});
app.get('/db/api/user/listFollowing/', function(req, res) {
    user.listFollowing(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    });
});
app.get('/db/api/user/details/', function(req, res) {
    user.details(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    });
});
app.get('/db/api/user/listPosts/', function(req, res) {
    user.listPosts(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    });  
});

app.post('/db/api/post/create', function(req, res) {
    post.create(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    });
});
app.get('/db/api/post/details/', function(req, res) {
    post.details(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })
});
app.get('/db/api/post/list/', function(req, res) {
    post.list(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    }); 
});
app.post('/db/api/post/remove/', function(req, res) {
    post.remove(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    }); 
});
app.post('/db/api/post/restore/', function(req, res) {
    post.restore(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    });  
});
app.post('/db/api/post/update/', function(req, res) {
    post.update(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    });    
});
app.post('/db/api/post/vote/', function(req, res) {
    post.vote(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    });  
});

app.post('/db/api/forum/create', function(req, res) {
    forum.create(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })
});
app.get('/db/api/forum/details', function(req, res) {
    forum.details(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })
});
app.get('/db/api/forum/listPosts', function(req, res) {
    forum.listPosts(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })
});
app.get('/db/api/forum/listThreads', function(req, res) {
    forum.listThreads(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })
});
app.get('/db/api/forum/listUsers', function(req, res) {
    forum.listUsers(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })

});

app.post('/db/api/thread/close', function(req, res) {
    thread.close(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })
});
app.post('/db/api/thread/create', function(req, res) {
    thread.create(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })
});
app.get('/db/api/thread/details', function(req, res) {
    thread.details(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })
});
app.get('/db/api/thread/list', function(req, res) {
    thread.list(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })
});
app.get('/db/api/thread/listPosts', function(req, res) {
    thread.listPosts(req.query, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })
});
app.post('/db/api/thread/open', function(req, res) {
    thread.open(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })
});
app.post('/db/api/thread/remove', function(req, res) {
    thread.remove(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })
});
app.post('/db/api/thread/restore', function(req, res) {
    thread.restore(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })
});
app.post('/db/api/thread/subscribe', function(req, res) {
    thread.subscribe(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })
});
app.post('/db/api/thread/unsubscribe', function(req, res) {
    thread.unsubscribe(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })
});
app.post('/db/api/thread/update', function(req, res) {
    thread.update(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })
});
app.post('/db/api/thread/vote', function(req, res) {
    thread.vote(req.body, connection, function(code, response) {
        res.send(JSON.stringify({'code': code, 'response': response}));
    })
});

app.listen(port);