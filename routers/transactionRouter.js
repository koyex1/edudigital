const express = require('express');
const expressAsyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const {generateToken, isAuth}  = require('../utils.js');


const transactionRouter = express.Router();

transactionRouter.post('/add', expressAsyncHandler(async(req, res)=>{
   const {payerID, orderID, userInfo, update_time, cartInfo} = req.body

   console.log(cartInfo)
   console.log(payerID)
   console.log(orderID)
   console.log(update_time)


    for(let cart of cartInfo){
        const transac = new Transaction({
            tutor: cart._id,
            student: userInfo._id,
            payerId: payerID,
            orderId: orderID,
            amount: cart.qty * cart.charge,
            transactionTime: update_time,
        })

        const saveTransaction = await transac.save();
    }

}));

transactionRouter.get('/ongoingTutors/:id', expressAsyncHandler(async(req,res)=>{

    //req.params.id replace with isAuth req.user._id
    const tutors = await Transaction.find({student: req.params.id}).select('tutor amount').populate('tutor', {firstName: 1, lastName: 1, subjects: 1});
    console.log(tutors)
    res.send({tutors});
    
}))

transactionRouter.get('/ongoingStudents/:id', expressAsyncHandler(async(req,res)=>{

    //req.params.id replace with isAuth req.user._id
    const students = await Transaction.find({tutor: req.params.id}).select('tutor amount').populate('student', {firstName: 1, lastName: 1, subjects: 1});
    console.log(students)

    res.send({students});
    
}))

transactionRouter.get('/getAll', expressAsyncHandler(async(req,res)=>{

    const allTransactions = await Transaction.find({}).select('orderId amount transactionTime appeal appealReason complete completeReason').populate('tutor', {firstName: 1, lastName: 1, email: 1}).populate('student', {firstName: 1, lastName: 1, email: 1});

    console.log(allTransactions)

    res.send({allTransactions})
    
}))

transactionRouter.put('/complete/:id', expressAsyncHandler(async(req,res)=>{
console.log(req.body)
    const {complete, reason, tutor} = req.body
    const transaction = await Transaction.findById(req.params.id).select('complete completeReason appeal')
    const user = await User.findById(tutor).select('tutorials')
    console.log(user)

    transaction.complete = complete;
    transaction.completeReason = reason;
    if(complete){
        transaction.appeal = false;
        user.tutorials = user.tutorials + 1;
    }
    
    await user.save()
    
    const saveTransaction = await transaction.save();
    console.log(saveTransaction)

    res.send({message:'Response Submitted'})
    
}))

transactionRouter.put('/appeal/:id', expressAsyncHandler(async(req,res)=>{
console.log(req.body)
    const {appeal, reason} = req.body
    const transaction = await Transaction.findById( req.params.id).select('appeal appealReason')

    transaction.appeal = appeal;
    transaction.appealReason = reason
    

    const saveTransaction = await transaction.save();

    console.log(saveTransaction)

    res.send({message: 'Response Submitted'})
    
}))


transactionRouter.get('/notification/:id', expressAsyncHandler(async(req,res)=>{

    const notification = await Transaction.find({$or: [{tutor: req.params.id},{student: req.params.id}]}).select('complete appeal orderId').populate('tutor', {firstName: 1, lastName: 1}).populate('student',  {firstName: 1, lastName: 1})

    res.send(notification)
        
    }))



module.exports = transactionRouter;