const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const month= ['Jan','Feb','Mar','Apr','May', 'Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const day = [
    'Sunday','Mon','Tue', 'Wedy','Thu','Fri',
    'Sat'];

const date= new Date();


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
    Date: {type: String, default: date},
},  
{
    timestamps: true
}
)

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;