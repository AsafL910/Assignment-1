const express = require('express');
const db = require('../db')
const router = express.Router();

const newPost = router.post("/newpost",(req, res) => {
    try {
        const post = req.body;
    
        const insertedPost = await db.insertPost(post);
        res.json({
          message: "Post created successfully!",
          data: insertedPost, // Optionally include the inserted post data in the response
        });
    }})
module.exports = {newPost}