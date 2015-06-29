var user = require('./user.js');
var forum = require('./forum.js');
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

function getThreadDetails (callback, id, connection) {
	connection.query('SELECT * FROM `threads` WHERE `id` = ?;', id, function (error, results, fields) {
		var res = results[0];
		if(res !== undefined) {
			res.date = moment(res.date).format("YYYY-MM-DD HH:mm:ss");
		}
		if(error) console.log(error);
		else callback(res);
	})
}

var create = function (data, connection, callback) {
	if(!data.hasOwnProperty('isDeleted')) data.isDeleted = false;
	connection.query('INSERT INTO `threads`(`isDeleted`, `forum`, `title`, `isClosed`, `user`, `date`, `message`, `slug`)'+
		'VALUE (?, ?, ?, ?, ?, ?, ?, ?);', [data.isDeleted, data.forum, data.title, data.isClosed, data.user, data.date,
		data.message, data.slug],
		function (error, results, fields) {
			if(error) console.log(error);
			else {
				data.id = results.insertId;
				callback(0, data);
			}
		})
}

var close = function (data, connection, callback) {
	connection.query('UPDATE `threads` SET `isClosed` = TRUE WHERE `id` = ?;', data.thread,
		function (error, results, fields) {
			if(error) console.log(error);
			else {
				callback(0, data);
			}
		})
}

var open = function (data, connection, callback) {
	connection.query('UPDATE `threads` SET `isClosed` = FALSE WHERE `id` = ?;', data.thread,
		function (error, results, fields) {
			if(error) console.log(error);
			else {
				callback(0, data);
			}
		})
}

var details = function (data, connection, callback) {
	getThreadDetails(function(results){
		if(results === undefined){
			callback(1, 'error');
		}
		else {
			var res = results;
			// if(res[0] !== undefined) {
			// 	res.date = res.date.toLocaleString();
			// }

			if (data.related) {
				if(data.related.indexOf('thread') !== -1) {
					callback(3, 'error')
				}
				else {
						var asyn = new MyAsync(function() {
							callback(0, res);
						});

					asyn.add(function(){
						if (data.related.indexOf('user') !== -1) {

							asyn.add(function(){
								user.getUserDetails( function (userInfo) {
								res.user = userInfo;
								asyn.check();
							}, res.user, connection)
							});


							// res.forEach( function(item, i, arr) {
							// 	if(item.user){
							// 		asyn.add(function(){
							// 			user.getUserDetails( function (userInfo) {
							// 			item.user = userInfo;
							// 			asyn.check();
							// 		}, item.user, connection)
							// 		});
							// 	}
							// })


						}
					});

					//нужно ли рассмативать вложенных юзеров?

					asyn.add(function(){
						if(data.related.indexOf('forum') !== -1) {

							asyn.add(function(){
								forum.getForumDetails( function (forumInfo) {
								res.forum = forumInfo;
								asyn.check();
							}, res.forum, connection)
							});


							// res.forEach( function(item, i, arr) {
							// 	if(item.forum){
							// 		asyn.add(function(){
							// 			getForumDetails( function (forumInfo) {
							// 			item.forum = forumInfo;
							// 			asyn.check();
							// 		}, item.forum, connection)
							// 		});
							// 	}
							// })


						}
					});

					asyn.check();
					asyn.check();

				}
				
			}
			else callback(0, res);
		}
		

	}, data.thread, connection)

}

	// getThreadDetails(function (data) {



	// 	callback(0, data);
	// }, data.thread, connection);
	// if(data.hasOwnProperty('related')) {
	// 	if (data.related.indexOf('user')) {
	// 		// get user details
	// 	}
	// 	if (data.related.indexOf('forum')) {
	// 		// get forum details
	// 	}
	// }


var list = function (data, connection, callback) {
	var limit = '';
	if(!data.hasOwnProperty('order')) data.order = 'desc';
	if(!data.hasOwnProperty('since')) data.since = '0000-00-00 00:00:00';
	if(data.hasOwnProperty('limit')) {
		limit = ' LIMIT ' + data.limit;
	}
	if(data.hasOwnProperty('user')) {
		connection.query('SELECT * FROM `threads` WHERE `user` = ? AND `date` >= ? ORDER BY `date` ' + data.order + limit + ' ;',
			[data.user, data.since], function (error, results, fields) {
				var res = results;
				res.forEach( function (item){
					item.date = moment(item.date).format("YYYY-MM-DD HH:mm:ss");
				})
				if(error) console.log(error);
				else callback(0, res);
			});
	}
	else if(data.hasOwnProperty('forum')) {
		connection.query('SELECT * FROM `threads` WHERE `forum` = ? AND `date` >= ? ORDER BY `date` ' + data.order + limit + ' ;',
			[data.forum, data.since], function (error, results, fields) {
				var res = results;
				res.forEach( function (item){
					item.date = moment(item.date).format("YYYY-MM-DD HH:mm:ss");
				})
				if(error) console.log(error);
				else callback(0, res);
			});
	}
	else callback(5, 'error');
}


