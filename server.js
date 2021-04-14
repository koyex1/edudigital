const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRouter = require('./routers/userRouter') ;
const bookmarkedRouter = require('./routers/bookmarkedRouter') ;
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
//for passing data into request body ie req.body
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//autogenerates localhost/edudigsitals and connecths to it
mongoose.connect(process.env.MONGODB_URL ,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })

//APIs
app.use('/api/userss',userRouter);
app.use('/api/bookmarked', bookmarkedRouter);

// if(process.env.NODE_ENV==='production'){
//     app.use(express.static('frontend/build'));
//     app.get('*',(req,res)=>{
//         res.sendFile(path.resolve(__dirname, 'frontend' ,'build', 'index.html'))
//     })
// }



//test APIs
app.get('/', (req, res)=>{
    res.send('server is up and running')
});

app.listen(process.env.PORT || 5000, ()=> {
    console.log('Serve at http://localhost:5000');
});