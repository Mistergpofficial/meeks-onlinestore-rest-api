const express= require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Token = require('../models/token');
const jwt = require('jsonwebtoken');
const CheckAuth = require('../middleware/check-auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Password = require('../models/password');

router.post('/admin-signup', function (req,res,next) {
    if (!req.body.full_name || !req.body.email || !req.body.password || !req.body.country || !req.body.state || !req.body.city || !req.body.address || !req.body.phone) {
        res.status(422).json({success: false, msg: 'All Fields are required'});
    } else{
        User.find({email: req.body.email}, function(err, user) {
            if(user.length > 1){
                return res.status(409).json({
                    msg: 'Mail Exists'
                });
            }else{
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if(err){
                        return res.status(500).json({
                            error: err
                        });
                    }else{
                          var newUser = new User({
                            _id: mongoose.Types.ObjectId(),
                            full_name: req.body.full_name,
                            email: req.body.email,
                            password: hash,
                            country: req.body.country,
                            state: req.body.state,
                            city: req.body.city,
                            address: req.body.address,
                            phone: req.body.phone,
                            is_admin: 1
                          });
                          newUser.save().then(result => {
                            if(result){
                                var token = new Token({
                                    _id: mongoose.Types.ObjectId(),
                                    _userId: newUser._id,
                                    token: crypto.randomBytes(16).toString('hex')
                                });
                                token.save(err => {
                                    if(err){
                                        return res.status(500).json({ 
                                            msg: err.message 
                                        });
                                    }else{
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
                                          to: newUser.email, 
                                          subject: 'Account Verification Token', 
                                        text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user' + '\/confirmation\/' + token.token + '.\n' };
                                        transporter.sendMail(mailOptions, function (err) { 
                                            if(err){
                                                return res.status(500).json({ 
                                                    msg: err.message 
                                                });
                                            }else{
                                                res.status(200).json('A verification email has been sent to ' + newUser.email + '.');
                                            }
                                        }); // transporter.sendMail ends
                                    } // else ends
                                }); // token.save ends
                            }else{
                                res.status(401).json({
                                    error: 'Error Saving Data'
                                });
                            }
                          }); // newUser.save ends
                    } //else ends
                }); // bcrypt.hash ends
            } //else ends
        }); // User.find ends
         
      }// else ends
 });


router.post('/login',  (req,res,next) => {
    if (!req.body.email || !req.body.password) {
        res.status(422).json({success: false, msg: 'All Fields are required'});
    } else {
  User.findOne({email: req.body.email}, function (err, user) {
      if(user < 1)
        return res.status(401).json(
           'Email Doesnt Exist'
        );
        var plainPassword = req.body.password;
        var hashedPassword = user.password;
        bcrypt.compare(plainPassword, hashedPassword, (err, isMatch) => {
            //console.log(user.password)
              if(err){
                return res.status(401).json('Auth Failed');
            }

               // Make sure the user has been verified
               if (user.isVerified == false) {
                return res.status(401).json('Your account has not been verified.'); 
            }
        
              if(isMatch){
                const payload ={
                    _id:user.id,
                    full_name: user.full_name,
                    email: user.email,
                    country: user.country,
                    state: user.state,
                    city: user.city,
                    address: user.address,
                    phone: user.phone,
                    is_admin: user.is_admin
                };
                let token = jwt.sign(payload, process.env.JWT_KEY,{
                    expiresIn:"1h"
                });
                return res.status(200).json({
                    message: 'Auth Successful',
                    token: token,
                    user: payload
                });
            }
               
               res.status(401).json('Authentication Failed');



        });
  });
}
});

