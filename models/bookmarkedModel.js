const mongoose = require( 'mongoose');

const bookmarkedSchema = new mongoose.Schema({

    student: {type: mongoose.Schema.Types.ObjectId,
        ref: 'User',},
    tutor: {type: mongoose.Schema.Types.ObjectId,
            ref: 'User',},
    isPaid: {type: Boolean , default: false},
    
},

{
    timestamps: true,
});

const Bookmarked = mongoose.model('Bookmarked', bookmarkedSchema);

module.exports = Bookmarked;