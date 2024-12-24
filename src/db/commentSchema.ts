import mongoose, { Document, Schema } from "mongoose";

export interface IComment extends Document {
  content: string;
  senderId: mongoose.Schema.Types.ObjectId;
  postId: mongoose.Schema.Types.ObjectId;
}

const commentSchema: Schema<IComment> = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
});

const Comment = mongoose.model<IComment>("Comment", commentSchema);

export default Comment;
