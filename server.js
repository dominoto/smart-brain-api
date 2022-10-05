const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const app = express();
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        port: 5432,
        user: 'domagoj',
        password: 'domagoj',
        database: 'smart-brain'
    }
});

db.select('*').from('users').then(data => {
    console.log(data);
});

app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
    res.send('success');
})

app.post('/signin', (req, res) => {
    // bcrypt.compare("apples", '$2a$10$0wRsWDTXb.Kp9hRU/tTSc.mK8UNlmTTpP23DKI7XyMzHux64O9Q0.', function (err, res) {
    //     console.log('1st guess ', res);
    // });
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            if (isValid) {
                return db.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user => {
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json('unable to get user'))
            } else {
                res.status(400).json('wrong credentials')
            }
        })
        .catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    // bcrypt.hash(password, null, null, function (err, hash) {
    //     console.log(hash);
    // });
    // console.log(req.body);
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0].email,
                        name: name,
                        joined: new Date()
                    }).then(user => {
                        res.json(user[0]);
                    })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
        .catch(err => res.status(400).json('unable to register'))
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    let found = false;
    db.select('*').from('users').where({ id })
        .then(user => {
            if (user.length) {
                res.json(user[0])
            } else {
                res.status(400).json('not found');
            }
        })
        .catch(err => res.status(400).json('error getting user'))
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0].entries);
        })
        .catch(err => res.status(400).json('unable to get entries'))
})

// app.post('/image', (req, res) => {
//     const { id } = req.params;
//     let found = false;
//     database.users.forEach(user => {
//         if (user.id === id) {
//             found = true;
//             user.entries++;
//             return res.json(user.entries);
//         }
//     })
//     if (!found) {
//         res.status(400).json('not found');
//     }
// })

// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

app.listen(3000, () => {
    console.log('app is running on port 3000');
})