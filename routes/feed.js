const express = require("express");
const { body } = require("express-validator");

const feedController = require("../controllers/feed");
const authentication = require("../middleware/is-auth");

const router = express.Router();

/**
 * @swagger
 * /feed/posts:
 *   get:
 *     summary: Retrieve posts
 *     description: |
 *       Retrieve a list of posts based on user access and role.
 *       - Unauthenticated users can view public posts (where the `allowed` flag is true).
 *       - Authenticated bloggers can view their own posts.
 *       - Authenticated admins can view all posts.
 *     tags:
 *       - Feed
 *     responses:
 *       '200':
 *         description: Successful operation
 *       '404':
 *         description: No posts found
 *       '500':
 *         description: Internal server error
 */
router.get("/posts", authentication.isAuth, feedController.getPosts);


/**
 * @swagger
 * /feed/post-requests:
 *   get:
 *     summary: Get post requests
 *     description: Fetches all post requests with "allowed" field set to false.
 *     tags:
 *       - Feed
 *     responses:
 *       200:
 *         description: Successful operation
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/post-requests",
  authentication.isAuthProtected,
  feedController.getPostRequests
);

/** 
 *  @swagger
 * /feed/post-request/{postId}:
 *   post:
 *     summary: Allow post request
 *     description: Allows an admin to approve a post request by setting "allowed" field to true.
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: ID of the post request to approve
 *         required: true
 *         schema:
 *           type: string
 *     tags:
 *       - Feed
 *     responses:
 *       200:
 *         description: Successful operation
 *       401:
 *         description: Unauthorized request
 *       404: 
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/post-request/:postId",
  authentication.isAuthProtected,
  feedController.allowPostRequest
);

/**
 * @swagger
 * /feed/post:
 *   post:
 *     summary: Create a new post
 *     description: Create a new post with the provided title and content. Only an authenticated user can create a post.
 *     tags:
 *       - Feed
 *     requestBody:
 *       required: true
 *     responses:
 *       '201':
 *         description: Post created successfully
 *       '401':
 *         description: Not authenticated
 *       '422':
 *         description: Validation failed
 *       '500':
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  authentication.isAuthProtected,
  feedController.createPost
);

/**
 * @swagger
 * /feed/post/{postId}:
 *   get:
 *     summary: Get a post by ID
 *     description: Fetches a post by its ID.
 *     tags:
 *       - Feed
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: ID of the post to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '201':
 *         description: Post created successfully
 *       '401':
 *         description: Not authenticated
 *       '500':
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/post/:postId",
  authentication.isAuthProtected,
  feedController.getPost
);

/**
 * @swagger
 * /feed/post/{postId}:
 *   put:
 *     summary: Update a post by ID
 *     description: Updates a post by its ID.
 *     tags:
 *       - Feed
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: ID of the post to update
 *         required: true
 *       - in: body
 *         name: updatedPost
 *         description: Updated post object
 *         required: true
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Successful operation
 *       '401':
 *         description: Not authenticated
 *       '422':
 *         description: Validation failed
 *       '500':
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/post/:postId",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  authentication.isAuthProtected,
  feedController.updatePost
);

/**
 * @swagger
 * /feed/post/{postId}:
 *   delete:
 *     summary: Delete a post by ID
 *     description: Deletes a post by its ID.
 *     tags:
 *       - Feed
 *     parameters:
 *       - in: path
 *         name: postId
 *         description: ID of the post to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *       '401':
 *         description: Not authenticated
 *       '404':
 *         description: Resource not found
 *       '500':
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/post/:postId",
  authentication.isAuthProtected,
  feedController.deletePost
);

module.exports = router;
