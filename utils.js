const jwt = require('jsonwebtoken');

 const generateToken = (user) =>{
    return jwt.sign({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
    }, process.env.JWT_SECRET || 'somethingsecret', 
    {
    expiresIn: '30d',
    }
    )
}



const isAuth = (req, res, next) =>{
    const authorization = req.headers.authorization;
    if(authorization){
        const token = authorization.slice(7, authorization.length);
        jwt.verify(token, process.env.JWT_SECRET || 'somethingsecret', (err, decode)=>
        {
            if(err){
                res.status(401).send({message: 'Invalid token'});
            }else{
                req.user = decode;
                next();//go to next request function ie. expresshandler request
            }
        });
    }else{
        res.status(401).send({message: 'No Token'});
    }
}

//can do similar for isSupport isUser isTutor isStudent
const isAdmin = (req, res, next) =>{
    if(req.user && req.user.role=="admin"){
        next();
    }else {
        res.status(401).send({message: 'invalid admin token'})
    }
}

module.exports = {
    generateToken,
    isAuth,
    isAdmin,
}