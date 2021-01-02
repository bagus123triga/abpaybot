const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// including routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
	secret: 'thisIsSecretSession',
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: false,
		maxAge: null
	}
}));

app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

require('express-dynamic-helpers-patch')(app);
app.dynamicHelpers({
	session: function(req, res) {
		return req.session;
	}
});

app.set('port', port);
const server = http.createServer(app);
server.listen(port);
server.on('listening', function() {
	console.log(`Listening to requests on http://localhost:${port}`);
});
