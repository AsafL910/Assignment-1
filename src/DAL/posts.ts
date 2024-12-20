import Post, {IPost} from "../db/postSchema";

const savePost = async (post: IPost) => {
  const newPost = new Post(post);
  try {
    return await newPost.save();
  } catch (err) {
    console.error("Post saving error: ", err);
  }
};

const getAllPosts = async () => {
  try {
    return await Post.find();
  } catch (err) {
    console.error("Posts retrieving failed: ", err);
  }
};

const getPostsById = async (id: string) => {
  try {
    return await Post.findById(id);
  } catch (err) {
    console.error("Posts retrieving failed: ", err);
  }
};

const getPostsBySenderId = async (senderId: string) => {
  try {
    return await Post.find({ senderId });
  } catch (err) {
    console.error("Posts retrieving failed: ", err);
  }
};

const updatePostById = async (id: string, message: string) => {
  return await Post.findByIdAndUpdate(
    id,
    { message },
    {
      new: true,
    }
  );
};

export {
  savePost,
  getAllPosts,
  getPostsById,
  getPostsBySenderId,
  updatePostById,
};
