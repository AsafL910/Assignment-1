require('dotenv').config();
const app = require('./app.js');
const mongoose = require('mongoose');


const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

try {
  mongoose.connect(process.env.DATABASE_URL)
  
} catch (error) {
  console.log(error);
  
}
const db = mongoose.connection
db.on('error', error => {console.log(error)})
db.once('open', () => {console.log("connected to mongo")})

module.exports = db;