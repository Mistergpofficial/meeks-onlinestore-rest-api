const Mongoose = require('mongoose');
const schema = Mongoose.Schema;

const groupSchema = new schema({
    _id: Mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: [true, 'Name Field is Required']
    }
});


module.exports = Mongoose.model("Group", groupSchema);