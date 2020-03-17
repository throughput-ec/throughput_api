var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
const YAML = require('yamljs');
var fs = require('fs');
var swaggerUi = require('swagger-ui-express'),
    swaggerDocument = YAML.load('./throughput.yaml');

var app = express();

app.use(cors());

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'),
{
    flags: 'a'
})

// setup the logger
app.use(logger(':date[iso]\t:remote-addr\t:method\t:url\t:status\t:res[content-length]\t:response-time[0]\t:user-agent',
{
    stream: accessLogStream
}))


const OpenApiValidator = require('express-openapi-validator').OpenApiValidator;

// 3. (optionally) Serve the OpenAPI spec
const spec = path.join(__dirname, 'throughput.yaml');

var routes = require('./routes/index');
var users = require('./routes/users');

var debug = require('debug')('app4')

var options = {
    swaggerUrl: 'http://localhost:3000/api-docs',
    customCssUrl: '/custom.css'
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded(
{
    extended: true
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next)
{
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development')
{
    app.use(function (err, req, res, next)
    {
        res.status(err.status || 500);
        res.render('error',
        {
            message: err.message,
            error: err
        });
    });
}

// error handler
app.use(function (err, req, res, next)
{
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err :
    {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.all('*', function (req, res)
{
    res.redirect('/api-docs');
});

app.listen(3000)