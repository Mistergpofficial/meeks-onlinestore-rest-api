const Mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const schema = Mongoose.Schema;


const userSchema = new schema({
    _id: Mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
         required: [true, 'Email is required'],
         unique: true
     },
     password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 character long'],
        maxlength: 100
      },
      full_name: {
        type: String,
        required: [true, 'Full Name is required']
    },
    address: {
        type: String,
        required: [true, 'Address Cannot Be Blank']
    },
    city: {
        type: String,
        required: [true, 'City Cannot Be Blank']
    },
    state: {
        type: String,
        required: [true, 'State Cannot Be Blank']
    },
    country: {
        type: String,
        required: [true, 'Country Cannot Be Blank']
    },
    phone: {
        type: Number,
        required: [true, 'Phone Number Cannot Be Blank']
    },
      createdAt: {
          type: Date,
          default: Date.now
      },
      updatedAt: {
          type: Date,
          default: Date.now
      },
      isVerified: { type: Boolean, default: false },
     is_admin: {
         type: Number
     }

});



//pre event schema
// userSchema.pre('save', function (next) {
//         bcrypt.hash(this.password, 10, (err, hash) => {
//             this.password = hash;
//             //this.saltSecret = salt;
//             next();
//         });
   
// });

userSchema.path('email').validate((val) => {
    emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ 
    return emailRegex.test(val);
}, 'Invalid Email');


module.exports = Mongoose.model("User", userSchema)