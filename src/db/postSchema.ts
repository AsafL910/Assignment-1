import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
  message: string;
  senderId: mongoose.Schema.Types.ObjectId;
}

const postSchema: Schema<IPost> = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Post = mongoose.model<IPost>("Post", postSchema);

export default Post;
