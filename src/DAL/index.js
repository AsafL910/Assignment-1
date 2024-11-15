const Post = require("../db/schemas");

const savePost = (post) => {
  const newPost = new Post(post);
  try {
        return newPost.save();
    } catch (err) {
        console.error("Post saving error: ", err);
    }
};

const getAllPosts = () => {
  try {
        return Post.find();
    } catch (err) {
        console.error("Posts retriving failed: ", err);
    }
};

module.exports = { savePost, getAllPosts };
