const { Post } = require("../db/schemas");

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

const getPostsById = (id) => {
  try {
    return Post.findById(id);
  } catch (err) {
    console.error("Posts retriving failed: ", err);
  }
};

const getPostsBySenderId = (senderId) => {
  try {
    return Post.find({ senderId });
  } catch (err) {
    console.error("Posts retriving failed: ", err);
  }
};

const updatePostById = (id, message) => {
  return Post.findByIdAndUpdate(
    id,
    { message },
    {
      new: true,
    },
  );
};

module.exports = {
  savePost,
  getAllPosts,
  getPostsById,
  getPostsBySenderId,
  updatePostById,
};
