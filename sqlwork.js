const mysql = require("mysql2")
const safe = require('./safety')
exports.connect = function() {
    const connection = mysql.createConnection({
        host:"eu-cdbr-west-03.cleardb.net",
        user:"b3d8dcdd8634e4",
        database: "heroku_c8268f11c019a7f",
        password:"cb9d9a29"
    });
    connection.connect(function(err){
        if (err) {
            return console.error("Ошибка: " + err.message);
        }
        else{
            console.log("Подключение к серверу MySQL успешно установлено");
        }
    });
    return connection;
}

exports.checkPassword =  function(connection, name) {
    return new Promise((resolve , reject) => {
        connection.query('SELECT password FROM user WHERE user = ?' ,[name],
            (err ,results) => {
                    if(err)
                    {
                        reject(err)
                    }
                    else{
                        resolve(results[0].password)
                    }
        })
    })
}

exports.checkUser =  function(connection, name) {
    return new Promise((resolve , reject) => {
        connection.query('SELECT user FROM user' ,
            (err ,results) => {
                if(err)
                {
                    reject(err)
                }
                else{
                    resolve(results)
                }
            })
    })
}

exports.addUser =  async (name , password , email, connection , date) => {
    let hashedPassword =  await safe.hashPassword(password)
    return new Promise((resolve , reject) => {
        connection.query('INSERT INTO user(user, password, email , reg_date , status) VALUES (?, ?, ?, ?, ?)' , [name , hashedPassword , email ,date , "unblocked"],
            (err , result) => {
            if(err) {
                reject(err)
            }
            else{
                    resolve(result)
                }
            })
    })

}

exports.getDate = () => {
    let date = new Date()
    let day = date.getDate()
    let month = date.getMonth()
    let year = date.getFullYear()
    let wholeDate = day + "." + month + "." + year
    return wholeDate
}

exports.updateAuthDate  = (connection ,date , jwt) => {
    return new Promise((resolve , reject) => {
        connection.query('UPDATE user SET auth_date = ? WHERE user = ?' , [date , jwt.data.name],
            (err , result) => {
                if(err) {
                    reject(err)
                }
                else{
                    resolve(result)
                }
            })
    })
}

exports.updateStatus  = (connection ,id , status) => {
    return new Promise((resolve , reject) => {
        console.log(status)
        console.log(id)
        connection.query('UPDATE user SET status = ? WHERE id = ?' , [status , id],
            (err , result) => {
                if(err) {
                    reject(err)
                }
                else{
                    resolve(result)
                }
            })
    })
}

exports.getUserData  = (connection) => {
    return new Promise((resolve , reject) => {
        connection.query('SELECT * FROM user' ,
            (err, result) => {
                    resolve(result)
            })
    })
}

exports.getUserId  = (connection , name) => {
    return new Promise((resolve , reject) => {
        connection.query('SELECT id FROM user WHERE user = ?' , [name],
            (err, result) => {
            if(err) {
                reject(err)
            }
            else{
                resolve(result[0])
            }
            })
    })
}

exports.checkStatus = (connection , name) => {
    return new Promise((resolve , reject) => {
        connection.query('SELECT status FROM user WHERE user = ?' , [name] , (err , result) => resolve(result[0].status))
    })
}

exports.deleteUser  = (id , connection) => {
    return new Promise((resolve , reject) => {
        connection.query('DELETE FROM user WHERE id = ?' , [id] , (err , result) => {
            if(err) {
                reject(err)
            }
            else
            {
                resolve(result)
        }})
    })
}

