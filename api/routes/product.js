const express = require('express');
const router = express.Router();
const Mongoose = require('mongoose');
const Product = require('../models/product');
const Category = require('../models/category');
const Group = require('../models/group');
const CheckAuth = require('../middleware/check-auth');
const multer = require('multer');
const cloudinary = require('cloudinary');


 const storage = multer.diskStorage({
     destination: (req, file, cb) => {
         cb(null, './uploads/');
     },
     filename: (req, file, cb) => {
         cb(null, file.originalname);
     },
 });
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        //accept a file
        cb(null, true)
    }else{
        //reject a file
        cb(new Error('Only .jpeg or .png files are accepted'), false);
   } 
} 

const upload = multer({storage: storage, fileFilter: fileFilter, limits: {
    fileSize: 1024 * 1024 * 20
}
});

cloudinary.config(process.env.CLOUDINARY_URL);





router.post('/add', CheckAuth, upload.single('image'), (req,res, next) => {
    cloudinary.uploader.upload(req.body.image, function(result) {
       
    var image = req.body.image;
    image = result.secure_url;
    const groupId = req.body.groupId;
    const categoryId = req.body.categoryId;
    Group.findById(groupId).select('_id name')
    .exec()
    .then(group => {
        if(!group) {
            res.status(404).json({
                message: 'Group Not Found'
            });
        }
    })
    Category.findById(categoryId).select('_id name groupId')
    .exec()
    .then(category => {
        if(!category) {
            res.status(404).json({
                message: 'Category Not Found'
            });
        }
    })
    
    const product = new Product({
        _id:  Mongoose.Types.ObjectId(),
        groupId: groupId,
        categoryId: categoryId,
        name: req.body.name,
        description: req.body.description,
        quantity: req.body.quantity,
        price: req.body.price,
        image: image
    });
    product.save()
    .then(result => {
        if(result){
           res.status(200).json({
            message: 'Product Added',
            createdProduct: {
                _id: result._id,
                groupId: result.groupId,
                categoryId: result.categoryId,
                name: result.name,
                quantity: result.quantity,
                description: result.description,
                price: result.price,
                image: result.image
            }
           });
        }else{
            res.status(500).json({
                message: 'Could Not Save'
            });
        }
    })
    .catch(err => {
        if(err.name === 'ValidationError'){
            const valErrors = [];
            Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
            res.status(422).json(valErrors)
        }
    });
     
});
});

//get all products
router.get('/', (req, res, next) => {
    Product
    .find()
    .select('_id groupId categoryId price quantity description image name')
    .exec()
    .then(products => {
        if(products.length > 0){
            const response = {
                count: products.length,
                productArray: products.filter(product => {
                    return {
                        name: product.name,
                        price: product.price,
                        quantity: product.quantity,
                        groupId: product.groupId,
                        description: product.description,
                        categoryId: product.categoryId,
                        image: product.image
                    }
                })
            }
            res.status(200).json(response);
        }else{
            res.status(404).json({
                message: 'No Entries Found'
            })
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .select('name price quantity groupId description categoryId image')
    .then(doc => {
        if(doc){
            res.status(200).json(doc);
        }else{
            res.status(404).json({
                message: "No entry found for provided ID"
            });
        }
    })
    .catch(err => {
        res.status(500).json({
            message: err
        });
    });
});
//get products by category
router.get('/category/:categoryId', (req,res,next) => {
    const categoryId = req.params.categoryId;
    const {page, perPage} = req.query;
    var options = {
        page: parseInt(page,10) || 1,
        limit: parseInt(perPage,10) || 1,
       

      };
   // Product.find({'categoryId':categoryId}).select('name price quantity image description')
   Product.paginate({'categoryId':categoryId}, options)
    .then(docs => {
        if(docs){
         res.status(200).json(docs); 
        }else{
            res.status(404).json({
                message: "No entry found for provided Category ID"
            }); 
        }
    })
    .catch(err => {
        res.status(500).json({
            message: err
        });
    });
});


//get one product each from category
router.get('/productByCat/ntui', (req, res, next) => {  
Product
.aggregate([
        { $sort: { categoryId: 1, name: 1, _id: 1, image: 1, price: 1 }},
        {
            $group:
            {
                _id: "$categoryId",
                productId: { $first: "$_id"},
                firstProductName: { $first: "$name"},
                firstProductImage: { $first: "$image"},
                firstProductPrice: { $first: "$price"}
            }
        }
    ])
   .exec()
   .then(product => {
        if(product.length > 0){
            res.status(200).json(product)
         }else{
            res.status(404).json({
                message: 'error'
            })
        }
   })
   .catch(err => {
    res.status(500).json({
        message: err
    });
   });
});

module.exports = router