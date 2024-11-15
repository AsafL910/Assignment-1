const express = require('express')
const app = express()
const db = require('./db/DbConnection')
const {newPostRoute} = require('./Controllers/routes')

app.use(express.json());
app.post('/newPost',newPostRoute)
module.exports = app;