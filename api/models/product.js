const Mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const schema = Mongoose.Schema;

const productSchema = new schema({
    _id: Mongoose.Schema.Types.ObjectId,
    groupId: {
        type: String,
        ref: 'Group',
        required: [true, 'Group Cannot Be Blank'],
    },
    categoryId: {
        type: String,
        ref: 'Category',
        required: [true, 'Category Cannot Be Blank'],
    },
    name: {
        type: String,
        required: [true, 'Product Name Cannot Be Blank']
    },
    quantity: {
        type: Number,
        default: 1,
        required: [true, 'Quantity Cannot Be Blank']
    },
    description: {
        type: String,
        required: [true, 'Description Cannot Be Blank']
    },
    price: {
        type: Number, 
        required: [true, 'Price Field Cannot Be Blank']
    },
    image: {
        type: String,
        required: [true, 'Product Image Cannot Be Blank']
    }

});
productSchema.plugin(mongoosePaginate);
module.exports = Mongoose.model('Product', productSchema);