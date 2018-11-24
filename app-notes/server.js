const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use((req, res, next) => {
    // res.setHeader('Access-Control-Allow-Origin', '*')
    next()
})

app.use(express.static(__dirname))
app.listen(3000, () => {
    console.log('app note server is listening on 3000')
})

// app.get('/', (req, res) => {
//     return res.redirect(301, 'https://google.com')
// })

app.use((req, res, next) => {
    const bearerAuth = req.get('Authorization');
    if(!bearerAuth){
        return res.status(401).json({message: 'Authorization header not passed'})
    }
    const bearerAuthArr = bearerAuth.split(' ');
    if(bearerAuthArr.length !== 2){
        return res.status(401).json({message: 'Pass token in format: Basic token'})
    }
    if(bearerAuthArr[0] !== 'Bearer'){
        return res.status(401).json({message: 'Pass token in format: Basic token'})
    }
    const token = bearerAuthArr[1];
    try {
        const payload = jwt.verify(token, 'server-secret');
        req.customData = {
            userName: payload.userName,
            name: payload.name
        }
        console.log('payload', payload)
    } catch (error) {
        console.log('Token error: ', error);
        return res.status(401).json(error.message)
    }
    console.log(bearerAuth)
    next()
})

app.get('/me', (req, res) => {
    return res.redirect(301, 'http://myapplogin:3001/login/')
})