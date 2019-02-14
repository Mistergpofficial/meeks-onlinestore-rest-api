const Mongoose = require('mongoose');
const schema = Mongoose.Schema;

const orderSchema = new schema({
    id: Mongoose.Schema.Types.ObjectId,

    user: {
        type: Object,
         ref: 'User'
        },
    cart: {
        type: Object, 
        required: true
    },
    reference: {type: String}
});

module.exports = Mongoose.model('Order', orderSchema);