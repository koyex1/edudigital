const express = require('express');
const expressAsyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const {generateToken, isAuth}  = require('../utils.js');


const userRouter = express.Router();

userRouter.get('/all',expressAsyncHandler(async(req, res)=>{


    const allUsers = await User.find();
    res.send({allUsers});

}));

/*userRouter.get('/seed', 
expressAsyncHandler ( async (req, res) => {
    await User.deleteMany({ssssssssssssssssss});
    const createdUsers = await User.insertMany(data.users);
    res.send({createdUsers});
}));*/

//signing in into an account
userRouter.post('/signin', expressAsyncHandler(async (req,res)=>{
    const user = await User.findOne({email: req.body.email});

    if(user){
        if(bcrypt.compareSync(req.body.password, user.password)){
            res.send({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user),
            });
            return;
        }
    }
    res.status(404).send({message: 'invalid email or password'})
}))

//Registering an account
userRouter.post('/register', expressAsyncHandler(async(req,res) => {
    //actually User model from model directory
     const availableUser = await User.findOne({email: req.body.email});
     if(availableUser){
        res.status(404).send({message: 'Email already exists'});
     }
     const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        role: req.body.role,
        interestedRole: req.body.interestedRole,
        language: req.body.language,
        phoneNo: req.body.phoneNo,
        about: req.body.about,
        rating: req.body.rating,
        subjects: req.body.subjects,
        idCard: req.body.id,
        profilePicture: req.body.profilePicture,
        charge: req.body.charge,

    });

     const createdUser = await user.save();
     res.send({
        _id: createdUser._id,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        email: createdUser.email,
        role: createdUser.role,
        token: generateToken(createdUser),
    });
}))



//viewing the profile and editing of a user
userRouter.put('/profile', isAuth, expressAsyncHandler(async (req, res) => {
    //isAuth has done the work of attaching the 
    //decoded users info into req.user
    const user = await User.findById(req.user._id);
    if(user){
        //eliminates null fields
        user.name = req.body.name || user.name; //changed or not changed
        user.email = req.body.email || user.email; //changed or not changed
        if(req.body.password){
            user.password = bcrypt.hashSync(req.body.password, 8); //changed or not changed
        }
        const updatedUser = await user.save();
        res.send({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser),


            
        })
    }
}))

userRouter.post('/search', expressAsyncHandler(async(req,res)=>{
    console.log(req.body.search);
    const {search, currentPage, limit, language, rating, charge} = req.body;
    const startIndex =(currentPage -1) * limit;
    const endIndex = currentPage * limit;
    const resultUsers = await User.find({firstName: search?search:{$ne:null} ,role: 'tutor', language: language?language:{$ne:null}, rating: {$gte: rating[0], $lte:rating[1]}, charge: {$gte:charge[0],$lte:charge[1]}}).sort({rating: "desc"});
    const pageEnd = Math.ceil(resultUsers.length/limit);
    console.log(resultUsers.length)
    const user = resultUsers.slice(startIndex, endIndex)
    res.send({user, end: pageEnd});
    }))

//get users with pending verification for help and support team
userRouter.get('/pending', expressAsyncHandler(async(req,res)=>{
const user = await User.find({verified: 'pending'});
res.send({user});
}))


userRouter.get('/pendingusers', expressAsyncHandler(async(req,res)=>{
const user = await User.find({role: 'pending'})
res.send({user});
}))

userRouter.put('/verify/:id', expressAsyncHandler(async(req,res)=>{

    //---------ID FROM URL OR BODY MODIFICATION ------
    const {status} = req.body
    const user = await User.findById(req.params.id);
    console.log(user)
    if(user && status==='true' ){
        user.role= user.interestedRole;
        const userSave = await user.save();
        console.log(userSave)
        res.send({message: 'User has been verified'})
    }
    else if(user && status==='false'){
        user.role = 'user'
        const userSave = await user.save();
        res.send({message: 'User has been unverified'})
    }
    res.send({user})

}))

//getting a user by id
userRouter.get('/:id', expressAsyncHandler(async(req,res)=>{
    const user = await User.findById(req.params.id);
    if(user){
        res.send(user);
    }else{
        res.status(404).send({message: 'user not found'});
    }
}))


module.exports = userRouter;