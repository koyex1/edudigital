const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const cors = require('cors');
const userRouter = require('./routers/userRouter') ;
const bookmarkedRouter = require('./routers/bookmarkedRouter') ;
const reviewRouter = require('./routers/reviewRouter')
const transactionRouter = require('./routers/transactionRouter')
//const paymentRouter = require('./routers/paymentRouter')
const path = require('path');
require('dotenv').config();
const app = express();
const http = require('http')
const server = http.Server(app);
const Message = require('./models/messageModel'); 
const User = require('./models/userModel');
const Transaction = require('./models/transactionModel');


//const fileUpload = require('express-fileupload')
//const fileUpload = require('express-fileupload');

const io = require('socket.io')(server, {
    cors:{
        origin: 'https://edudigitals.herokuapp.com',
         
    }
    
});

app.use(cors());
//for passing data into request body ie req.body
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit: 5000}));

//fileupload
//app.use(fileUpload());

//autogenerates localhost/edudigitals and connects to it
// 'mongodb://localhost/edudigitals'
//process.env.MONGODB_URL
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/edudigitals' ,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })

//APIs

const users = {}
const connectedUsers = {}
let rooms = {}
io.on('connection', (socket) =>{
    
    
    let connectedId = socket.handshake.query.user
    console.log('connected.........')
    console.log(socket.handshake.query.dance)
    console.log('userId ' + connectedId)

    if(connectedId){
         connectedUsers[connectedId] && delete connectedUsers[connectedId]
         connectedUsers[connectedId] =socket.id
         console.log('connected Users login and refresh')
         console.log(connectedUsers)
    }


    socket.on('login', userId=>{

        connectedUsers[userId] && delete connectedUsers[userId]
        connectedUsers[userId] =socket.id

        console.log('make i see someting connected Users login and refresh')
        console.log(connectedUsers)

    })
    
    //reserved keyword for closing browser
    socket.on('disconnect', async()=>{
        console.log("refresh disconnection")
         for(let x in connectedUsers){
            if(connectedUsers[x]==socket.id){
                delete connectedUsers[x]
            }
        }

    rooms[socket.id] && await socket.leave(rooms[socket.id][0])
    rooms[socket.id] && await socket.leave(rooms[socket.id][1])
  
    rooms[socket.id] && delete rooms[socket.id]

    })

    socket.on('offline', ()=>{
        console.log("logout disconnection")

        for(let x in connectedUsers){
             if(connectedUsers[x]==socket.id){
                delete connectedUsers[x]
            }
         }
    })

    

    socket.on('sendMessage', async (senderId, recipientId, message)=>{
        console.log(senderId)
        //const sender = await User.findById(senderId).select('firstName lastName profilePicture');
        //const recipient = await User.findById(recipientId).select('firstName lastName profilePicture');

        const messageStore = new Message({
            sender: senderId,
            recipient: recipientId,
            message: message,
        })

        const save = await messageStore.save();
    
   

});





socket.on('typingStatus', async(senderId, recipientId)=>{
    console.log('typing')
    const room = senderId + recipientId
    const roomReversed = recipientId + senderId
    socket.to(room).to(roomReversed).emit('typing', true)

})


socket.on('notification', async(senderId)=>{
   const notification = await Transaction.find({$or: [{tutor: senderId},{student: senderId}]})
   console.log('number of notifications ' + notification.length)

   socket.emit('notificationNo', notification.length)
})



socket.on('leaveRooms', async(senderId, recipientId)=>{
    rooms[socket.id] && await socket.leave(rooms[socket.id][0])
    rooms[socket.id] && await socket.leave(rooms[socket.id][1])
  
    rooms[socket.id] && delete rooms[socket.id]
    console.log('leaving room')
    console.log(rooms)
})


//who presses send and enter chats
socket.on('loadMessages', async (senderId, recipientId) =>{
    console.log('connected Users in load messages')
    console.log(connectedUsers)

    console.log('before joining room')
    console.log(socket.rooms)
    rooms[socket.id] && await socket.leave(rooms[socket.id][0])
    rooms[socket.id] && await socket.leave(rooms[socket.id][1])
  
   // rooms[socket.id] && delete rooms[socket.id]

    const room = senderId + recipientId
    const roomReversed = recipientId + senderId
    rooms[socket.id] = [room, roomReversed]
    
    await socket.join([room, roomReversed]) 

    console.log('after joining room')
    console.log(socket.rooms)

    console.log('rooms and socketids attached')
    console.log(rooms)

    let allMessages = await Message.find({
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
}).select('sender recipient read');



for(let x of allMessages ){

    if(x.recipient==senderId && !x.read){
    x.read = true;
}
// console.log('who you be')
// console.log(x.recipient)
// console.log(x.recipient.toString())
// console.log(connectedUsers[x.recipient.toString()])
// console.log(rooms[connectedUsers[x.recipient.toString()]])
// console.log(rooms)
    if(x.sender==senderId && !x.read && rooms[connectedUsers[x.recipient]] ){// && the other person dey room
    x.read = true
    console.log('i clear the read')
}

await x.save();
    
}

 allMessages = await Message.find({
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
}).select(' message date')

console.log(allMessages)
socket.emit('firstMessage',{allMessages, recipientId , senderId})
//io.to(connectedUsers[recipientId]).to(connectedUsers[senderId]).emit('initialMessages', {allMessages, recipientId , senderId})
//io.to(room).to(roomReversed).emit('initialMessages', {allMessages, recipientId , senderId})
//io.to(room).to(roomReversed).emit('initialMessages')
io.to(room).to(roomReversed).emit('finalMessages', {allMessages, recipientId , senderId})

})


socket.on('whenSendIsHit', async(recipientId)=>{
    
    //only intrested in the recipient colums thats why argument is recipient despite
    //the client looking otherwise.. 
    const distinct = await Message.distinct('sender', {recipient: recipientId, read: false})

    console.log('number of messages ' + distinct.length)
    console.log('sent has been hit na wetin dey happen')

      //only gets called to show the number of unread messages when the sender hits send on his end
   io.to(connectedUsers[recipientId]).emit('sendIsHit', distinct.length)
})

socket.on('justLoggingIn', async(recipientId)=>{
    
    console.log('you should see me second')
    //only intrested in the recipient colums thats why argument is recipient despite
    //the client looking otherwise.. 
    const distinct = await Message.distinct('sender', {recipient: recipientId, read: false})
    console.log('i just they  enter message ' + distinct.length)
       //only gets called to show me the number of unread messages when i logg in
   socket.emit('loggedInNo', distinct.length)
})

socket.on('enteredMessage', async(recipientId)=>{
    
    console.log('you should see me second')
    //only intrested in the recipient colums thats why argument is recipient despite
    //the client looking otherwise.. 
    const distinct = await Message.distinct('sender', {recipient: recipientId, read: false})
    console.log('i just they  enter message ' + distinct.length)
       //only gets called to show me the number of unread messages when i logg in
   socket.emit('entered', distinct.length)
})

socket.on('getContacts', async(senderId)=>{
    
    const distinct = await Message.find({$or:[{sender: senderId},{recipient: senderId}]}).select('sender recipient')
    const fuck = distinct.map(x=>{
        if(x.sender == senderId){
            return x.recipient.toString()
        }
        else if(x.recipient == senderId){
            return x.sender.toString();
        }
    })

    
    const modifiedDistinct = [...new Set(fuck)]
    

    const contacts = await User.find({$or: modifiedDistinct.map(
        x=>({_id: x})
    )}).select('firstName lastName profilePicture')

    const modifiedContacts = [];


    for(let x of contacts){
        let onlineStatus = false;
        if(connectedUsers[x._id]){
            onlineStatus= true
        }

  
        const messagesPerContacts = await Message.find({sender: x._id, recipient: senderId, read: false}).select('message')
        const mPerC = messagesPerContacts.length
        const message = await Message.findOne({$or:[{sender: x._id},{recipient: x._id}]}).sort({_id: -1}).select('message')
        modifiedContacts.push({ ...message.toObject(), ...x.toObject(), onlineStatus, mPerC})
    }
    console.log(modifiedContacts)

    io.to(connectedUsers[senderId]).emit('contactsRefreshed', modifiedContacts)

socket.emit('contacts', modifiedContacts);
})

socket.on('onlineStatus', recipientId=>{

    let isOnline = false;

     if(connectedUsers[recipientId]){
         isOnline = true;
     }
     console.log(isOnline)

    socket.emit('isOnline', isOnline)
    

})


});

app.use('/api/users',userRouter);
app.use('/api/bookmark', bookmarkedRouter);
app.use('/api/review', reviewRouter);
app.use('/api/payment', transactionRouter);




//  if(process.env.NODE_ENV==='production'){

//      app.use(express.static(path.join(__dirname, '../frontend/build')));
//      app.get('*',(req,res)=>{
//          res.sendFile(path.resolve(__dirname, 'frontend' ,'build', 'index.html'))
//      })
//  }else{
// //test APIs
// app.get('/', (req, res)=>{
//     res.send('server is up and running')
// });

//  }




server.listen(process.env.PORT || 5000, ()=> {
    console.log('Serve at http://localhost:5000');
})