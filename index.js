import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

try {
  mongoose.connect(process.env.DATABASE_URL)
  
} catch (error) {
  console.log(error);
  
}
export const db = mongoose.connection
db.on('error', error => {console.log(error)})
db.once('open', () => {console.log("connected to mongo")})
