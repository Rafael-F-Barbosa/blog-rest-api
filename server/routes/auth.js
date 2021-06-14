const express = require('express')
const {body} = require('express-validator')

const User = require('../models/user')

const authController = require('../controllers/auth');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.put('/signup',[
    body('email').isEmail().withMessage('Please enter a valid email.')
        .custom((value, {req})=>{
            return User.findOne({email: value}).then(userDoc =>{
                if(userDoc){
                    return Promise.reject('Email adress already exists.')
                }
            })
        }).normalizeEmail(),
    body('password').trim().isLength({min: 5}),
    body('name').trim().not().isEmpty()
], authController.signup)

router.post('/login', authController.login)

router.get('/status', isAuth,  authController.status)

router.patch('/status', isAuth, [
    body('status').trim().not().isEmpty()
], authController.updateStatus)

module.exports = router