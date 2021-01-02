const db = require('../../libraries/database');
const filter = require('../../libraries/filter');
const bcrypt = require('bcrypt');
const xss = require('xss');

const LoginController = {
	get: function(req, res, next) {
		if (req.session.user) {
			res.redirect('/');
		} else {
			res.render('auth/login');
		}
	},
	post: function(req, res, next) {
		if (req.session.user) {
			res.redirect('/');
		} else {
			const _post = req.body;
			if (!_post.username || !_post.password) {
				req.session.alert = {
					type: 'danger',
					content: 'Mohon mengisi semua input.'
				};
				
				res.render('auth/login');
			} else {
				var username = filter(_post.username);
				var password = filter(_post.password);
				
				db.query(`SELECT * FROM users WHERE username = '${username}' LIMIT 1`
					, function(error, result) {
					if (result.length == 0) {
						req.session.alert = {
							type: 'danger',
							content: 'Pengguna tidak ditemukan.'
						};
						
						res.render('auth/login');
					} else {
						const data_user = JSON.parse(JSON.stringify(result[0]));
						if (bcrypt.compareSync(password, data_user.password) == false) {
							req.session.alert = {
								type: 'danger',
								content: 'Password yang Anda masukkan salah.'
							};
							
							res.render('auth/login');
						} else {
							req.session.user = data_user;
							req.session.alert = {
								type: 'success',
								content: 'Halo '+xss(username)+', Selamat datang kembali!'
							};
							
							res.redirect('/');
						}
					}
				});
			}
		}
	}
};

module.exports = LoginController;
