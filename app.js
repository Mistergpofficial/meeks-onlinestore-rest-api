const express = require('express');
var cors = require('cors')
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');




const userRoutes  = require('./api/routes/user');
const groupRoute = require('./api/routes/group');
const categoryRoute = require('./api/routes/category');
const productRoute = require('./api/routes/product');
const contactRoute = require('./api/routes/contact');
const orderRoute = require('./api/routes/order');

mongoose.connect(process.env.MONGODB_URI ||  'mongodb://localhost:27017/meeks', {useNewUrlParser: true});

app.use(morgan('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// app.use((req, res, next) => { 
//     res.header('Access-Control-Allow-Origin', '*'); 
//     res.header('Access-Control-Allow-Headers', 'Origin, Content-Type,Content-Length, Authorization, Accept,X-Requested-With,XMLHttpRequest');
//     if(req.method === 'OPTIONS'){
//         res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
//         return res.status(200).json({});
//     }
// });


// app.all("*", function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header("Access-Control-Allow-Headers", "Origin, Content-Type,Content-Length, Authorization, Accept,X-Requested-With,XMLHttpRequest");
//     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS, PATCH");
//     if (req.method === 'OPTIONS') {
//         res.send(200);
//     } else {
//         next();
//     }
// });

app.use(cors())

// Routes which should handle requests
app.use('/user', userRoutes);
app.use('/groups', groupRoute);
app.use('/categories', categoryRoute);
app.use('/products', productRoute);
app.use('/contacts', contactRoute);
app.use('/orders', orderRoute);



app.use(function (req, res, next) {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
 });
 
//  app.use(function (err, req, res, next) {
//     if(err.name === 'ValidationError'){
//         const valErrors = [];
//         Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
//         res.status(422).json(valErrors)
//     }
//  });
//  app.use(function (err, req, res, next) {
//     if(err.name === 'CastError'){
//         const valErrors = [];
//         Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
//         res.status(422).json({
//             error: 'required'
//         })
//     }
//  });



module.exports = app;