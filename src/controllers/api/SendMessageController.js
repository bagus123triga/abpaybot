const db = require('../../libraries/database');
const fs = require('fs');
const path = require('path');
const filter = require('../../libraries/filter');
const { Client } = require('whatsapp-web.js');

const SendMessageController = {
	post: function(req, res, next) {
		res.setHeader('Content-Type', 'application/json');
		
		const _post = req.body;
		if (!_post.api_key || !_post.phone || !_post.message) {
			res.send(JSON.stringify({
				status: false,
				message: 'Inccorect request (1)'
			}));
		} else {
			var api_key = filter(_post.api_key);
			var phone = _post.phone+'@s.whatsapp.net';
			var message = message;
			
			db.query(`SELECT * FROM users WHERE api_key = '${api_key}'`
				, function(error, result) {
				if (result.length == 0) {
					res.send(JSON.stringify({
						status: false,
						message: 'Invalid API Key'
					}));
				} else {
					const data_user = JSON.parse(JSON.stringify(result[0]));
					
					if (!data_user.session) {
						res.send(JSON.stringify({
							status: false,
							message: 'Please add your whatsapp account first'
						}));
					} else {
						var sessionConfig = require(path.dirname(require.main.filename || process.mainModule.filename)+'/sessions/'+data_user.session);
						const client = new Client({
							puppeteer: {
								headless: true,
								executablePath: '/usr/bin/chromium-browser',
								args: ['--no-sandbox']
							},
							session: sessionConfig
						});
						
						client.on('authenticated', function(session) {
							var sessionData = JSON.stringify(session);
							db.query(`UPDATE users SET session = '${sessionData}' WHERE username = '${data_user.username}'`);
						});
						
						client.on('auth_failure', async function(msg) {
							await fs.unlink(path.dirname(require.main.filename || process.mainModule.filename)+'/sessions/'+data_user.session, function(error) {
								if (error) throw error;
							});
							
							db.query(`UPDATE users SET session = '' WHERE username = '${data_user.username}'`
								, function(error, result) {
								res.send(JSON.stringify({
									status: false,
									message: 'Whatsapp session expired, please add your whatsapp account again'
								}));
							});
						});
						
						client.on('ready', async function() {
							await client.sendMessage(phone, message);
							res.send(JSON.stringify({
								status: true,
								message: 'Message sended'
							}));
						});
						
						client.initialize();
					}
				}
			});
		}
	}
};

module.exports = SendMessageController;
