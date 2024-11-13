const Post = require('../db/schemas')

const savePost = (post) => {
    const newPost = new Post(post);
    newPost.save()
    .then(doc => {
        console.log('Post saved successfully:', doc);
    })
    .catch(err => {
        console.error('Post saving user:', err);
    });
}


module.exports = {savePost}