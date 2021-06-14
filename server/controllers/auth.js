const bcrypt = require('bcryptjs')
const jwt   =  require('jsonwebtoken')
const {validationResult } = require('express-validator/check')

const User = require('../models/user')

exports.signup = (req, res, next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new Error('Validation fail.')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }
    const email = req.body.email
    const name = req.body.name
    const password = req.body.password
    bcrypt.hash(password,12).then(
        hashedPw =>{
            const user = new User({
                email: email,
                name: name,
                password: hashedPw
            })
            return user.save()
        }
    
    )
    .then(result=>{
        res.status(201).json({message: 'User created', userId: result._id})
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500
        }
        // Encontra a próxima função que lida com erros async
        next(err)
    })
}

exports.login = (req,res,next) =>{
    const email = req.body.email
    const password = req.body.password
    let loadedUser
    User.findOne({email: email})
        .then(user=>{
            if(!user){
                const error = new Error('Email could not be found')
                error.statusCode = 401
                throw error
            }
            loadedUser = user
            return bcrypt.compare(password, user.password)
        })
        .then(isEqual =>{
            if(!isEqual){
                const error = new Error('Wrong password!')
                error.statusCode = 401
                throw error
            }
            const token = jwt.sign({
                email: loadedUser.email, 
                userId: loadedUser._id.toString()}, 
                'somesupersecretesecret', {expiresIn: '1h'})
                res.status(200).json({
                    token: token, 
                    userId: loadedUser._id.toString()}
                    )
        }
        )
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode = 500
            }
            next(err)
        })
}

exports.status = async (req,res,next) =>{
    const userId = req.userId
    try{
        const user = await User.findById(userId)
        if(!user){
            const error = new Error('Could not find user.')
            error.statusCode = 404
            throw error 
        }
        res.status(200).json({message: 'Status fetched.', status: user.status})
    }
    catch{
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)
    }
}

exports.updateStatus = async (req,res, next) =>{
    const userId = req.userId
    const newStatus = req.body.status 

    try {
        const user = await User.findById(userId)
        if(!user){
            const error = new Error('Could not find user.')
            error.statusCode = 404
            throw error 
        }
        user.status = newStatus
        user.save()
        res.json({message: 'Status updated!', status: newStatus})
    }catch{
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)
    }
}