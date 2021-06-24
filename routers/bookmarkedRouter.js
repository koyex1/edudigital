const express = require('express');
const expressAsyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Bookmarked = require('../models/bookmarkedModel');
const {generateToken, isAuth}  = require('../utils.js');


const bookmarkedRouter = express.Router();

bookmarkedRouter.post('/add/:id', expressAsyncHandler(async(req, res)=>{
   //should be req.user._id with isAuth by using body for now
   const student = await User.findById(req.params.id);
    //should be req.body._id but using 
    const tutor = await User.findById(req.body.bookedId);

    console.log(tutor);
    console.log(student);

    let bookmarked = new Bookmarked({
        student: student._id,
        tutor: tutor._id,
    });

    bookmarked = await bookmarked.save();

    console.log(bookmarked);

    res.send({message: "Successfully bookmarked Tutor"});
}));

bookmarkedRouter.get('/get/:id', expressAsyncHandler(async(req,res)=>{

    //req.params.id replace with isAuth req.user._id
    const tutors = await Bookmarked.find({student: req.params.id}).populate('tutor');
    console.log(tutors)

    res.send({tutors});
    
}))

bookmarkedRouter.get('/booked/:id', expressAsyncHandler(async(req,res)=>{

    //req.params.id replace with isAuth req.user._id
    const tutors = await Bookmarked.find({student: req.params.id, isPaid: true});

    res.send({tutors});
    
}))

//delete user
bookmarkedRouter.delete('/delete/:id', expressAsyncHandler(async(req,res)=>{
    const {id} = req.body;
    console.log(id + ' ' + req.params.id)
    const bookmark = await Bookmarked.findOneAndDelete({student: req.params.id, _id: id});
   // console.log(user)
    res.send({
        message: 'User Removed Successfully'
    })
}))


bookmarkedRouter.post('/template', expressAsyncHandler(async(req,res)=>{


}))



module.exports = bookmarkedRouter;