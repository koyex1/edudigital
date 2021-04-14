const mongoose = require( 'mongoose');

const bookedSchema = new mongoose.Schema({

    bookedItems: [{
        tutor: {type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true,},

    }],
    
},
{
    timestamps: true,
});

const Booked = mongoose.model('Booked', bookedSchema);

module.exports = Booked;