const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const app = express();
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true
    }
});

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => { res.send('it is working') })
app.post('/signin', signin.handleSignin(db, bcrypt)) //one way of passing arguments
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })//another way of passing arguments
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db) })
app.put('/image', (req, res) => { image.handleImage(req, res, db) })
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) })

app.listen(process.env.PORT || 3000, () => {
    console.log('app is running on port ${process.env.PORT}');
})