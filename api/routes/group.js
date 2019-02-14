const express = require('express')
const router = express.Router();
const Mongoose = require('mongoose')
const Group = require('../models/group');
const CheckAuth = require('../middleware/check-auth');

router.post('/add', CheckAuth, (req, res, next) => {
    const group = new Group({
        _id: Mongoose.Types.ObjectId(),
        name: req.body.name
    });
    group.save()
    .then(result => {
        res.status(200).json({
            message: 'Added Successfully',
            createdGroup: {
                _id: result._id,
                name: result.name,
                request: {
                    type: "GET",
                    url: 'http://localhost:3000/groups/' + result._id
                }
            }
            });
    })
    .catch(err => {
        if(err.name === 'ValidationError'){
            const valErrors = [];
            Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
            res.status(422).json(valErrors)
        }
    });
});

//get all collections
router.get('/', (req, res, next) => {
    Group.find()
    .select('_id name')
    .exec()
    .then(docs => {
        if(docs.length > 0){
            const response = {
                count: docs.length,
                groupsArray: docs.filter(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/groups/' + doc._id
                        }
                    }
                })
            };
            res.status(200).json(response);
        }else{
            res.status(500).json('No Entries Found');
        }
    })
    .catch(err => {
       res.status(500).json(err);
    });
})

router.get('/:groupId', CheckAuth, (req, res, next) => {
    const id = req.params.groupId;
    Group.findById(id)
    .select('_id name')
    .exec()
    .then(doc => {
        if(doc){
            res.status(200).json({
                group: doc,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/groups'
                }
            });
        }
    })
    .catch(err => {
       res.status(500).json({
        error: err
       });
    });
});



module.exports = router;