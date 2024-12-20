import Comment from "../db/commentSchema";

const saveComment = async (comment: string) => {
  const newComment = new Comment(comment);
  try {
    return await newComment.save();
  } catch (err) {
    console.error("Comment saving error: ", err);
  }
};

const getCommentById = async (id: string) => {
  try {
    return await Comment.findById(id);
  } catch (err) {
    console.error("Comments retrieving failed: ", err);
  }
};

const getAllComments = async () => {
  try {
    return await Comment.find();
  } catch (err) {
    console.error("Comments retrieving failed: ", err);
  }
};

const updateCommentById = async (id: string, content: string) => {
  return await Comment.findByIdAndUpdate(
    id,
    { content },
    { new: true }
  );
};

const deleteCommentById = async (id: string) => {
  try {
    return await Comment.findByIdAndDelete(id);
  } catch (err) {
    console.error("Comment deletion failed: ", err);
  }
};

const getCommentsByPostId = async (postId: string) => {
  try {
    return await Comment.find({ postId });
  } catch (err) {
    console.error("Error retrieving comments by postId: ", err);
  }
};

export {
  saveComment,
  getCommentById,
  getAllComments,
  updateCommentById,
  deleteCommentById,
  getCommentsByPostId,
};
