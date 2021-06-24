const mongoose = require( 'mongoose');

const reviewSchema = new mongoose.Schema({

   
        tutor: {type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true,},
        student: {type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true,},
        review: {type: String},
        rating: {type: Number},



    
},
{
    timestamps: true,
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;