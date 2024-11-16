const { Comment } = require("../db/schemas");

const saveComment = (comment) => {
  const newComment = new Comment(comment);
  try {
    return newComment.save();
  } catch (err) {
    console.error("Comment saving error: ", err);
  }
};

const getCommentById = (id) => {
  try {
    return Comment.findById(id);
  } catch (err) {
    console.error("Comments retrieving failed: ", err);
  }
};

const getAllComments = () => {
  try {
    return Comment.find();
  } catch (err) {
    console.error("Comments retriving failed: ", err);
  }
};

const updateCommentById = (id, content) => {
  return Comment.findByIdAndUpdate(
    id,
    { content },
    {
      new: true,
    },
  );
};

const deleteCommentById = (id) => {
  try {
    return Comment.findByIdAndDelete(id);
  } catch (err) {
    console.error("Comment deletion failed: ", err);
  }
};

module.exports = {
  saveComment,
  getCommentById,
  getAllComments,
  updateCommentById,
  deleteCommentById,
};
