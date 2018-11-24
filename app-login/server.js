const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.urlencoded({extended: true}))
app.use(express.json());
app.use((req, res, next) => {
    // res.setHeader('Access-Control-Allow-Origin', '*')
    const logMsg = {
        url: req.originalUrl,
        Referer: req.get('Referer')
    }
    console.log(logMsg)
    next()
})

const users = [
    {
        name: 'Vikash Kumar',
        userName: 'vikash',
        password: '1234'
    },
    {
        name: 'Rajeev Kumar Singh',
        userName: 'rajeev',
        password: '1234'
    }
]

app.use(express.static(__dirname))

app.post('/api/login', (req, res) => {
    const reqUserName = req.body.userName;
    const reqPassword = req.body.password;

    const actualUser = users.find((x) => x.userName === reqUserName);
    if (!actualUser) {
        return res.status(400).json({message: 'wrong username'});
    }
    if (actualUser.password !== reqPassword) {
        return res.status(400).json({message: 'wrong password'});
    }
    const token = jwt.sign({
        userName: actualUser.userName,
        name: actualUser.name
    }, 'server-secret');
    return res.status(200).json({
        token: token,
        message: 'Login successfull'
    });
})

app.post('/api/register', (req, res) => {
    const reqUserName = req.body.userName;
    const password = req.body.password;
    const name = req.body.name;

    if(!reqUserName || !password || !name){
        return res.status(400).json({message: 'please provide username, password and name'});
    }

    const actualUser = users.find((x) => x.userName === reqUserName);
    if(actualUser){
        return res.status(400).json({message: 'Username already registered'});
    }

    users.push({
        userName: reqUserName,
        password,
        name
    })
    return res.status(201).json({message: 'Successfully Registered'})

})

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
app.get('/api/me', (req, res) => {
    res.status(200).send({
        data: {
            name: req.customData.name,
            userName: req.customData.userName
        }
    })
})

app.listen(3001, () => {
    console.log('login app is listening on port: 30001');
})