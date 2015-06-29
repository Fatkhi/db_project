var user = require('./user.js');
var thread = require('./thread.js');
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

function getPostDetails (callback, id, connection) {
	connection.query('SELECT * FROM `posts` WHERE `id` = ?;', id, function (error, results, fields) {
		var res = results[0];
		if(res) {
			res.date = moment(res.date).format("YYYY-MM-DD HH:mm:ss");
		}
		if(error) console.log(error);
		else callback(res);
	})
}

var create = function (data, connection, callback) {
	if(!data.hasOwnProperty('parent')) data.parent = null;
	if(!data.hasOwnProperty('isApproved')) data.isApproved = false;
	if(!data.hasOwnProperty('isHighlighted')) data.isHighlighted = false;
	if(!data.hasOwnProperty('isEdited')) data.isEdited = false;
	if(!data.hasOwnProperty('isSpam')) data.isSpam = false;
	if(!data.hasOwnProperty('isDeleted')) data.isDeleted = false;

	connection.query('INSERT INTO `posts`'+
            '(`parent`, `thread`, `isDeleted`, `isSpam`, `isEdited`, `isApproved`, `isHighlighted`, `forum`,'+
             '`user`, `date`, `message`)'+
            'VALUE (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [data.parent, data.thread, data.isDeleted, data.isSpam, data.isEdited,
            data.isApproved, data.isHighlighted, data.forum, data.user, data.date, data.message],
		function(error, results, fields) {
			if (error) {
				console.log(error);
			}
			else {
				data.id = results.insertId;
				connection.query('UPDATE `threads` SET `posts` = `posts` + 1 WHERE `id` = ?;', data.thread,
					function (error, results, fields) {
						if(error) console.log(error);
						else {
							callback(0, data);
						}
					})
			}
	})
}

var details = function(data, connection, callback) {
	connection.query('SELECT * FROM `posts` WHERE `id` = ?;', data.post, function(error, results, fields) {
		if(error) console.log(error);
		else if(results.length === 0) {
			callback(1,'error');
		}
		else {
			var res = results[0];
			if (res !== undefined) {
				res.date = moment(res.date).format("YYYY-MM-DD HH:mm:ss");
			};

			if (data.related) {

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
						asyn.add(function(){
							forum.getForumDetails( function (forumInfo) {
							res.forum = forumInfo;
							asyn.check();
						}, res.forum, connection)
						});
						asyn.add(function(){
							thread.getThreadDetails( function (threadInfo) {
							res.thread = threadInfo;
							asyn.check();
						}, res.thread, connection)
						});
					}
				});

			asyn.check();
			}
			else callback(0, res);
	}
	})
}

var list = function (data, connection, callback) {
	var limit = '';
	if(!data.hasOwnProperty('order')) data.order = 'desc';
	if(!data.hasOwnProperty('since')) data.since = '0000-00-00 00:00:00';
	if(data.hasOwnProperty('limit')) {
		limit = ' LIMIT ' + data.limit;
	}
	if(data.hasOwnProperty('thread')) {
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
	else if(data.hasOwnProperty('forum')) {
		connection.query('SELECT * FROM `posts` WHERE `forum` = ? AND `date` >= ? ORDER BY `date` ' + data.order + limit + ' ;',
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

var remove = function (data, connection, callback) {
	connection.query('SELECT `thread` FROM `posts` WHERE `id` = ?;',
			data.post, function (error, results, fields) {
				if(error) console.log(error);
				else {
					var thread_num = results[0].thread;
					connection.query('UPDATE `posts` SET `isDeleted` = TRUE WHERE `id` = ?;',
							data.post, function (error, results, fields) {
								if(error) console.log(error);
								else {
										connection.query('UPDATE `threads` SET `posts` = `posts` - 1 WHERE `id` = ?;',
												thread_num, function (error, results, fields) {
													if(error) console.log(error);
													else callback(0, data);
												});
									}
							});
				}
			});
}

var restore = function (data, connection, callback) {
	connection.query('SELECT `thread` FROM `posts` WHERE `id` = ?;',
			data.post, function (error, results, fields) {
				if(error) console.log(error);
				else {
					var thread_num = results[0].thread;
					connection.query('UPDATE `posts` SET `isDeleted` = FALSE WHERE `id` = ?;',
							data.post, function (error, results, fields) {
								if(error) console.log(error);
								else {
										connection.query('UPDATE `threads` SET `posts` = `posts` + 1 WHERE `id` = ?;',
												thread_num, function (error, results, fields) {
													if(error) console.log(error);
													else callback(0, data);
												});
									}
							});
				}
			});
}

var update = function (data, connection, callback) {
	connection.query('UPDATE `posts` SET `message` = ? WHERE `id` = ?;',
			[data.post, data.message], function (error, results, fields) {
				if(error) console.log(error);
				else {
					getPostDetails(function (results) {
						callback(0, results)
					}, data.post, connection);
				}
			});
}

var vote = function (data, connection, callback) {
	if (data.vote === 1) {
		connection.query('UPDATE `posts` SET `likes` = `likes` + 1, `points` = `points` + 1 WHERE `id` = ?;',
				data.post, function (error, results, fields) {
					if(error) console.log(error);
					else {
						getPostDetails(function (results) {
							callback(0, results)
						}, data.post, connection);
					}
				});
	}
	else if (data.vote === -1) {
		connection.query('UPDATE `posts` SET `dislikes` = `dislikes` + 1, `points` = `points` - 1 WHERE `id` = ?;',
				data.post, function (error, results, fields) {
					if(error) console.log(error);
					else {
						getPostDetails(function (results) {
							callback(0, results)
						}, data.post, connection);
					}
				});
	}
	else console.log('error data.vote');
}


module.exports.create = create;
module.exports.remove = remove;
module.exports.restore = restore;
module.exports.update = update;
module.exports.vote = vote;
module.exports.list = list;
module.exports.details = details;
module.exports.getPostDetails = getPostDetails;