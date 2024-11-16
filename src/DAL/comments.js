const {Comment} = require("../db/schemas");

const saveComment = (comment) => {
    const newComment = new Comment(comment);
    try {
      return newComment.save();
    } catch (err) {
      console.error("Comment saving error: ", err);
    }
  };

module.exports = { saveComment };