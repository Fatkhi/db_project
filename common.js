var clear = function (data, connection, callback) {
	connection.query('set foreign_key_checks=0;', function (error) {
		if(error) console.log(error);
		else connection.query('truncate table follower_followee;', function (error) {
			if(error) console.log(error);
			else connection.query('truncate table forums;', function (error) {
				if(error) console.log(error);
				else connection.query('truncate table posts;', function (error) {
					if(error) console.log(error);
					else connection.query('truncate table threads;', function (error) {
						if(error) console.log(error);
						else connection.query('truncate table users;', function (error) {
							if(error) console.log(error);
							else connection.query('truncate table users_threads;', function (error) {
								if(error) console.log(error);
								else connection.query('set foreign_key_checks=1;', function (error) {
									if(error) console.log(error);
									else callback(0, 'OK')
								});
							});
						});
					});
				});
			});
		});
	})
};

var status = function (data, connection, callback) {
	var users, threads, forums, posts;
	connection.query('SELECT COUNT(*) FROM users', function(error, results) {
		users = results[0]['COUNT(*)'];
		if(error) console.log(error);
		else connection.query('SELECT COUNT(*) FROM threads', function(error, results) {
			threads = results[0]['COUNT(*)'];
			if(error) console.log(error);
			else connection.query('SELECT COUNT(*) FROM forums', function(error, results) {
				forums = results[0]['COUNT(*)'];
				if(error) console.log(error);
				else connection.query('SELECT COUNT(*) FROM posts', function(error, results) {
					posts = results[0]['COUNT(*)'];
					if(error) console.log(error);
					else callback(0, {'user': users, 'thread': threads, 'forum': forums, 'post': posts})
				})
			})
		})
	})
}

module.exports.clear = clear;
module.exports.status = status;