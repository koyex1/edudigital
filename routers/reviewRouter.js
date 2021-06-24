const express = require('express');
const expressAsyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Review = require('../models/reviewsModel');
const {generateToken, isAuth}  = require('../utils.js');
const mongoose = require('mongoose')

const reviewRouter = express.Router();


reviewRouter.post('/add/:id', expressAsyncHandler(async(req, res)=>{
    console.log(req.params.id)
    console.log(req.body)
    const {review, rating, tutorId} = req.body
    const studentId = req.params.id


    const reviewPost = new Review({
        tutor: tutorId,
        student: studentId,
        review: review,
        rating: rating,

    })

    const reviewSave = await reviewPost.save();


    let castId = mongoose.Types.ObjectId(tutorId)

    const tutorReview = await Review.aggregate([{$match:{tutor: castId}},
    {$group:{_id: null, rating:{$sum: "$rating"}}}])
    
    const reviewNo = await Review.find({tutor: tutorId}).countDocuments();
   

   
    const avgRating = tutorReview[0].rating/reviewNo;
    console.log(avgRating)

   // const tutorReview = new Review.find({tutor: tutorId})
   // console.log(tutorReview)
   const user = await User.findOneAndUpdate({_id: tutorId}, {rating: avgRating.toFixed(1)}, {new: true})

    res.send(reviewSave)
    console.log(reviewSave)

 }));

 reviewRouter.post('/get/:id', expressAsyncHandler(async(req, res)=>{
     console.log('in innnnn')
     console.log(req.body)
    const {currentPage, limit} = req.body
    console.log(currentPage + ' ' + limit)
    const startIndex = (currentPage - 1) * limit;
    const endIndex = currentPage * limit;
   const findReview = await Review.find({tutor: req.params.id}).populate('student')
   const total = findReview.length;
   const pageEnd = Math.ceil(total/limit)
   const review = findReview.slice(startIndex, endIndex)
    console.log(review)
    res.send({review, pageEnd, total})

 }));





 module.exports = reviewRouter;