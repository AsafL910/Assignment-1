const mongoose = require('mongoose');
try {
  console.log(process.env.DATABASE_URL);
  
    mongoose.connect(process.env.DATABASE_URL)
  } catch (error) {
    console.log(error);
  }
  
  const db = mongoose.connection
  db.on('error', error => {
    console.log(error)
    })
  db.once('open', () => {
    console.log("connected to mongo")
})
  
module.exports = db;