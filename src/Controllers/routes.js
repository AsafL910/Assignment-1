const express = require('express');
const db = require('../db')
const router = express.Router();

const newPost = router.post("/newpost",async (req, res) => {
    try {
        const post = req.body;
    
        const insertedPost = await db.insertPost(post);
        res.json({
          message: "Post created successfully!"
        });
    } catch (error) {
        console.log(erorr);
        
    }
})
module.exports = {newPost}