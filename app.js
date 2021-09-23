let express = require('express');
//let apicache = require('apicache');
let path = require('path');
let favicon = require('serve-favicon');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let bodyParser = require('body-parser');
let cors = require('cors');
const YAML = require('yamljs');
let fs = require('fs');
let swaggerUi = require('swagger-ui-express'),
  swaggerDocument = YAML.load('./throughput.yaml');

let app = express();
//let cache = apicache.middleware;

app.use(cors({credentials: true, origin: true}))
// app.use(cache('15 minutes'));

// create a write stream (in append mode)
let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
  flags: 'a'
})

// setup the logger
app.use(logger(':date[iso]\t:remote-addr\t:method\t:url\t:status\t:res[content-length]\t:response-time[0]\t:user-agent', {
  stream: accessLogStream
}))

// 3. (optionally) Serve the OpenAPI spec
const spec = path.join(__dirname, 'throughput.yaml');

let routes = require('./routes/index');
let auth = require('./routes/auth');

// let debug = require('debug')('app4')

let options = {
  swaggerUrl: 'https://throughputdb.com/api-docs',
  customCssUrl: '/custom.css'
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', auth);
app.use('/', routes);

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.all('*', function(req, res, next) {
  res.redirect('/api-docs');
});

app.listen(3000)
