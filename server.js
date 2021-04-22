const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRouter = require('./routers/userRouter') ;
const bookmarkedRouter = require('./routers/bookmarkedRouter') ;
const path = require('path');
require('dotenv').config();
const app = express();
const http = require('http')
const server = http.Server(app);
const Message = require('./models/messageModel'); 
const User = require('./models/userModel');
const io = require('socket.io')(server, {
    cors:{
        origin: '*',
    }
});

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

io.on('connect', (socket) =>{
    socket.on('sendMessage', async (senderId, recipientId, message)=>{
        const sender = await User.findById(senderId);
        const recipient = await User.findById(recipientId)

        const messageStore = new Message({
            sender: sender._id,
            recipient: recipient._id,
            message: message,
        })

        const save = await messageStore.save();

        
    //await socket.emit('messages', allMessages)

  

});

socket.on('loadMessages', async (senderId, recipientId) =>{

    const allMessages = await Message.find({
        $or:[{
        $and: [
            {sender: senderId},
            {recipient: recipientId}

        ]},{
        $and: [
            {sender: recipientId},
            {recipient: senderId}

        ]}
    ]
});
    socket.emit('initialMessages', allMessages)
    
})

socket.on('getContacts', async(senderId)=>{
    const distinct = await Message.distinct('recipient', {sender: senderId})
    console.log(distinct)
    const contacts = await User.find({$or: distinct.map(
        x=>({_id: x})
    )}).populate('recipient')
    
    console.log(contacts)
socket.emit('contacts', contacts);
})

});

app.use('/api/users',userRouter);
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

server.listen(process.env.PORT || 5000, ()=> {
    console.log('Serve at http://localhost:5000');
})