const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const helmet = require('helmet');

const PORT = process.env.PORT || 3000;

const db = require('./models');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, './public')));



/*-------------Added for Helmet.js--------------*/

//Helmet has been initialized in express middleware and will set various HTTP headers to help protect your app.
app.use(helmet())

//Sets four HTTP headers top prevent loading cached versions of files: Cache-Control, Surrogate-Control, Pragma, and Expires
app.use(helmet.noCache())

//Helmet’s HSTS set the Strict-Transport-Security header.
const sixtyDaysInSeconds = 5184000;

//fores browsers to use the https protocol for the website
app.use(helmet.hsts({
  maxAge: sixtyDaysInSeconds
}))

//Hides express server's default x-powered-by header, which can be used by attackers to penetrate the server
app.disable('x-powered-by');

//prevents clickjacking using frame or iframe
app.use(helmet.frameguard({action: 'deny'}))


app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["*","'unsafe-inline'",'code.jquery.com/','stackpath.bootstrapcdn.com','cdnjs.cloudflare.com'],
    scriptSrc: ["'self'",'code.jquery.com/','stackpath.bootstrapcdn.com','cdnjs.cloudflare.com'],
    imgSrc:["*"],
    fontSrc: ["*"],
  }
}))
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); //this line will add a header which will enable CORS
  next();
});

// **********************  Added above for Helmet security ****************************




require('./routes/api-routes')(app);
require('./routes/html-routes')(app);

db.sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log(`App is now listening on PORT ${PORT}`)
  });
});