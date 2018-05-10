require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
var bodyParser = require("body-parser");
var indexRouter = require('./routes/index');
var cors = require("cors");

const fileUpload = require('express-fileupload');

var multer = require('multer');
var uploads = multer({ dest: 'uploads/' });
//var usersRouter = require('./routes/users');
var titulosRouter = require('./routes/titulos');
var usuariosRouter = require('./routes/usuarios');
var comentariosRouter = require('./routes/comentarios');
var uploadsRouter = require('./routes/uploads');

var app = express();

//Database Connection
app.use(function(req, res, next){
        global.connection = mysql.createConnection({
                host     : process.env.DB_HOST,
                user     : process.env.DB_USER,
                database : 'OnFleek',
                password : process.env.DB_PASS
        });
        connection.connect();
        next();
});
//Database Connection

//upload
app.use(fileUpload());
//upload

// view engine setup
app.engine('pug', require('pug').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static('public'));
//app.use();
//Middlewares
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

app.use('/', indexRouter);
app.use('/titulos', titulosRouter);
app.use('/usuarios', usuariosRouter);
app.use('/comentarios', comentariosRouter);
app.use('/uploads', uploadsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
app.listen(3000);
