// Import in our db models
var jwt = require('jsonwebtoken');
var userVerification = require('../controller/auth');
var config = require('../config/index');
const db = require('../models');
// var body = require('express-validator/check').body;
// var param = require('express-validator/check').param;
// var validationResult = require('express-validator/check').validationResult;


// ===============================================================================
// ROUTING
// ===============================================================================

// ToDo:
// uersVerification
// jwt()



module.exports = function (app) {
  // API requests for /api/login

  app.post("/api/login", function (req, res) {
    if (userVerification(req.body.username, req.body.password)) {
      var token = jwt.sign({ id: req.body.username }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });
      currentUser = req.body.username;
      console.log(`The token is ${token}`);
      res.cookie('token', token).json({ auth: true, redirect: 'dashboard' });

    } else {
      res.status(401).send("You are not authorized");
    }
  });

    // app.use(function(req, res, next){
    //   //Add an express-validator check to ensure the field isn't empty and it contains a valid JWT
    //   var token = req.headers.authorization;
    //   if(token){
    //     jwt.verify(token, config.secret, function(err, decoded) {
    //       if(err || (decoded.id != currentUser)){
    //         res.status(403).json({
    //           auth: false,
    //           message:"Incorrect or missing token"
    //         });
    //       }else{
    //         next();
    //       }    
    //     });
    //   }else
    //   res.status(403).json({
    //     auth: false,
    //     message:"Incorrect or missing token"
    //   });  
    // });
    // app.get("/api/users",function(req,res){
    //     res.json({auth:true,data:users});
    // });




    
  // API Requests for /api/products
  // Below code controls what happens when a request is made to /api/products

  // GET Request
  // Responds with all products
  app.get('/api/products', function (req, res) {
    db.Product.findAll({}).then(function (rows) {
      res.json(rows)
    }).catch(function (error) {
      res.json({ error: error });
    });
  });

  // API Requests for /api/products/:id
  // Below code controls what happens when a request is made to /api/products/:id

  // GET Request
  // Responds with just the requested product at the referenced id
  app.get('/api/products/:id', function (req, res) {
    db.Product.find({ where: { id: req.params.id } })
      .then(function (data) {
        res.json(data);
      }).catch(function (error) {
        res.json({ error: error });
      });
  });

  // PUT Request
  // Replaces the product at the referenced id with the one provided
  // Responds with success: true or false if successful
  app.put('/api/products/:id', function (req, res) {
    db.Product.update(
      req.body,
      { where: { id: req.params.id } }
    ).then(function (data) {
      res.json({ success: true, data: data });
    }).catch(function (error) {
      res.json({ success: false, error: error });
    });
  });

}
