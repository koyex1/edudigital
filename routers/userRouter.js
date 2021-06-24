const express = require('express');
const expressAsyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Token = require('../models/tokenModel');
const upload = require('../fileUpload')
const bcrypt = require('bcryptjs');
const { generateToken, isAuth } = require('../utils.js');
const autoEmailer = require('../transporter');
const { findById } = require('../models/userModel');




const userRouter = express.Router();

userRouter.get('/all', expressAsyncHandler(async (req, res) => {


    let allUsers = await User.find();
     let users = allUsers.map(x=>(
         {id: x._id, firstName: x.firstName, lastName: x.lastName, email: x.email, subjects: x.subjects}
     ))
    res.send({ users });

}));

/*userRouter.get('/seed',
expressAsyncHandler ( async (req, res) => {
    await User.deleteMany({ssssssssssssssssss});
    const createdUsers = await User.insertMany(data.users);
    res.send({createdUsers});
}));*/

//signing in into an account
userRouter.post('/signin', expressAsyncHandler(async (req, res) => {
    const userExist = await User.findOne({ email: req.body.email});
    const userVerified = await User.findOne({email: req.body.email,  verified: true});

    if (userVerified) {
        if (bcrypt.compareSync(req.body.password, userExist.password)) {
            res.send({
                _id: userExist._id,
                firstName: userExist.firstName,
                lastName: userExist.lastName,
                email: userExist.email,
                role: userExist.role,
                token: generateToken(userExist),
            });
        }
        else{
            res.status(404).send({ message: 'Invalid email or password' })
        }
    }
  else{
      if(!userExist){
        res.status(404).send({ message: 'Invalid email or password' })
      }
      else if(!userVerified){
        res.status(404).send({ message: 'User not verified' })

      }
  }
}))

//Registering an account
//upload.single('olumide'),
userRouter.put('/upload/:id', upload.single('file'), expressAsyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id)
    console.log(req.file)
    user.profilePicture.data = req.file.buffer
    user.profilePicture.contentType = req.file.mimetype
    await user.save()
    res.send('single file uploaded')


}))

userRouter.post('/register', upload.fields([{ name: 'file' }, { name: 'file2' }]), expressAsyncHandler(async (req, res) => {
    userBody = JSON.parse(req.body.user)
    var langBody = req.body.language
    var subjBody = req.body.subject
    console.log(subjBody)
    //console.log(req.files);

    //convert multer hijacked file header to buffer
    //const idBuffer = Buffer.from(req.files.file[0].path)
   // const profilePicBuffer = Buffer.from(req.files.file2[0].path)

//console.log(req.files.file[0].buffer.toString('base64'))

    const availableUser = await User.findOne({ email: userBody.email });
    if (availableUser) {
        console.log('do you want to be unfortunate')
        res.status(404).send({ message: 'Email already exists' });
    }
    else {

    const user = new User({
        firstName: userBody.firstName,
        lastName: userBody.lastName,
        email: userBody.email,
        password: bcrypt.hashSync(userBody.password, 8),
        interestedRole: userBody.interestedRole,
        language: langBody,
        country: userBody.country,
        phoneNo: userBody.phoneNo,
        about: userBody.about,
        subjects: subjBody,
        idCard: {
            data: req.files.file2[0].buffer,
            contentType: req.files.file2[0].mimetype,
        },//req.files.file[0].filename,
        profilePicture: {
            data: req.files.file[0].buffer,
            contentType: req.files.file[0].mimetype,
        }, // req.files.file2[0].filename,
        charge: userBody.charge,

    });

    const createdUser = await user.save();

    console.log(createdUser)

    const tokenGenerate = new Token({
        user: createdUser._id,
    })

    const savedToken = await tokenGenerate.save()

        const verificationLink = req.headers.referer + `emailVerification/${savedToken.token}`;
    

         const subject = 'Email Address Verification'
         const text = userBody.firstName + ' ' + userBody.lastName + ' '
         const content = `
                             <h1 style="color: red;">Edudigitals</h1>
                            <h3 >Hi ${userBody.firstName}  ${userBody.lastName} please verify your email</h3>
                            <p> <a href=${verificationLink}> Click Here </a> to verify your email address</p>
                            `
        autoEmailer(userBody.email,subject , text, content)
}
}))

