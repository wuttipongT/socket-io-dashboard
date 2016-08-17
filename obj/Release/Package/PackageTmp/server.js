//var http = require('http');
var port = process.env.port || 8083;
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var routes = require(path.join(__dirname, 'routes'));
//http.createServer(function (req, res) {
//    res.writeHead(200, { 'Content-Type': 'text/plain' });
//    res.end('Hello World\n');
//}).listen(port);
//var express = require('express');
//var stormpath = require('express-stormpath');
//var app = express();
//var server = http.createServer(app);
//var io = require('socket.io').listen(server);
//var io = require('socket.io')(server);

//app.set('views', './views');
//app.set('view engine', 'jade');

app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.bodyParser());
//app.use(express.methodOverride());
//app.use(app.router);
app.use(express.static(path.join(__dirname, '.tmp')));
app.use(express.static(path.join(__dirname, 'public')));

//app.use(stormpath.init(app, {
//    expand: {
//        customData: true
//    },
//    client: {
//        apiKey: {
//            file: 'apiKey.properties'
//        }
//    },
//    application: {
//        href: 'https://api.stormpath.com/v1/applications/3ct5Ny9Di5vHfngF1TeLFo',
//    }
//}));

//app.get('/', stormpath.getUser, function (req, res) {
//    res.render('index', {
//        title: 'Welcome'
//    });
//});

// Handle Errors gracefully
app.use(function (err, req, res, next) {
    if (req.url.indexOf('/js/') === 0) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
    }
    if (!err) return next();
    console.log(err.stack);
    res.json({ error: true });
}); 

server.listen(port);

// Main App Page
app.get('/', routes.index);

// MongoDB API Routes
app.get('/inboundJson', routes.inboundView);
app.get('/outboundJson', routes.outboundView);
app.get('/gate', routes.gate);
app.get('/gateout', routes.gateout);
//io.sockets.on('connection', routes.ioconn);
// เมื่อมี client เข้ามาเชื่อมต่อให้ทำอะไร?

var inboundLeft = io
    .of('/inbound')
    .on('connection', routes.inboundLeft)
    .on('forceDisconnect', function () {
        inbound.disconnect();
        console.log('disconected!');
    });
var inboundRight = io
    .of('/inbound')
    .on('connection', routes.inboundRight)
    .on('forceDisconnect', function () {
        inboundright.disconnect();
        console.log('disconected!');
    });

var outboundLeft = io
    .of('/outbound')
    .on('connection', routes.outboundLeft)
    .on('forceDisconnect', function () {
        outbound.disconnect();
        console.log('disconected!');
    });
var outboundRight = io
    .of('/outbound')
    .on('connection', routes.outboundRight)
    .on('disconnect', function () {
        console.log('disconected!');
    });


   // .on('connection', routes.iooutright);
//io.on('connection', routes.right);
//app.get('/dashboard/inbound', function (req, res) {
//    res.render("55555");
//});
//app.on('stormpath.ready', function () {
//    console.log('Stormpath Ready');
//});
//app.listen(app.get('port'),app.get('ipaddr'));
