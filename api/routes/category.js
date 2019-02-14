const express = require('express');
const router = express.Router();
const Mongoose = require('mongoose');
const Category = require('../models/category');
const Group = require('../models/group');
const CheckAuth = require('../middleware/check-auth');



router.post('/add', CheckAuth, (req, res, next) => {
    const _id = req.body.groupId;
    Group.findById(_id).select('_id').then( function (group)  {
        if(!group) {
            res.status(404).json('Group Not Found');
        }
    })    
    const category = new Category({
        _id:  Mongoose.Types.ObjectId(),
        groupId: _id,
        name: req.body.name
    });
    category.save()
    .then(result => {
        if(result){
            res.status(200).json({
                message: 'Category Saved',
                createdCategory: {
                    _id: result._id,
                    name: result.name,
                    groupId: result.groupId,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/categories'
                    }
                }
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
})

//get all categories
router.get('/', (req, res, next) => {
    Category.find()
    .select('name _id groupId')
    .exec()
    .then(docs => {
        if(docs.length > 0){
            const response = {
                count: docs.length,
                categoryArray: docs.filter(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        groupId: doc.groupId
                    }
                })
            }
            res.status(200).json(response);
        }else{
            res.status(404).json({
                message: 'No Entries Found'
            });
        }
    })
    .catch(err => {
        error: err
    });
});



module.exports = router;