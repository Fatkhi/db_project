var moment = require('moment');

function MyAsync(finalCallback) {
    this.finalCallback = finalCallback;
    this.counter = 0;
    this.data = {};
    this.add = function (callback) {
        this.counter++;
        callback();
    };
    this.check = function () {
        var that = this;
        this.counter--;
        if (this.counter == 0)
            process.nextTick(function () {
                that.finalCallback(that.data);
            });
    };
}

function getUserDetails(callback, email, connection){
    var user;
    var my_async = new MyAsync(callback);
    my_async.add(function() {
        connection.query('SELECT * FROM `users` WHERE `email` = ?;', email, function (error, results, fields) {
            if (error) {
                console.log(error);
            }
            user = results[0];
            my_async.data = results[0];
            //todo thread optimization + check performance

            my_async.add(function(){
                list_followers(user['id'], function(answer){
                    user.followers = answer;
                    my_async.data.followers = answer;
                    my_async.check();
                }, connection);
            });
            my_async.add(function(){
                list_following(user['id'], function(answer){
                    user.following = answer;
                    my_async.data.following = answer;
                    my_async.check();
                }, connection);
            });
            my_async.check();
        })
    });
    my_async.add(
        function(){
            connection.query('SELECT `thread` FROM `users_threads` WHERE `user` = ?;', email, function (error, results, fields) {
                if (error) {
                    console.log(error);
                }
                var array = [];
                results.forEach(function (item){
                    array.push(item.thread);
                });
                user.subscriptions = array;
                my_async.data.subscriptions = array;
                my_async.check();
            })
        }
    );

}

function list_following (user_id, callback, connection) {
	connection.query('SELECT `u1`.`email` FROM `users` AS `u1` IGNORE INDEX \
		(PRIMARY) INNER JOIN `follower_followee` AS `ff` ON `u1`.`id` = `ff`.`followee` WHERE `ff`.`follower` = ?;', user_id,
                      function(error, results, fields) {
                      	if (error) {
                      		console.log(error);
                      	}
                          var len = results.length;
                          var array = new Array(len);
                          for (var i = 0; i < len; i+=1) {
                              array[i] = results[i]['email'];
                          }
                          callback(array);
                      });
}

function list_followers (user_id, callback, connection) {
	connection.query('SELECT `u1`.`email` FROM `users` AS `u1` IGNORE INDEX (PRIMARY) \
                      INNER JOIN `follower_followee` AS `ff` ON `u1`.`id` = `ff`.`follower` \
                      WHERE `ff`.`followee` = ?;', user_id, 
                      function(error, results, fields) {
                      	if (error) {
                      		console.log(error);
                      	}
                          var len = results.length;
                          var array = new Array(len);
                          for (var i = 0; i < len; i+=1) {
                              array[i] = results[i]['email'];
                          }
                          callback(array);
                      });
}

var create = function(data, connection, callback){
	var code;
	var response;

	if (!data.hasOwnProperty('isAnonymous')) {
		data.isAnonymous = false;
    }
    connection.query('INSERT INTO users (email, username, name, about, isAnonymous) \
	 VALUE (?, ?, ?, ?, ?);', [data.email, data.username, data.name, data.about, data.isAnonymous],
		function(error, results, fields) {
			if (error) {
				//console.log(error);
				if (error.code === 'ER_DUP_ENTRY') {
					code = 5;
					response = 'user already exists';
				}
				else {
					code = 4;
					response = 'unknown error'
				}
			}
			else {
				code = 0;
				data.id = results.insertId;
				response = data;
			}
			callback(code, response);
	})
};

var follow = function(data, connection, callback){
	var follower = data.follower;
	var followee = data.followee;

	connection.query('INSERT INTO `follower_followee` (`follower`, `followee`)\
	SELECT `u1`.`id`, `u2`.`id` FROM `users` AS `u1` JOIN `users` AS `u2` \
	 ON `u1`.`email` = ? AND `u2`.`email` = ?;', [follower, followee],
        function(error, results, fields) {
			if (error) {
				console.log(error);
                if (error.code === 'ER_DUP_ENTRY') {
                	callback(5, "user already exists")
                }
			}
            else {
                getUserDetails(function(user) {
                	callback(0, user);
                },follower, connection);
            }
            //todo error codes everywhere
		});
};

var unfollow = function(data, connection, callback) {
    var follower = data.follower;
    var followee = data.followee;

    connection.query('SELECT `u1`.`id` AS `id_1`, `u2`.`id` AS `id_2` FROM `users` AS `u1`' +
        ' INNER JOIN `users` AS `u2` ON `u1`.`email` = ? AND `u2`.`email` = ?;', [follower, followee],
        function (error, results, fields) {
            connection.query('DELETE FROM `follower_followee` WHERE `follower` = ? AND `followee` = ?;', [Number(results[0].id_1), Number(results[0].id_2)],
                function (error, results, fields) {
                    getUserDetails(function(user) {
                    	callback(0, user);
                    },follower, connection);
                });
    });
};

