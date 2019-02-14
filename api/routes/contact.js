const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');


router.post('/add', (req,res, next) => {
    if (!req.body.name || !req.body.email || !req.body.phone || !req.body.bodyMessage) {
        res.status(422).json({success: false, msg: 'All Fields are required'});
    }else{
        var transporter = nodemailer.createTransport({
           host: "smtp.mailtrap.io",
           port: 2525,
           auth : {
               user: 'df3c8258cde1c4',
               pass: '5f7cfd72ade7df'
           }
        });
        const mailOptions = {
            from: req.body.email, 
            to: 'no-reply@yourwebapplication.com', 
            subject: 'CONTACT FORM', 
          text: req.body.bodyMessage 
        };
        transporter.sendMail(mailOptions, function (err) { 
            if(err) {
                return res.status(500).json({ 
                    msg: err.message 
                });
            }else{
                res.status(200).json('Your Message has been sent');
            }
        });
    }
});

module.exports = router;