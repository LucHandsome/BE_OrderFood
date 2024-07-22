const jwt = require('jsonwebtoken')
const gennneralAccessToken = (payload) =>{
    const accessToken = jwt.sign({
        payload
    },'accessToken',{expiresIn:'1h'})

    return accessToken
}

const gennneralRefreshToken = (payload) =>{
    const refreshToken = jwt.sign({
        payload
    },'refreshToken',{expiresIn:'365d'})

    return refreshToken
}
module.exports = {
    gennneralAccessToken,
    gennneralRefreshToken
}