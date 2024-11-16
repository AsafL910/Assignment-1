const {Comment} = require("../db/schemas");

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

module.exports = { saveComment, getCommentById };