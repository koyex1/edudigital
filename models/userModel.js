const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    role: {type: String, default: 'pending'},//admin support user pending (teacher student)
    language: {type: String},
    country: {type: String},
    phoneNo: {type: String},
    about: {type: String},
    subjects: {type: String},
    rating: {type: Number, default: 0 },
    projectNos: {type: Number},
    idCard: {data: Buffer, contentType: String},
    profilePicture: {data: Buffer, contentType: String},
    charge: {type: Number},
    tutorials: {type: Number, default: 0},
    interestedRole: {type: String},
    verified: {type: Boolean , default: false},
},  
{
    timestamps: true
}
)

const User = mongoose.model("User", userSchema);

module.exports = User;