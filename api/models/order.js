const Mongoose = require('mongoose');
const schema = Mongoose.Schema;

const orderSchema = new schema({
    id: Mongoose.Schema.Types.ObjectId,
    uniqueId: {
        type: String
    },
    user: {
        type: Object,
         ref: 'User'
        },
    cart: {
        type: Object, 
        required: true
    },
    reference: {type: String},
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: 'NOT ORDERED'
    }
});

module.exports = Mongoose.model('Order', orderSchema);