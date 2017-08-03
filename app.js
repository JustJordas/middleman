var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');

var app = express();

var port = process.env.Port || 5000;

var authRouter = require('./src/routes/authRoutes')();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
    secret: 'middleman'
}));

require('./src/config/passport')(app);

app.set('views', './src/views');
app.set('view engine', 'ejs');
app.use('/auth', authRouter);

app.get('/', function (req, res) {
    res.render('index');
});

app.listen(port, function (err) {
    console.log('Running server on port: ' + port)
});
