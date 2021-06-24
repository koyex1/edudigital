const express = require('express');
const expressAsyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Bookmarked = require('../models/bookmarkedModel');
const {generateToken, isAuth}  = require('../utils.js');
const paypal = require('paypal-rest-sdk');

const paymentRouter = express.Router();

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'Ac-Nq5Us8kWCo7oNBd3GyMFF-EPr3ynE4qJDVSjuPYy729PifVLHBNUTeRTpkLkijAiJe3aYSCqMboAf',
    'client_secret': 'EDAQzN5uEF8FD5nVTGp3EAZZ5IQ9j9HF0QouZth_Kt1sL9-648RsEj-Kpjk6VpL7pJaybTt2v7C8geNm'
  });

 

paymentRouter.post('/pay', expressAsyncHandler(async(req, res)=>{
 
    //paypal payment object
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": "1.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "1.00"
            },
            "description": "This is the payment description."
        }]
    };

    //create transaction
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            for(let i=0 ; i<payment.links.length; i++){
                if(payment.links[i].rel === 'approval_url'){
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });

 }));

 paymentRouter.get('/success', (req, res) =>{
     const payerId = req.query.payerID;
     const paymentId = req.query.paymentId;

     //paypal payment execution object
     const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "1.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
        }
    });
 });

 paymentRouter.get('/cancel', (req, res) => {
     res.send('cancled')
 })

 module.exports = paymentRouter;