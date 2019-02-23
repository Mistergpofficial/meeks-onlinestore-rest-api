const express = require('express');
const router = express.Router();
const Mongoose = require('mongoose');
const Order = require('../models/order');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

router.post('/paywith', (req,res, next) => {
    const order = new Order({
        _id: Mongoose.Types.ObjectId(),
        uniqueId: crypto.randomBytes(12).toString('hex'),
        cart : req.body.cart,
        user: req.body.user,
        reference: req.body.reference,
        status: req.body.status
    });
    order.save()
    .then(result => {
        if(result) {
             const email1 = req.body.email1
            var transporter = nodemailer.createTransport({ 
                host: "smtp.mailtrap.io",
                port: 2525,
                auth: { 
                    user: 'df3c8258cde1c4', 
                    pass: '5f7cfd72ade7df' 
                           } 
                });
                const mailOptions = { 
                    from: 'no-reply@yourwebapplication.com', 
                     to: email1, 
                     subject: 'Order Has Been Placed', 
                    text: 'Hello,\n\n' + order.user.full_name + 'Your Order:' + ' ' + 'has been successfully placed' };
                    transporter.sendMail(mailOptions, function (err) { 
                        if(err){
                            return res.status(500).json({ 
                                msg: err.message 
                            });
                        }else{
                            res.status(200).json('A  mail has been sent to ' + order.user.email1 + '.');
                        }
                    }); // transporter.sendMail ends
            // res.status(200).json({
            //     message: 'Order has been Placed'
            // });
        }else{
            res.status(404).json({
                message: 'Order Not Found'
            });
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.post('/paywithout', (req,res, next) => {
    const order = new Order({
        _id: Mongoose.Types.ObjectId(),
        uniqueId: crypto.randomBytes(12).toString('hex'),
        cart : req.body.cart,
        user: req.body.user,
        reference: 'PAYMENT ON DELIVERY',
        status: req.body.status
    });
    order.save()
    .then(result => {
        if(result) {
             const email = req.body.email
            var transporter = nodemailer.createTransport({ 
                host: "smtp.mailtrap.io",
                port: 2525,
                auth: { 
                    user: 'df3c8258cde1c4', 
                    pass: '5f7cfd72ade7df' 
                           } 
                });
                const mailOptions = { 
                    from: 'no-reply@yourwebapplication.com', 
                     to: email, 
                     subject: 'Order Has Been Cancelled', 
                    text: 'Hello,\n\n' + order.user.full_name + 'Your Order:' + ' ' + 'has been successfully placed' };
                    transporter.sendMail(mailOptions, function (err) { 
                        if(err){
                            return res.status(500).json({ 
                                msg: err.message 
                            });
                        }else{
                            res.status(200).json('A  mail has been sent to ' + order.user.email + '.');
                        }
                    }); // transporter.sendMail ends
            // res.status(200).json({
            //     message: 'Order has been Placed'
            // });
          //  console.log(typeof req.body.user)
        }else{
            res.status(404).json({
                message: 'Order Not Found'
            });
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

// get all orders
router.get('/all-orders', (req, res, next) => {
    Order.find()
    .exec()
    .then(docs => {
        if(docs){
            const response = {
                count: docs.length,
                orderArray: docs.map(doc => {
                    return {
                        id: doc._id,
                        uniqueId: doc.uniqueId,
                        user: doc.user,
                        cart: doc.cart,
                        reference: doc.reference,
                        status: doc.status,
                        createdAt: doc.createdAt
                    }
                })
            }
            res.status(200).json(response);
        }else{
            res.status(404).json({
                message: 'Not Found'
            });
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

//get order by ID
router.get('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
    .exec()
    .then(doc => {
        if(doc){
            res.status(200).json(doc)
        }else{
            res.status(200).json({
                message: 'No order details found for the given ID'
            }) 
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});




router.delete('/delete/:orderId',  function (req, res,next) {
    const id = req.params.orderId;
      Order.findById(id)
    .exec()
    .then(doc => {
        if(doc){
            Order.remove({_id: id}).exec().then(function (result) {
                if(result){
                    var transporter = nodemailer.createTransport({ 
                                host: "smtp.mailtrap.io",
                                port: 2525,
                                auth: { 
                                     user: '3348b04943bfb0', 
                                     pass: '01c1ffe9a3b4bb' 
                                    }
                                });
                                const mailOptions = { 
                                          from: 'no-reply@yourwebapplication.com', 
                                           to: doc.user.email, 
                                           subject: 'Order Has Been Cancelled', 
                                          text: 'Hello,\n\n' + doc.user.full_name + 'Your Order:' + doc._id + ' ' + 'has been successfully cancelled' };
                                          transporter.sendMail(mailOptions, function (err) { 
                                                    if(err){
                                                        return res.status(500).json({ 
                                                            msg: err.message 
                                                        });
                                                    }else{
                                                        res.status(200).json('A verification email has been sent to ' + doc.user.email + '.');
                                                    }
                                                }); // transporter.sendMail ends

                }else{
                    res.status(500).json({
                                message: 'Order could not be cancelled'
                              });
                }
            });
       //   res.status(200).json(doc)
        }else{
            res.status(404).json({
                message: 'Could not find the order'
            })  
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
 
});

//cancel an order
router.patch('/odd/cancel-order', (req, res, next) => {
    if (!req.body.uniqueId) {
        res.status(422).json({success: false, msg: 'All Fields are required'});
    } else{
    const uniqueId = req.body.uniqueId;
    Order.findOne({uniqueId:uniqueId})
    .exec()
    .then(doc => {
        if(doc){
            Order.update({uniqueId:uniqueId}, {$set: {uniqueId: req.body.uniqueId, status: 'CANCELLED'}})
            .exec()
    .then(result => {
        if(result){
            res.status(200).json(uniqueId)
        }else{
            res.status(404).json({
                msg: 'Order Cancellation Failed'
            })
        }
    })
          //  res.status(200).json(doc.uniqueId)
        }else{
            res.status(404).json({
                msg: 'No order details found for the given ID'
            }) 
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
}
});



module.exports = router;