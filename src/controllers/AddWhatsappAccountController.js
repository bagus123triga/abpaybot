const db = require('../libraries/database');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const Pusher = require('pusher');
const pusher = new Pusher({
	appId: '1129013',
	key: 'e818dc0dfef3478a4962',
	secret: '5ace930ebfd0a4c33ec4',
	cluster: 'ap1',
	useTLS: true
});

const AddWhatsappAccountController = {
	post: function(req, res, next) {
		res.setHeader('Access-Control-Allow-Credentials', 'true');
		if (!req.session.user) {
			res.send(JSON.stringify({
				status: false,
				message: 'Please login first'
			}));
		} else {
			const session_user = req.session.user;
			db.query(`SELECT * FROM users WHERE id = '${session_user.id}' LIMIT 1`
				, function(error, result) {
				if (result.length == 0) {
					req.session.user = null;
					
					res.redirect('/auth/login');
				} else {
					const data_user = JSON.parse(JSON.stringify(result[0]));
					
					if (!req.session.addwhatsappaccount && !data_user.session) {
						req.session.addwhatsappaccount = { status: true };
						const client = new Client({
							puppeteer: {
								headless: true,
								executablePath: '/usr/bin/chromium-browser',
								args: ['--no-sandbox']
							},
							session: data_user.session
						});
						
						client.on('qr', async function(qr) {
							var qrCodeImage = await qrcode.toDataURL(qr);
							pusher.trigger(data_user.api_key, 'add-whatsapp-account', {
								status: true,
								data: {
									type: 'qr',
									source: qrCodeImage
								}
							});
						});
						
						client.on('authenticated', async function(session) {
							await fs.appendFile(path.dirname(require.main.filename || process.mainModule.filename)+'/sessions/'+data_user.username.split('@')[0]+'.json', JSON.stringify(session), function(error) {
								if (error) throw error;
							});
							
							var sessionConfig = data_user.username.split('@')[0]+'.json';
							db.query(`UPDATE users SET session = '${sessionConfig}' WHERE username = '${data_user.username}'`
								, function(error, result) {
								if (error) throw error;
								pusher.trigger(data_user.api_key, 'add-whatsapp-account', {
									status: true,
									data: {
										type: 'authenticated'
									}
								});
							});
						});
						
						client.on('ready', function() {
							pusher.trigger(data_user.api_key, 'add-whatsapp-account', {
								status: true,
								data: {
									type: 'ready'
								}
							});
						});
						
						client.initialize();
					} else {
						res.send(JSON.stringify({
							status: false
						}));
					}
				}
			});
		}
	}
};

module.exports = AddWhatsappAccountController;
