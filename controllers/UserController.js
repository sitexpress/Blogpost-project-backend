import {validationResult} from "express-validator";
import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        // Проверяем на  наличие ошибок в полях на бэке код в handleValidationErrors

        // Шифруем пароль
        const password = req.body.password
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)


        // Создаем документ в базе данных
        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash
        })
        const user = await doc.save()

        // Создаём токен для проверки на авторизацию
        const token = jwt.sign(
            {
                _id: user._id
            },
            'secret123',
            {
                expiresIn: '30d'
            }
        )

        //  Возвращаем документ
        const {passwordHash, ...userData} = user._doc

        res.json({
            ...userData,
            token,
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось зарегестрироваться'
        })
    }
}
export const login = async (req, res) => {
    try {
        // Для того чтобы сделать авторизацию нам нужно найти пользовщателя в БД по email
        const user = await UserModel.findOne({email: req.body.email}) // если почта есть то ниже условие findOne - это метод из mongoDB

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден'
            })
        }
        // Если пользователь нашелся, то проверяем совпадает ли пароль соответственно по password
        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash)

        if(!isValidPass) {
            return res.status(400).json({
                message: 'Неверный логин или пароль'
            })
        }

        // Если email и password совпали то мы создаем новый токен
        const token = jwt.sign(
            {
                _id: user._id
            },
            'secret123',
            {
                expiresIn: '30d'
            }
        )

        //  Возвращаем документ
        const {passwordHash, ...userData} = user._doc

        res.json({
            ...userData,
            token,
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось авторизоваться'
        })
    }
}
export const getMe = async (req, res) => {
    try {
        // Объясняем что нам необходимо получить инфо о себе по токену соответственно
        // токен нужно расшифровать и понять имеет ли доступ user к себе
        // Для всего этого создаём специальную функцию middleWare в папке utils
        const user = await UserModel.findById(req.userId)

        if(!user) {
            return res.status(404).json({
                message: 'Пользователь не найден.'
            })
        }

        //  Возвращаем документ
        const {passwordHash, ...userData} = user._doc

        res.json(userData)

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Нет доступа'
        })
    }
}