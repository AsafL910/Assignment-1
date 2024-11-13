const express = require('express');
const router = express.Router();
const dbActions = require("../DAL")

const newPostRoute = router.post("/newpost",async (req, res) => {
    try {
        const body = req.body
        
        if(!body.message || !body.sender)
            res.status(400).json("required body not provided")
        if(typeof body.message !== "string" || typeof body.sender !== "string" )
            res.status(400).json("wrong type in one of the body parameters")       
        
        dbActions.savePost(body)
        res.status(200).json("post saved successfuly")
    } catch (error) {
        console.log(error);
        
    }
})

module.exports = {newPostRoute}