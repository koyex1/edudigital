const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    message: {type: String, required: true},
    read: {type: Boolean, default: false},
    date: {type: Number, default: Date.now() +  60000 * (new Date().getTimezoneOffset())},
},  
    
{
    timestamps: true
}
)

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;