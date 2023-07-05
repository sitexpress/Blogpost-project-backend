import express from 'express'
import multer from 'multer'
import mongoose from 'mongoose'
import {loginValidation, postCreateValidation, registerValidation} from './validations/validations.js'
import {UserController, PostController} from './controllers/index.js'
import {handleValidationErrors, checkAuth} from "./utils/index.js";
import cors from "cors";
import {mongoDbEnv} from "./env/env.js";


mongoose
    .connect(mongoDbEnv ? process.env.MONGODB_URI || mongoDbEnv : process.env.MONGODB_URI)
    .then(() => console.log('DB ok'))
    .catch((err) => console.log('DB error', err))

const app = express()

// Создаём хранилище где мы будем сохранять все наши картинки
// Т.е. при создании хранилища нужно выполнить функцию destination
// эта фун-я должна сказать что не получает никаких ошибок и должна сохранить
// эти фаилы в папку uploads
// filename - обясняем что хотим из фаила вытащить оригинальное название
// Соответственно:
// destination - будет описывать путь загруженного фаила
// filename - будет описывать название загруженного фаила
const storage = multer.diskStorage({
    destination: (_,__,cb) => {
        cb(null, 'uploads')
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname)
    }
})

// Применяем логику multera на express:
const upload = multer({storage})


// Делаем регистрацию

app.use(express.json())
app.use(cors())
// Объясняем express что есть специальная папка uploads где хранятся статичные фаилы
app.use('/uploads', express.static('uploads'))


// User
app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login)
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register)
app.get('/auth/me', checkAuth, UserController.getMe)

// upload.single('image') - middleWare из библиотеки multer, из-за
// этого мы можем стучаться req.file.originalname
// Images
app.post('/uploads',checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`
    })
})


app.get('/tags', PostController.getLastTags)
// Posts
app.get('/posts', PostController.getAll)
app.get('/posts/tags', PostController.getLastTags)
app.get('/posts/:id', PostController.getOne)
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create)
app.delete('/posts/:id', checkAuth, PostController.remove)
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update)
app.listen(process.env.PORT || 4444, (err) => {
    if (err) {
        return console.log(err)
    }
    console.log('oK')
})