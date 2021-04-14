const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    role: {type: String, default: 'pending'},//admin support user pending (teacher student)
    language: {type: String},
    phoneNo: {type: String},
    about: {type: String},
    subjects: {type: String},
    rating: {type: Number, default: 0 },
    projectNos: {type: Number},
    idCard: {type: String},
    profilePicture: {type: String},
    charge: {type: Number},
    video: {type: String},
    interestedRole: {type: String},
},  
{
    timestamps: true
}
)

const User = mongoose.model("User", userSchema);

module.exports = User;