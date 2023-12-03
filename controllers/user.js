const User = require("../models/user");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    if (!users) {
      const error = new Error("Could not find any users.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Fetched users successfully!",
      users: users,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("Could not find a user.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "User fetched",
      user: user,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = `Could not find user with id: ${userId}`;
    }
    next(err);
  }
};
