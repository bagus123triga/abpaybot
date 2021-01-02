const db = require('../libraries/database');

const WelcomeController = {
	get: function(req, res, next) {
		if (!req.session.user) {
			res.redirect('/auth/login');
		} else {
			const session_user = req.session.user;
			db.query(`SELECT * FROM users WHERE id = '${session_user.id}' LIMIT 1`
				, function(error, result) {
				if (result.length == 0) {
					req.session.user = null;
					
					res.redirect('/auth/login');
				} else {
					const data_user = JSON.parse(JSON.stringify(result[0]));
					
					res.render('index', {
						data: data_user
					});
				}
			});
		}
	}
};

module.exports = WelcomeController;