userRouter.post('/validateEmail/:id', expressAsyncHandler(async (req, res) => {

    const tokenValidate = await Token.findOne({token: req.params.id}).populate('user')
    console.log(tokenValidate)
    let createdUser = null;
    if(tokenValidate){
        createdUser = await User.findById({_id: tokenValidate.user._id});
        createdUser.verified = true;
        await createdUser.save();
       await Token.findOneAndDelete({token: req.params.id});

    }
    console.log(createdUser)
     res.send({
      _id: createdUser._id,
         firstName: createdUser.firstName,
         lastName: createdUser.lastName,
         email: createdUser.email,
         role: createdUser.role,
         token: generateToken(createdUser),
     });
}))


userRouter.post('/sendEmail', expressAsyncHandler(async (req, res) => {

    const {email} = req.body
    console.log(email)

    const userBody = await User.findOne({email: email})
    if(!userBody){
        res.status(404).send({ message: 'Email doesnt exist' });
        throw('Error')
    }
   
    const tokenGenerate = new Token({
        email: email,
    })

    const savedToken = await tokenGenerate.save()


    const verificationLink = req.headers.referer + `newpassword/${savedToken.token}`;

    

     const subject = 'Password Change'
     const text = userBody.firstName + ' ' + userBody.lastName + ' '
     const content = `
                         <h1 style="color: red;">Edudigitals</h1>
                        <h3 >Hi ${userBody.firstName}  ${userBody.lastName} </h3>
                        <p> <a href=${verificationLink}> Click Here </a> to change Password</p>
                        `
    autoEmailer(email,subject , text, content)
   
}))



userRouter.post('/changePassAuth', expressAsyncHandler(async (req, res) => {

    const {token, password} = req.body;
   
    

    const tokenValidate = await Token.findOne({token: token})
   
    let user = null;
    if(tokenValidate){
        user = await User.findOne({email: tokenValidate.email});
        user.password = bcrypt.hashSync(password, 8)
        await user.save();
       await Token.findOneAndDelete({token: token});
    }
    if(user){
        res.send({message: 'Password Changed Successfully'})
    }
    else{
        res.send({message: 'not a user or invalid token'})
    }
    console.log(user)
}))

