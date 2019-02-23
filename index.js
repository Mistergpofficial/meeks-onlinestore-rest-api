const cron = require("node-cron");
const express = require("express");
const mongoose = require('mongoose');
let nodemailer = require("nodemailer");
const Order = require('./api/models/order');

app = express();


 // create mail transporter
 var transporter = nodemailer.createTransport({ 
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: { 
        user: '3348b04943bfb0', 
        pass: '01c1ffe9a3b4bb' 
               } 
    });



//     cron.schedule("*/2 * * * *", function() {
//     console.log("---------------------");
//     console.log("Running Cron Job");
//     mongoose.connect(process.env.MONGODB_URI ||  'mongodb://localhost:27017/meeks', {useNewUrlParser: true});

//     Order.find()
//     .exec()
//     .then(docs => {
//         if(docs){
//             console.log(docs)
//         }else{
//             console.log('Not Found')
//         }
//     });
// });

// sending emails at periodic intervals
cron.schedule("*/2 * * * *", function() {
    console.log("---------------------");
    console.log("Running Cron Job");
    mongoose.connect(process.env.MONGODB_URI ||  'mongodb://localhost:27017/meeks', {useNewUrlParser: true});
    Order.find()
    .where('status').equals('CANCELLED')
    .limit(1)
    .exec()
    .then(doc => {
        if(doc){
            // const response = {
            //     count: docs.length,
            //     orderArray: docs.map(doc => {
            //         return {
            //             id: doc._id,
            //             uniqueId: doc.uniqueId,
            //             user: doc.user,
            //             cart: doc.cart,
            //             reference: doc.reference,
            //             status: doc.status,
            //             createdAt: doc.createdAt
            //         }
            //     })
            // }
            // const d = {
            //     newArray: response.orderArray.map(m => {
            //         return {
            //            status: m.status,
            //             id:  m.id,
            //             uniqueId: m.uniqueId,
            //             full_name: m.user.full_name,
            //             email: m.user.email
            //         }
            //     })
            // }
           // console.log(d.newArray)
           // var rep = d.newArray.filter(obj => JSON.stringify(obj.status));
           // console.log(rep[0]);
        //    res.status(200).json({
        //     _id: doc._id,
        //     uniqueId: doc.uniqueId,
        //     user: doc.user,
        //     cart: doc.cart
        // })
            //   var rep = doc.filter(obj => {
            //       return {
            //         _id: doc._id,
            //         uniqueId: doc.uniqueId,
            //         user: doc.user,
            //         cart: doc.cart
            //       }
            //   });
            //console.log(JSON.stringify(doc));
             var email = doc.map(obj => obj.user.email).pop();
             var status = doc.map(obj => obj.status).pop();
             var full_name = doc.map(obj => obj.user.full_name).pop();
             id = doc.map(obj => obj._id).pop();
             var uniqueId = doc.map(obj => obj.uniqueId).pop();
        //    console.log(email);
        //    console.log(status);
        //    console.log(full_name);
        //    console.log(id);
        //    console.log(uniqueId);

            if(status === "CANCELLED"){
                mongoose.connect(process.env.MONGODB_URI ||  'mongodb://localhost:27017/meeks', {useNewUrlParser: true});
   Order.remove({_id: id}).exec().then(function (result) {
                    if(result){
                            const mailOptions = { 
                                      from: 'no-reply@yourwebapplication.com', 
                                       to: email, 
                                       subject: 'Order Has Been Cancelled', 
                                      text: 'Hello,\n\n' + full_name + 'Your Order:' + id + ' ' + 'has been successfully cancelled' };
                                      transporter.sendMail(mailOptions, function (err) { 
                                        if (err) {
                                        throw err;
                                                }else{
                                                    console.log('A verification email has been sent to ' + email + '.');
                                                   // res.status(200).json('A verification email has been sent to ' + doc.user.email + '.');
                                                }
                                            });
                                             // transporter.sendMail ends
                    } 
                    else{
                        return;
                    }  
                });  
            }
        }else{
            console.log('Not found')
        }
    })
    .catch(err => {
        throw err
    });
})


  // sending emails at periodic intervals
//   cron.schedule("*/2 * * * *", function(){
//     console.log("---------------------");
//     console.log("Running Cron Job");
//     let mailOptions = {
//       from: "COMPANYEMAIL@gmail.com",
//       to: "ehuriahgodspower@gmail.com",
//       subject: `Not a GDPR update ;)`,
//       text: `Hi there, this email was automatically sent by us`
//     };
//     transporter.sendMail(mailOptions, function(error, info) {
//       if (error) {
//         throw error;
//       } else {
//         console.log("Email successfully sent!");
//       }
//     });
//   });


app.listen("3128");