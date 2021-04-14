const express = require('express');
const expressAsyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Bookmarked = require('../models/bookmarkedModel');
const {generateToken, isAuth}  = require('../utils.js');


const bookmarkedRouter = express.Router();

bookmarkedRouter.post('/add', expressAsyncHandler(async(req, res)=>{
   //should be req.user._id with isAuth by using body for now
   const student = await User.findById(req.body.studentId);
    //should be req.body._id but using 
    const tutor = await User.findById(req.body.tutorId);

    console.log(tutor);
    console.log(student);

    let bookmark = new Bookmarked({
        tutor: tutor._id,
        student: student._id,
    });

    bookmark = await bookmark.save();

    console.log(bookmark);

    res.send({bookmark});
}));

bookmarkedRouter.get('/bookmarked/:id', expressAsyncHandler(async(req,res)=>{

    //req.params.id replace with isAuth req.user._id
    const tutors = await Bookmarked.find({student: req.params.id, isPaid: false});

    res.send({tutors});
    
}))

bookmarkedRouter.get('/booked/:id', expressAsyncHandler(async(req,res)=>{

    //req.params.id replace with isAuth req.user._id
    const tutors = await Bookmarked.find({student: req.params.id, isPaid: true});

    res.send({tutors});
    
}))

bookmarkedRouter.post('/template', expressAsyncHandler(async(req,res)=>{


}))



module.exports = bookmarkedRouter;