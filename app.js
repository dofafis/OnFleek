require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
var bodyParser = require("body-parser");
//var indexRouter = require('./routes/index');
var cors = require("cors");
var fs = require('fs');

const fileUpload = require('express-fileupload');

var multer = require('multer');
var files = multer({ dest: 'files/' });
//var usersRouter = require('./routes/users');
var titulosRouter = require('./routes/titulos');
var usuariosRouter = require('./routes/usuarios');
var comentariosRouter = require('./routes/comentarios');
var listasRouter = require('./routes/listas');
//var indexRouter = require('./routes/index');
//ALTERAR DEPOIS
var filesRouter = require('./routes/files');
//ALTERAR DEPOIS

var app = express();

//Database Connection
app.use(function(req, res, next){
        global.connection = mysql.createPool({
		connectionLimit: 10000,
                host     : process.env.DB_HOST,
                user     : process.env.DB_USER,
                database : 'OnFleek',
                password : process.env.DB_PASS
        });
        connection.getConnection(function(err, connection){
		console.log("Conectado com sucesso!");
	});
        next();
});
//Database Connection


// view engine setup
app.engine('pug', require('pug').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use('/home', express.static('/home/ubuntu/OnFleek/public/onfleek-site'));
//app.use();
//Middlewares
app.use(logger('dev'));
app.use(logger('common', {
  stream: fs.createWriteStream(path.join('./', 'access.log'), {flags: 'a'})
}))
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//upload
app.use(fileUpload());
//upload

app.use(express.static('public'));

//app.use('/', indexRouter);
app.use('/titulos', titulosRouter);
app.use('/usuarios', usuariosRouter);
app.use('/comentarios', comentariosRouter);
app.use('/listas', listasRouter);
app.use('/files', filesRouter);

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
