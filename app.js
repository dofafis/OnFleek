require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
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
var indexRouter = require('./routes/index');
var mydebug = require('./mydebug');
var filesRouter = require('./routes/files');
var avaliacoesRouter = require('./routes/avaliacoes');
var chatRouter = require('./routes/chat');
var connection = require('./db');

var app = express();

// view engine setup
app.engine('pug', require('pug').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Frontend
app.use('/client', express.static('/home/ubuntu/OnFleek/public/onfleek-client'));
app.use('/admin', express.static('/home/ubuntu/OnFleek/public/onfleek-admin'));
app.use('/home', express.static('/home/ubuntu/OnFleek/public/onfleek-site'));
//Frontend

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

app.use(fileUpload());


app.use('/', indexRouter);
app.use('/titulos', mydebug, titulosRouter);
app.use('/usuarios', usuariosRouter);
app.use('/comentarios', comentariosRouter);
app.use('/avaliacoes', avaliacoesRouter);
app.use('/listas', listasRouter);
app.use('/files', filesRouter);
app.use('/chat', chatRouter);

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
