const mongoose = require( 'mongoose');
const {v4: uuidv4} = require('uuid');
 

const tokenSchema = new mongoose.Schema({

    user: {type: mongoose.Schema.Types.ObjectId,
        ref: 'User',},
    email: {type: String},
    token: {type: String, default: uuidv4() }, 
},

{
    timestamps: true,
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;