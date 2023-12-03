const express = require("express");

const router = express.Router();
const authentication = require("../middleware/is-auth");

const userController = require("../controllers/user");

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Get all users
 *     description: Fetches all users.
 *     tags: 
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully.
 *       404:
 *         description: Could not find a user.
 *       500:
 *         description: Internal server error.
 */
router.get("/all", authentication.isAuthProtected, userController.getUsers);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     description: Fetches a specific user by their ID.
 *     tags: 
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to fetch
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully.
 *       404:
 *         description: Could not find a user.
 *       500:
 *         description: Internal server error.
 */
router.get("/:userId", authentication.isAuthProtected, userController.getUser);

module.exports = router;
