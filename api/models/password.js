const Mongoose = require('mongoose');
const schema = Mongoose.Schema;

const passwordSchema = new schema({
    _id: Mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required: [true, 'Email Address is Required']
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date 
});


module.exports = Mongoose.model('Password', passwordSchema);