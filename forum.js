var user = require('./user.js');
var thread = require('./thread.js');
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

var getForumDetails = function (callback, short_name, connection) {
	connection.query('SELECT * FROM `forums` WHERE `short_name` = ?;', short_name, function (error, results, fields) {
		var res = results[0];
		if(error) console.log(error);
		callback(res);
	})


}

var create = function (data, connection, callback) {
	connection.query('INSERT INTO `forums` (`name`, `short_name`, `user`) VALUE (?, ?, ?);', [data.name, data.short_name, data.user],
		function (error, results, fields) {
			if(error) console.log(error);
			else {
				getForumDetails(function(response) {
					callback(0, response);
				}, data.short_name, connection);
			}

		})
}

var details = function (data, connection, callback) {
	getForumDetails(function(response) {
		if (data.related.indexOf('user') !== -1) {
				user.getUserDetails( function (userInfo) {
				response.user = userInfo;
				callback(0, response);
			}, response.user, connection);
		}
		else {
			callback(0, response);
		}
	}, data.forum, connection);
}

var listPosts = function (data, connection, callback) {
	var limit = '';
	if(!data.hasOwnProperty('order')) data.order = 'desc';
	if(!data.hasOwnProperty('since')) data.since = '0000-00-00 00:00:00';
	if(data.hasOwnProperty('limit')) {
		limit = ' LIMIT ' + data.limit;
	}
	connection.query('SELECT * FROM `posts` WHERE `forum` = ? AND `date` >= ? ORDER BY `date` ' + data.order + limit + ' ;',
			[data.forum, data.since], function (error, results, fields) {
				if(error) console.log(error);
				var res = results;
				res.forEach( function (item){
					item.date = moment(item.date).format("YYYY-MM-DD HH:mm:ss");
				})

				if (data.related) {

					var asyn = new MyAsync(function() {
						callback(0, res);
					});

				asyn.add(function(){
					if (data.related.indexOf('user') !== -1) {
						res.forEach( function(item, i, arr) {
							if(item.user){
								asyn.add(function(){
									user.getUserDetails( function (userInfo) {
									item.user = userInfo;
									asyn.check();
								}, item.user, connection)
								});
							}
						})
					}
				});

				//нужно ли рассмативать вложенных юзеров?

				asyn.add(function(){
					if(data.related.indexOf('forum') !== -1) {
						res.forEach( function(item, i, arr) {
							if(item.forum){
								asyn.add(function(){
									getForumDetails( function (forumInfo) {
									item.forum = forumInfo;
									asyn.check();
								}, item.forum, connection)
								});
							}
						})
					}
				});

				asyn.add(function(){
					if(data.related.indexOf('thread') !== -1) {
						res.forEach( function(item, i, arr) {
							if(item.thread){
								console.log(item.thread);
								asyn.add(function(){
									thread.getThreadDetails( function (threadInfo) {
									item.thread = threadInfo;
									asyn.check();
								}, item.thread, connection)
								});
							}
						})
					}
				});
				//опять же вложенность
				asyn.check();
				asyn.check();
				asyn.check();
				}
				else callback(0, res);
			});
}

var listThreads = function (data, connection, callback) {
	var limit = '';
	if(!data.hasOwnProperty('order')) data.order = 'desc';
	if(!data.hasOwnProperty('since')) data.since = '0000-00-00 00:00:00';
	if(data.hasOwnProperty('limit')) {
		limit = ' LIMIT ' + data.limit;
	}
	connection.query('SELECT * FROM `threads` WHERE `forum` = ? AND `date` >= ? ORDER BY `date` ' + data.order + limit + ' ;',
			[data.forum, data.since], function (error, results, fields) {
				if(error) console.log(error);

				var res = results;
				res.forEach( function (item){
					item.date = moment(item.date).format("YYYY-MM-DD HH:mm:ss");
				})

				if (data.related) {

					var asyn = new MyAsync(function() {
						callback(0, res);
					});

				asyn.add(function(){
					if (data.related.indexOf('user') !== -1) {
						res.forEach( function(item, i, arr) {
							if(item.user){
								asyn.add(function(){
									user.getUserDetails( function (userInfo) {
									item.user = userInfo;
									asyn.check();
								}, item.user, connection)
								});
							}
						})
					}
				});

				//нужно ли рассмативать вложенных юзеров?

				asyn.add(function(){
					if(data.related.indexOf('forum') !== -1) {
						res.forEach( function(item, i, arr) {
							if(item.forum){
								asyn.add(function(){
									getForumDetails( function (forumInfo) {
									item.forum = forumInfo;
									asyn.check();
								}, item.forum, connection)
								});
							}
						})
					}
				});

				// asyn.add(function(){
				// 	if(data.related.indexOf('thread') !== -1) {
				// 		res.forEach( function(item, i, arr) {
				// 			if(item.thread){
				// 				console.log(item.thread);
				// 				asyn.add(function(){
				// 					thread.getThreadDetails( function (threadInfo) {
				// 					item.thread = threadInfo;
				// 					asyn.check();
				// 				}, item.thread, connection)
				// 				});
				// 			}
				// 		})
				// 	}
				// });
				//опять же вложенность
				// asyn.check();
				asyn.check();
				asyn.check();
				}
				else callback(0, res);
			});
}

var listUsers = function (data, connection, callback) {
	var limit = '';
	if(!data.hasOwnProperty('order')) data.order = 'desc';
	if(!data.hasOwnProperty('since_id')) data.since_id = '0';
	if(data.hasOwnProperty('limit')) {
		limit = ' LIMIT ' + data.limit;
	};

	connection.query('SELECT DISTINCT `users`.`id`, `username`, `name`, `about`, `isAnonymous`, `email` FROM `users`'+
            'INNER JOIN `posts` ON `user` = `email` WHERE `forum` = ? AND `users`.`id` >= ?'+
            'ORDER BY `name` ' + data.order + limit +' ;',
			[data.forum, data.since_id], function (error, results, fields){
				if(error) console.log(error);
				// else if(results.length === 0) {
				// 	callback(1, 'error')
				// }
				else {
					var res = results;

					var asyn = new MyAsync(function() {
						callback(0, res);
					});

					asyn.add( function (){
						res.forEach( function (item, i, arr){
							// if (item.isAnonymous) {
							// 	item.isAnonymous = 'True';
							// }
							// else {
							// 	item.isAnonymous = 'False';
							// }
							asyn.add( function(){
								user.list_followers(item.id,function (array){
									item.followers = array;
									asyn.check();
								}, connection);
							});

							asyn.add( function(){
								user.list_following(item.id,function (array){
									item.following = array;
									asyn.check();
								}, connection);
							});

							asyn.add( function(){
								connection.query('SELECT `thread` FROM `users_threads` WHERE `user` = ?;', item.email, function (error, results, fields){
									if (error) {
									    console.log(error);
									}
									var array = [];
									results.forEach(function (item){
									    array.push(item.thread);
									});
									item.subscriptions = array;
									
									// item.subscriptions = results;
									asyn.check();
								});
							});

						});
					});

					asyn.check();

				}


			});
}


module.exports.details = details;
module.exports.listPosts = listPosts;
module.exports.listThreads = listThreads;
module.exports.listUsers = listUsers;
module.exports.getForumDetails = getForumDetails;
module.exports.create = create;