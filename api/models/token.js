const Mongoose = require('mongoose');
const tokenSchema = new Mongoose.Schema({
    _id: Mongoose.Schema.Types.ObjectId,
    _userId: { 
        type: Mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 43200
    }
});



module.exports = Mongoose.model("Token", tokenSchema)