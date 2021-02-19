const argon2 = require('argon2')
const sql =  require("./sqlwork")
const jwt = require('jsonwebtoken')
const jwt_decode  = require("jwt-decode")

exports.hashPassword = async (password) => {
    return await argon2.hash(password);
}

exports.validatePassword =  (password , connection , name) => {
    return new Promise((resolve , reject) => {
        sql.checkPassword(connection, name).then((res) => {
            argon2.verify(res, password).then((result) => {
                if (result) {
                    resolve(result)
                }
            })
        })
    })

}

exports.generateToken = (data) => {
    let signature = 'Noy4Gh67Fsd'
    return jwt.sign({data} , signature , {expiresIn : '6h'})
}

exports.decodeToken = (token) => {
    return jwt.decode(token)
}