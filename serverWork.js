const sql =  require("./sqlwork")
const cors = require('cors');
const safe = require('./safety')
const bodyParser = require('body-parser')
const express = require('express')
const {getDate} = require("./sqlwork");
const {decodeToken} = require("./safety");
    const app = express()
    const port = 3005
    const connection = sql.connect()
    app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", 'task4-frontend.herokuapp.com');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,Auth,Block,Delete');
    res.header('Access-Control-Expose-Headers' , 'Access-Control-Allow-Origin,Access-Control-Allow-Headers')
    next();
});
    // app.use(cors())

    app.post('/auth' , (req , res) => {
        sql.checkUser(connection , req.body.name).then((result) => {
            result.map((name) => {
                if(name.user === req.body.name) {
                    console.log(name.user)
                    safe.validatePassword(req.body.password, connection, req.body.name).then((a) => {
                        console.log(a)
                        if (a) {
                            sql.checkStatus(connection , req.body.name).then(async (result) => {
                                if(result === "unblocked") {
                                    let hashedPassword =  await safe.hashPassword(req.body.password)
                                    let dataForJwt = {name :req.body.name , password: hashedPassword , email:req.body.email}
                                    let jwtRes = safe.generateToken(dataForJwt)
                                    res.send(jwtRes)
                                }
                                else{
                                    res.send("blocked")
                                }
                            })
                        } else {
                            res.send("invalid");
                        }
                    })
                }
            })
        })
    })
    app.post('/reg',(req, res) => {
                let date = sql.getDate()
                sql.addUser(req.body.name , req.body.password , req.body.email , connection , date).then((result) =>
                    res.send(result))
    })

    app.get('/updateAuthDate' , (req , res) => {
        if(req.header('Auth')) {
            let decoded = decodeToken(req.header('Auth'))
            sql.updateAuthDate(connection , getDate() , decoded).then((result) => {})
            res.send("Success")
        }
        else {
            res.send("not authorized")
        }
    })

    app.get('/loadTable' , (req , res) => {
        let ar = []
        if(req.header('Auth')!=="") {
            sql.getUserData(connection).then((result) => {
                result.forEach((a)=> ar.push(a))
                res.send(ar)})

        }
        else {
            res.send("not authorized")
        }
    })

    app.get('/getCurrentId' , (req , res) => {
        if(req.header('Auth')!=="") {
            let decoded = decodeToken(req.header('Auth'))
            console.log(decoded.data)
            sql.getUserId(connection , decoded.data.name).then((id) => {res.send(id)})
        }
        else {
            res.send("not authorized")
        }
    })

    app.get('/blockUser' , (req , res) => {
        if(req.header('Auth')) {
            sql.updateStatus(connection , req.header('Id') ,  req.header('Block')).then(() => {})
            res.send("Success")
        }
        else {
            res.send("not authorized")
        }
    })

    app.get('/deleteUser' , (req , res) => {
        if(req.header('Auth')!=="") {
            sql.deleteUser(req.header('Id') ,connection).then(()=>{res.send("Success")})

        }
        else {
            res.send("not authorized")
        }
    })
    app.get('/' , (req , res) => {
        if(req.header('Auth')!=="") {
            res.send("Welcome")
        }
        else {
            res.send("not authorized")
        }
    })

    app.listen(process.env.PORT || port, () => {
        console.log('Server running')
    })


