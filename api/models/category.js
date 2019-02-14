const Mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate')
const schema  = Mongoose.Schema;

const categorySchema = new schema({
    _id: Mongoose.Schema.Types.ObjectId,
    groupId: {
        type: String,
        ref: 'Group',
        required: [true, 'Group Cannot Be Blank'],
    },
    name: {
        type: String,
        required: [true, 'Category Name Cannot Be Blank']
    }
});
categorySchema.plugin(mongoosePaginate);
module.exports = Mongoose.model('Category', categorySchema);