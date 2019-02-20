const express = require('express');
const router = express.Router();
const Mongoose = require('mongoose');
const Order = require('../models/order');

router.post('/paywith', (req,res, next) => {
    const order = new Order({
        _id: Mongoose.Types.ObjectId(),
        cart : req.body.cart,
        user: req.body.user,
        reference: req.body.reference
    });
    order.save()
    .then(result => {
        if(result) {
            res.status(200).json({
                message: 'Order has been Placed'
            });
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
        cart : req.body.cart,
        user: req.body.user,
        reference: 'PAYMENT ON DELIVERY'
    });
    order.save()
    .then(result => {
        if(result) {
            res.status(200).json({
                message: 'Order has been Placed'
            });
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
                        cart: doc.cart,
                        user: doc.user,
                        reference: doc.reference,
                        createdAt: doc.createdAt,
                        id: doc._id
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

router.delete('/:orderId', function (req, res,next) {
    const id = req.params.orderId;
    Order.remove({_id: id}).exec().then(function (result) {
        res.status(200).json({
            message: 'Order Deleted Successfully',
            requests: {
                type: 'POST',
                url: 'http://localhost:3000/orders'
            }
        });
    }).catch(function (err) {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});



module.exports = router;