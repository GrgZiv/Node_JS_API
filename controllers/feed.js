const { validationResult } = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 4;
  let posts;
  let totalItems;

  try {
    const user = await User.findById(req.userId);
    if (!req.userId || user.role === "USER") {
      posts = await Post.find({ allowed: true }) // Only fetch posts with "allowed" flag set to true
        .skip((currentPage - 1) * perPage)
        .limit(perPage);

      totalItems = await Post.countDocuments({ allowed: true });
    } else if (user.role === "BLOGGER") {
      posts = await Post.find({ author: req.userId }) // Fetch posts created by the user
        .skip((currentPage - 1) * perPage)
        .limit(perPage);

      totalItems = await Post.countDocuments({ author: req.userId });
    } else if (user.role === "ADMIN") {
      posts = await Post.find() // Fetch all posts
        .skip((currentPage - 1) * perPage)
        .limit(perPage);

      totalItems = await Post.countDocuments();
    }

    if (!posts || posts.length === 0) {
      const error = new Error("Could not find any posts.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Fetched posts successfully!",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPostRequests = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 4;

  try {
    const user = await User.findById(req.userId);
    if (!(user.role === "ADMIN")) {
      const error = new Error("Not authorized.");
      error.statusCode = 401;
      throw error;
    }

    const posts = await Post.find({ allowed: false }) // Fetch all posts
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    const totalItems = await Post.countDocuments({ allowed: false });

    if (!posts || posts.length === 0) {
      const error = new Error("Could not find any posts.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Fetched posts successfully!",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.allowPostRequest = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    const user = await User.findById(req.userId);

    if (!(user.role === "ADMIN")) {
      const error = new Error("Not authorized.");
      error.statusCode = 401;
      throw error;
    }

    post.allowed = true;
    await post.save();

    const postAuthor = await User.findById(post.author); // Access the user who created the post

    if (!(postAuthor.role === "ADMIN")) {
      postAuthor.role = "BLOGGER"; // Update the author's role to "BLOGGER"
      await postAuthor.save();
    }

    res.status(200).json({
      message: "Post request allowed successfully!",
      post: post,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "Post fetched",
      post: post,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = `Could not find post with id: ${postId}`;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title: title,
    content: content,
    author: req.userId,
  });

  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    res.status(201).json({
      message: "Post created successfully!",
      post: post,
      author: {
        _id: user._id,
        name: user.firstName + " " + user.lastName,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could not find post for update.");
      error.statusCode = 404;
      throw error;
    }

    if (post.author.toString() !== req.userId) {
      const error = new Error("Not authenticated.");
      error.statusCode = 403;
      throw error;
    }

    post.title = title;
    post.content = content;
    post.allowed = true;

    const result = await post.save();
    res.status(200).json({ message: "Post updated!", post: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could not find post to delete.");
      error.statusCode = 404;
      throw error;
    }

    if (post.author.toString() !== req.userId) {
      const error = new Error("Not authenticated.");
      error.statusCode = 403;
      throw error;
    }

    await Post.findByIdAndRemove(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();

    res.status(200).json({ message: "Post deleted!", post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
