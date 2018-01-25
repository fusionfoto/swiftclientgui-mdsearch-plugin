// An example of custom metadata search plugins with SwiftStack Client.

const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
var columbus = require(path.join(__dirname,'api','columbus'))

const app = express()

// Middleware
app.use(bodyParser.json())

// Allow CORS from anything. 
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

// Static UI stuff via index.html.
app.get('/', function(req,res) {
  res.sendfile('index.html', { root: __dirname })
});
app.get('/ui.js', function(req,res) {
  res.sendfile('ui.js', { root: __dirname })
});
app.get('/css/valid.css', function(req,res) {
  res.sendfile('valid.css', { root: path.join(__dirname,'css','') })
});
app.get('/node_modules/angular/angular.js', function(req,res) {
  res.sendfile('angular.js', { root: path.join(__dirname,'node_modules','angular') })
});
app.get('/node_modules/bootstrap/dist/js/bootstrap.js', function(req,res) {
  res.sendfile('bootstrap.js', { root: path.join(__dirname,'node_modules','bootstrap','dist','js') })
});
app.get('/node_modules/jquery/dist/jquery.js', function(req,res) {
  res.sendfile('jquery.js', { root: path.join(__dirname,'node_modules','jquery','dist') })
});

app.listen(3000, '0.0.0.0', function() {
  console.log('SwiftStack Client custom metadata search demo listening on port 3000!')
})







