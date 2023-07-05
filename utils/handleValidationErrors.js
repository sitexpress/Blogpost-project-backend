import {validationResult} from "express-validator";

export default (req,res,next) => {
    // Проверяем на  наличие ошибок в полях на бэке
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array())
    }
    next()
}