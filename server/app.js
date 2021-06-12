// Pacotes utilizados
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')



// Carrega variáveis de ambiente
require('dotenv/config');

// Importa rotas do feed
const feedRoutes = require('./routes/feed');
// Importa rotas de autenticação
const authRoutes = require('./routes/auth');

// Cria app com express
const app = express();

// Configuração para upload de imagens
const fileStorage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'images')
    },
    filename: (req, file, cb)=>{
        cb(null, new Date().toISOString()+'-'+file.originalname)
    }
})
const fileFilter = (req,file, cb)=>{
    if(file.mimetype==='image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null,true)
    }
    else{
        cb(null, false)
    }
}

// Registra multer

app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))

// Usa parser
app.use(bodyParser.json())



// Serve imagens de modo estático
app.use('/images', express.static(path.join(__dirname, 'images')))

// Configurações CORS
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

// Usa rotas /feed 
app.use('/feed', feedRoutes)
// Usa rotas /feed 
app.use('/auth', authRoutes)

// Error handling
app.use((error, req, res, next)=>{
    console.log(error)
    const status = error.statusCode || 500
    const message = error.message
    const data = error.data
    res.status(status).json({message: message, data: data})
})

// Conecta ao banco de dados e inicia aplicação
const mongoUrl = 'mongodb+srv://'+process.env.MONGO_USER+':'+process.env.MONGO_PASSWORD+'@cluster0.e8ydb.mongodb.net/blog-rest-api?retryWrites=true&w=majority'
mongoose.connect(
    mongoUrl,
    { 
      useNewUrlParser: true,
      useUnifiedTopology: true 
    }
)
.then(result =>{
    console.log("Connected to database.")
    app.listen(8080)
})
.catch(err => console.log(err))
