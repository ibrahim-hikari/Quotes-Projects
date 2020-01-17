`use strict`;

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg')
const methodOverride = require('method-override')
const expressLayouts = require('express-ejs-layouts')


const client = new pg.Client(process.env.DATABASE_URL);
const app = express();
const PORT = process.env.PORT || 9797;

app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
// app.use(expressLayouts);
app.set('view engine', 'ejs');

// Middleware to handle PUT and DELETE
// app.use(methodOverride(middleware))


app.get('/test', life)
app.get('/', renderUserForm)
app.get('/searches', getData)
app.get('/new', renderUserForm)
app.post('/newUser', userChecker)
app.post('/searches', getArticle)
app.post('/add', saveThisArticle)

// app.get('/data', gif)

function life(req, res) {
    res.status(200).send('Hello Everyone')
}

function getData(req, res) {
    console.log(req.body)
    let url = `https://api.paperquotes.com/apiv1/quotes/?${req.body.search}=${req.body.keyword}`
    superagent.get(url)
        .set('Authorization', `Token ${process.env.QUOTES_API}`)
        .then(data => {
            // res.json(data.body)
            res.render('pages/show', { quotes: data.body.results, user: req.body.userName })
        })
}


function getArticle(req, res) {
    let url = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${req.body.keyword}&api-key=${process.env.NYT_API}`

    return superagent.get(url)
        .then(data => {
            let result = data.body.response.docs.map(singleArticle => {

                return new Article(singleArticle)
            })
            res.render('pages/show', { articles: result, user: req.body.userName })
        })
}
function Article(data) {
    this.abstract = data.abstract;
    this.title = data.headline.main;
    this.url = data.web_url;
    this.publish = data.pub_date;
}
function saveThisArticle(req, res) {
    console.log('insert console', req.body);
    let userName = req.body.userName
    let { abstract, title, url, publish } = req.body

    let SQL = `INSERT INTO ${userName} (abstract, title, url, publish) VALUES ($1, $2, $3, $4)`
    let values = [abstract, title, url, publish]

    client.query(SQL, values)
        .then(() => {
            res.redirect('/new')
        })
}




// function gif(req, res) {
//     let url = `https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_API}&q=ghibli`

//     superagent.get(url)
//         .then(data => {
//             // res.json(data.body)
//             res.render('pages/images', { pic: data.body })
//         })
// }




function renderUserForm(req, res) {

    res.render('pages/index')
}

function userChecker(req, res) {
    let userName = (req.body.userName.toLowerCase()).replace(/\s/g, '_');
    let SQL = `SELECT * FROM userName`
    let seen = {};
    client.query(SQL)
        .then(results => {
            results.rows.forEach(element => {
                seen[element.names] = true;
            });
            if (!seen[userName]) {
                let SQL = `INSERT INTO userName (names) VALUES ($1);`
                let values = [userName]
                client.query(SQL, values)
                    .then(() => {
                        console.log('Insert works');
                        newUser(userName, res)
                    })
            } else if (seen[userName]) {
                render(userName, res)
            }
        })
}
function newUser(req, res) {
    let SQL = `CREATE TABLE ${req} (id SERIAL PRIMARY KEY,abstract TEXT, title VARCHAR(255), url TEXT, publish VARCHAR(255))`
    client.query(SQL)
        .then(() => {
            console.log('works the newUser');
            res.render('searches/new', { user: req })
        })
}

function render(req, res) {
    let SQL = `SELECT * FROM ${req} `
    client.query(SQL)
        .then(data => {
            res.render('searches/new', { articles: data.rows, user: req })
        })

}

client.connect()
    .then(
        app.listen(PORT, () => { console.log(`hello from ${PORT}`) })
    )