//сделать сортировку!!!!
var listPosts = function (data, connection, callback) {
	var limit = '';
	if(!data.hasOwnProperty('order')) data.order = 'desc';
	if(!data.hasOwnProperty('since')) data.since = '0000-00-00 00:00:00';
	if(data.hasOwnProperty('limit')) {
		limit = ' LIMIT ' + data.limit;
	}
	connection.query('SELECT * FROM `posts` WHERE `thread` = ? AND `date` >= ? ORDER BY `date` ' + data.order + limit + ' ;',
			[data.thread, data.since], function (error, results, fields) {
				var res = results;
				res.forEach( function (item){
					item.date = moment(item.date).format("YYYY-MM-DD HH:mm:ss");
				})
				if(error) console.log(error);
				else callback(0, res);
			});
}

var remove = function (data, connection, callback) {
	var thread = data.thread;
	//maybe not delete posts
	connection.query('UPDATE `threads` SET `isDeleted` = TRUE, `posts` = 0 WHERE `id` = ?;',
			data.thread, function (error, results, fields) {
				if(error) console.log(error);
				else {
					connection.query('UPDATE `posts` SET `isDeleted` = TRUE WHERE `thread` = ?;',
							data.thread, function (error, results, fields) {
								if(error) console.log(error);
								else callback(0, data);
							});
				}
			});
}

var restore = function (data, connection, callback) {
	var thread = data.thread;
	
	connection.query('UPDATE `posts` SET `isDeleted` = FALSE WHERE `thread` = ?;',
			data.thread, function (error, results, fields) {
				var rows = results.affectedRows;
				if(error) console.log(error);
				else {
					connection.query('UPDATE `threads` SET `isDeleted` = FALSE, `posts` = ? WHERE `id` = ?;',
							[rows ,data.thread], function (error, results, fields) {
								if(error) console.log(error);
								else callback(0, data);
							});
				}
			});
}

var subscribe = function (data, connection, callback) {
	connection.query('INSERT INTO `users_threads` (`user`, `thread`) VALUE (?, ?);',
			[data.user, data.thread], function (error, results, fields) {
				if(error) {
					console.log('in subscribe');
					console.log(error);
					callback(0, data);
				}
				else callback(0, data);
			});
}

var unsubscribe = function (data, connection, callback) {
	connection.query('DELETE FROM `users_threads` WHERE `user` = ? AND `thread` = ?;',
			[data.user, data.thread], function (error, results, fields) {
				if(error) console.log(error);
				else callback(0, data);
			});
}

var update = function (data, connection, callback) {
	connection.query('UPDATE `threads` SET `message` = ?, `slug` = ? WHERE `id` = ?',
			[data.message, data.slug, data.thread], function (error, results, fields) {
				if(error) console.log(error);
				else {
					getThreadDetails(function (results) {
						callback(0, results)
					}, data.thread, connection);
				}
			});
}

var vote = function (data, connection, callback) {
	if (data.vote === 1) {
		connection.query('UPDATE `threads` SET `likes` = `likes` + 1, `points` = `points` + 1 WHERE `id` = ?;',
				data.thread, function (error, results, fields) {
					if(error) console.log(error);
					else {
						getThreadDetails(function (results) {
							callback(0, results)
						}, data.thread, connection);
					}
				});
	}
	else if (data.vote === -1) {
		connection.query('UPDATE `threads` SET `dislikes` = `dislikes` + 1, `points` = `points` - 1 WHERE `id` = ?;',
				data.thread, function (error, results, fields) {
					if(error) console.log(error);
					else {
						getThreadDetails(function (results) {
							callback(0, results)
						}, data.thread, connection);
					}
				});
	}
	else console.log('error data.vote');
}

module.exports.listPosts = listPosts;
module.exports.remove = remove;
module.exports.vote = vote;
module.exports.update = update;
module.exports.subscribe = subscribe;
module.exports.unsubscribe = unsubscribe;
module.exports.restore = restore;
module.exports.list = list;
module.exports.close = close;
module.exports.details = details;
module.exports.open = open;
module.exports.create = create;
module.exports.getThreadDetails = getThreadDetails;