//viewing the profile and editing of a user
userRouter.put('/profile', isAuth, expressAsyncHandler(async (req, res) => {
    //isAuth has done the work of attaching the
    //decoded users info into req.user
    const user = await User.findById(req.user._id);
    if (user) {
        //eliminates null fields
        user.name = req.body.name || user.name; //changed or not changed
        user.email = req.body.email || user.email; //changed or not changed
        if (req.body.password) {
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

userRouter.post('/search', expressAsyncHandler(async (req, res) => {
    //console.log(req.body.search);
    const { search, currentPage, limit, language, country, rating, charge } = req.body;
    const startIndex = (currentPage - 1) * limit;
    const endIndex = currentPage * limit;
    //SEARCH ALGORITHM
    let nonAlpha = false
    let count = 0
    let start=0
    let finish=0
    let newSearch = []
    for(let i= 0 ; i<search.length; i++){
        let condition =( (search.charCodeAt(i)>=65 && search.charCodeAt(i)<=90) || (search.charCodeAt(i)>=97 && search.charCodeAt(i)<=122))
       
        if(condition && count==0){
            nonAlpha = true;
            start = i
        }
        if(condition ){
            nonAlpha = true;
            count ++;
            finish= i
        }
        
        if(!condition || (count!=0 && i==search.length-1)){
            nonAlpha =false;
            
            let word =''
            for(let j=start; j<finish+1 && count !=0; j++){
                word=word+search[j]
            }
            count = 0;
            if(word){
                newSearch.push(word)
            }
        }
        
    }
    customArray = []
    newSearch && newSearch.forEach(search=>{   customArray.push( {firstName: {$regex: search, $options: 'i'}}, { lastName: {$regex: search, $options: 'i'}}, { subjects: {$regex: search, $options: 'i'}} )   })
    const firs = search ? customArray: [{firstName:{$ne:null}}, {lastname:{$ne:null}}, {subjects:{$ne:null}}];
    const lang= {language: language?language:{$ne:null}}
    const coun = { country: country?country:{$ne:null}}
    const rat ={rating: {$gte: rating[0], $lte:rating[1]}}
    const  charg = {charge: {$gte:charge[0],$lte:charge[1]} } 
    const resultUsers = await User.find({ $or: firs, ...lang, ...coun, ...rat, ...charg })
                                        .sort({ rating: "desc" }); //,  role: 'Tutor', language: language?language:{$ne:null}, country: country?country:{$ne:null}, rating: {$gte: rating[0], $lte:rating[1]}, charge: {$gte:charge[0],$lte:charge[1]}  
    //console.log(resultUsers)
    const total = resultUsers.length
    const pageEnd = Math.ceil(total / limit);
    //console.log(resultUsers.length)
    const user = resultUsers.slice(startIndex, endIndex)
    //console.log(req.headers.referer)
    res.send({ user, end: pageEnd, total });
}))

//get users with pending verification for help and support team
userRouter.get('/pending', expressAsyncHandler(async (req, res) => {

    res.send({ user });
}))

userRouter.post('/reverify/:id', upload.fields([{ name: 'file' }, { name: 'file2' }]), expressAsyncHandler(async (req, res) => {
    console.log("reverify in" + req.params.id)
    const user = await User.findById(req.params.id);
    let userSave = null;
    console.log(req.body.user)
    const userBody = JSON.parse(req.body.user)

    if (user) {
        user.role = "pending";
        user.firstName = userBody.firstName
        user.lastName = userBody.lastName
        user.idCard.data = req.files.file[0].buffer,
        user.idCard.contentType =  req.files.file[0].mimetype
        user.profilePicture.data = req.files.file2[0].buffer,
        user.profilePicture.contentType = req.files.file2[0].mimetype,
        userSave = await user.save();
    }

    res.send({
        userDetail: {
            _id: userSave._id,
            firstName: userSave.firstName,
            lastName: userSave.lastName,
            email: userSave.email,
            role: userSave.role,
            token: generateToken(userSave),
        },
        message: 'Details submitted successfully. Wait patiently while we verify your details'
    })

}))

userRouter.get('/pendingusers', expressAsyncHandler(async (req, res) => {
    const user = await User.find({ role: 'pending' , verified: true})
    res.send({ user });
}))

userRouter.put('/verify/:id', expressAsyncHandler(async (req, res) => {

    //---------ID FROM URL OR BODY MODIFICATION ------
    console.log("i am in")
    const { status } = req.body
    const user = await User.findById(req.params.id);
    let userSave = null
    let message = null

    if (user && status === 'true') {
        user.role = user.interestedRole;
        userSave = await user.save();
        console.log()
        message = 'User has been successfully Verified'
    }
    else if (user && status === 'false') {
        user.role = 'user'
        userSave = await user.save();
        message = 'User has been successfully Unverified'
    }



    res.send({
        userDetail: {
            _id: userSave._id,
            firstName: userSave.firstName,
            lastName: userSave.lastName,
            email: userSave.email,
            role: userSave.role,
            token: generateToken(userSave),
        },
        message: message
    })

    if (status = 'true') {
        const subject = 'Accout Verified'
        const text = userSave.firstName + ' ' + userSave.lastName 
        const content = `<h1 style="color: #060b26;">Edudigitals</h1>
                        <h3 style="color: #060b26;">Hi ${userSave.firstName}  ${userSave.lastName}  Your account has now been verified</h3>
                        <p> We are glad to inform you your account has now
                        been verified. You can login now and start using your account</p>
                        `}

    if (status = 'false') {
        const subject = 'Accout Unverified'
        const text = userSave.firstName + ' ' + userSave.lastName 
        const content = `<h1 style="color: #060b26;">Edudigitals</h1>
                        <h3 style="color: #060b26;">Hi ${userSave.firstName}  ${userSave.lastName}  Please wait patiently while we verify your details</h3>
                        <p>Your account has been unverified. This is due to either your Name, Identification card and Profile Picture not matching. Please login
                        to ensure this information are correct by resubmitting your details</p>
                                                `}


    autoEmailer(userSave.email, subject, text, content)
//using email for forgotten password, verify, unverify, registeration

}))


//getting a user by id
userRouter.get('/:id', expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    let subjects = user.subjects.split(',')
    let language = user.language.split(',')
    console.log(subjects)
    console.log({...user.toObject(), subjects, language})
    if (user) {
        res.send(user);
    } else {
        res.status(404).send({ message: 'user not found' });
    }
}))

userRouter.put('/editprofile/:id', expressAsyncHandler(async (req, res) => {
    const { phoneNo, language, subjects, charge, about } = req.body.editedInfo




    const user = await User.findOneAndUpdate({ _id: req.params.id }, req.body.editedInfo, { new: true })
    console.log(user)
    res.send({ message: true })
}))

userRouter.put('/changePassword/:id', expressAsyncHandler(async (req, res) => {

    const {oldPassword, newPassword} = req.body

  
    const user = await User.findById(req.params.id)

    console.log(bcrypt.compareSync(oldPassword, user.password))
 
    if(bcrypt.compareSync(oldPassword, user.password)){
        user.password= bcrypt.hashSync(newPassword, 8)
        await user.save()
        console.log('password matches')
        res.send({message:true})
    }
    else{
        console.log('doesnt match')
        res.send({ message: false });
    }
    


}))




module.exports = userRouter;