var updateProfile = function(data, connection, callback) {
    var user = data.user;
    var about = data.about;
    var name = data.name;

    connection.query('UPDATE `users` SET `about` = ?, `name` = ? WHERE `email` = ?;', [about, name, user],
        function (error, results, fields) {
            getUserDetails(function(user) {
            	callback(0, user);
            },user, connection);
        });
};

var listFollowing = function(data, connection, callback) {
    var user = data.user;
    var since_id = data.since_id;
    var limit = data.limit;
    var order = data.order;

    if (typeof limit == 'undefined'){
        limit = '';
    }
    else {
        limit = ' LIMIT ' + limit;
    }
    if (typeof order == 'undefined'){
        order = 'desc';
    }
    if (typeof since_id == 'undefined'){
        since_id = '';
    }
    else {
        since_id = 'AND `u1`.`id` >=' + since_id;
    }

    if (typeof user == 'undefined') {
    	callback(5, 'user_listFollowing error')
    }
    else {
        connection.query('SELECT DISTINCT `u1`.* FROM `users` AS `u1`' +
            'JOIN `follower_followee` AS `ff` ON `u1`.`id` = `ff`.`followee`' +
            'JOIN `users` AS `u2` ON `ff`.`follower` = `u2`.`id`' +
            'WHERE `u2`.`email` = ? '+since_id+' ORDER BY `name` '+order+limit, user, function (error, results, fields) {
            if(error){
                console.log(error);
            }
            var len = results.length;
            var response = [];
            var asyn = new MyAsync(function(){
            	callback(0, response);
            });
            for (var i = 0; i < len; i+=1) {
                var func = function (user) {
                    response.push(user);
                    asyn.check();
                }
                asyn.add(function(){
                    getUserDetails(func, results[i].email, connection);
                });
            }
        })
    }
};

var listFollowers = function(data, connection, callback) {
    var user = data.user;
    var since_id = data.since_id;
    var limit = data.limit;
    var order = data.order;

    if (typeof limit == 'undefined'){
        limit = '';
    }
    else {
        limit = ' LIMIT ' + limit;
    }
    if (typeof order == 'undefined'){
        order = 'desc';
    }
    if (typeof since_id == 'undefined'){
        since_id = '';
    }
    else {
        since_id = 'AND `u1`.`id` >=' + since_id;
    }

    if (typeof user == 'undefined') {
    	callback(5, 'user_listFollowers error')
    }
    else {
        connection.query('SELECT DISTINCT `u1`.* FROM `users` AS `u1`' +
            'JOIN `follower_followee` AS `ff` ON `u1`.`id` = `ff`.`follower`' +
            'JOIN `users` AS `u2` ON `ff`.`followee` = `u2`.`id`' +
            'WHERE `u2`.`email` = ? '+since_id+' ORDER BY `name` '+order+limit, user, function (error, results, fields) {
            if(error){
                console.log(error);
            }
            var len = results.length;
            var response = [];
            var asyn = new MyAsync(function(){
            	callback(0, response);
            });
            for (var i = 0; i < len; i+=1) {
                var func = function (user) {
                    response.push(user);
                    asyn.check();
                }
                asyn.add(function(){
                    getUserDetails(func, results[i].email, connection);
                });
            }
        })
    }
};

var details = function(data, connection, callback) {
    var code = 0;
    var response;
	var email = data.user;
    if (typeof email == 'undefined') {
        code = 1;
        response = 'user_details error';
        callback(code, response);
    }
    else {
        getUserDetails(function(user) {
        	callback(0, user);
        },email, connection);
    }
}

var listPosts = function (data, connection, callback) {
	var limit = '';
	if(!data.hasOwnProperty('order')) data.order = 'desc';
	if(!data.hasOwnProperty('since')) data.since = '0000-00-00 00:00:00';
	if(data.hasOwnProperty('limit')) {
		limit = ' LIMIT ' + data.limit;
	}
	connection.query('SELECT * FROM `posts` WHERE `user` = ? AND `date` >= ? ORDER BY `date` ' + data.order + limit + ' ;',
			[data.user, data.since], function (error, results, fields) {
                var res = results;
                res.forEach( function (item){
                    item.date = moment(item.date).format("YYYY-MM-DD HH:mm:ss");
                })
				if(error) console.log(error);
				else callback(0, res);
			});
}

module.exports.list_followers = list_followers;
module.exports.list_following = list_following;

module.exports.getUserDetails = getUserDetails;
module.exports.create = create;
module.exports.listPosts = listPosts;
module.exports.follow = follow;
module.exports.unfollow = unfollow;
module.exports.updateProfile = updateProfile;
module.exports.listFollowing = listFollowing;
module.exports.listFollowers = listFollowers;
module.exports.details = details;