router.patch('/update/:userId' , (req,res,next)=> {
    const id = req.params.userId;
    console.log(id);
    // const updateOps = {};
    // for (const ops of req.body){
    //     updateOps[ops.propName] = ops.value
    // }
    if (!req.body.full_name || !req.body.email || !req.body.country || !req.body.state || !req.body.city || !req.body.address || !req.body.phone) {
        res.status(422).json({success: false, msg: 'All Fields are required'});
    } else{
    User.update({_id:id}, {$set: {full_name: req.body.full_name, email: req.body.email, country: req.body.country, state: req.body.state, city: req.body.city, address: req.body.address, phone: req.body.phone}})
    .exec()
    .then(result => {
        if(result){
            res.status(200).json({
                message: 'Update is Successful'
            })
        }else{
            res.status(404).json({
                message: 'Update Failed'
            })
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    });
}
});

// router.get('/profile/:userId', CheckAuth , (req,res,next)=> {
//     const id = req.params.userId;
//     User.findById(id)
//     .exec()
//     .then(user => {
//         if(user){
//             res.status(200).json({
//                 userDetails: user,
//             });
//         }else{
//             res.status(404).json({
//                 message: 'No user found with such ID'
//             });
//         }
//     })
//     .catch(err => {
//         res.status(500).json({
//             error: err
//         })
//     });
// });


router.get('/confirmation/:token', (req,res,next)=> {
    const token = req.params.token;
    Token.findOne({ token: token }, function (err, token) {
        if(!token)
            return res.status(400).json({
                msg: 'We were unable to find a valid token. Your token may have expired'
            })
         // If we found a token, find the user who owns the tocken
         User.findOne({ _id: token._userId}, function (err, user) {
            if (!user) 
            return res.status(400).json({ 
                msg: 'We were unable to find a user for this token.' 
            });
            if (user.isVerified)
             return res.status(400).json({
                 msg: 'This user has already been verified.' 
                }); 
                // Verify and save the user
            user.isVerified = true;
            user.save(function (err) {
                if (err) { 
                    return res.status(500).json({ 
                        msg: err.message }); 
                    }
                res.status(200).json("The account has been verified. Please log in.");
            });
         });

    });
});

router.post('/user-signup', function (req,res,next) {
    if (!req.body.full_name || !req.body.email || !req.body.password || !req.body.country || !req.body.state || !req.body.city || !req.body.address || !req.body.phone ) {
        res.status(422).json({success: false, msg: 'All Fields are required'});
    } else {
        User.find({email: req.body.email}, function(err, user) {
            if(user.length){
                res.status(422).json({success: false, msg: 'Mail Exists'});
            }else{
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if(err){
                        return res.status(500).json({
                            error: err
                        });
                    }else{
                        var newUser = new User({
                            _id: mongoose.Types.ObjectId(),
                            full_name: req.body.full_name,
                            email: req.body.email,
                            password: hash,
                            country: req.body.country,
                            state: req.body.state,
                            city: req.body.city,
                            address: req.body.address,
                            phone: req.body.phone
                          });
                          newUser.save().then(result => {
                            if(result){
                                var token = new Token({
                                    _id: mongoose.Types.ObjectId(),
                                    _userId: newUser._id,
                                    token: crypto.randomBytes(16).toString('hex')
                                });
                                token.save(err => {
                                    if(err){
                                        return res.status(500).json({ 
                                            msg: err.message 
                                        });
                                    }else{
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
                                          to: newUser.email, 
                                          subject: 'Account Verification Token', 
                                        text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user' + '\/confirmation\/' + token.token + '.\n' };
                                        transporter.sendMail(mailOptions, function (err) { 
                                            if(err){
                                                return res.status(500).json({ 
                                                    msg: err.message 
                                                });
                                            }else{
                                                res.status(200).json('A verification email has been sent to ' + newUser.email + '.');
                                            }
                                        }); // transporter.sendMail ends
                                    } // else ends
                                }); // token.save ends
                            }else{
                                res.status(401).json({
                                    error: 'Error Saving Data'
                                });
                            }
                          }); // newUser.save ends
                    } //else ends
                }); // bcrypt.hash ends
            } //else ends
        }); // User.find ends
         
      }// else ends
 });


router.post('/resend', (req, res, next) => {
    User.findOne({ email: req.body.email }, function (err, user) { 
        if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
        if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please log in.' }); 
          // Create a verification token, save it, and send email
          var token = new Token({
            _id: mongoose.Types.ObjectId(),
            _userId: user._id,
            token: crypto.randomBytes(16).toString('hex')
        });
         // Save the token
         token.save(err => {
            if(err){
                return res.status(500).json({ 
                    msg: err.message 
                });
            }else{
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
                  to: user.email, 
                  subject: 'Account Verification Token', 
                text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user' + '\/confirmation\/' + token.token + '.\n' };
                transporter.sendMail(mailOptions, function (err) { 
                    if(err){
                        return res.status(500).json({ 
                            msg: err.message 
                        });
                    }else{
                        res.status(200).json('A verification email has been sent to ' + user.email + '.');
                    }
                }); // transporter.sendMail ends
            } // else ends
        }); // token.save ends
       });
});





module.exports = router;
