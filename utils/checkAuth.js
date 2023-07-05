import jwt from 'jsonwebtoken'

export default (req,res,next) => {
    // Объясняем что нужно спарсить токен и далее его расшифровать
    // Вытаскиваем токен и проверяем есть ли он или нет:
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '')

    if (token) {
        try {  // расшифровываем токен в том случае если он есть
            const decoded = jwt.verify(token,'secret123')
            // зашиваем в req - decoded._id
            req.userId = decoded._id

            next()
        } catch(e) {
            return res.status(403).json({
                message: 'Нет доступа'
            })
        }
    } else {
        return res.status(403).json({
            message: 'Нет доступа'
        })
    }
}