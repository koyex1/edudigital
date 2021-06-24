const mongoose = require( 'mongoose');

const transactionSchema = new mongoose.Schema({
        tutor: {type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true,},
        student: {type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true,},
        payerId: {type: String},
        orderId:{type: String},
        amount: {type: Number},
        transactionTime: {type: String},
        appeal:{type: Boolean},
        appealReason: {type: String},
        complete: {type: Boolean },
        completeReason: {type: String},
        read: {type: Boolean, default: false}
    
},
{
    timestamps: true,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;