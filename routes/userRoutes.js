const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const communityAdmin = process.env.COMMUNITY_ADMIN;

const adminMiddleware = (req, res, next)=>{
    const {admin} = req.body;
    if(!admin || admin !== communityAdmin){
        return res.status(404).json({message:'You are not authorized to access users data'});
    }
    next();
}

// Define routes
router.get('/', adminMiddleware, userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', adminMiddleware, userController.updateUser);
router.delete('/:id', adminMiddleware, userController.deleteUser);

module.exports = router;
