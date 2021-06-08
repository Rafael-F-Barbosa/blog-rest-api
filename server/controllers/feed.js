const { validationResult } = require('express-validator')

const Post = require('../models/post')

exports.getPosts = (req,res,next) => {
    Post.find()
    .then(posts=>{
        res.status(200).json({
            message: 'Posts fetched.',
            posts: posts
        })
    })
    
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500
        }
        // Encontra a próxima função que lida com erros async
        next(err)
    })
}



exports.createPost = (req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new Error('Validation fail, entered data is incorrect!')
        error.statusCode = 422
        // Encontra próxima função q lida com erros  
        throw error
    }
    if(!req.file){
        const error = new Error('No image provided.')
        error.statusCode = 422
        throw error
    }
    const imageUrl = req.file.path // Obtém imagem de file
    const title = req.body.title
    const content = req.body.content
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: {
            name: 'joao'
        }
    })
    post.save().then(
        result=>{
            console.log(result)
            res.status(201).json({
                message: "Post created successfully",
                post:result
            })
        }
    ).catch(err => {
        if(!err.statusCode){
            err.statusCode = 500
        }
        // Encontra a próxima função que lida com erros async
        next(err)
    }
    )
}

exports.getPost = (req,res,next)=>{
    const postId = req.params.postId 
    Post.findById(postId)
    .then(
        post =>{
            if(!post){
                const error = new Error('Could not find post.')
                error.statusCode = 404
                throw error // Throw to the next catch block
            }
            res.status(200).json({message: 'Post fetched.', post: post})
        }
    )
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500
        }
        // Encontra a próxima função que lida com erros async
        next(err)
    })
}