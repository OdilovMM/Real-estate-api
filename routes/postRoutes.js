const express = require("express");
const postController = require("./../controllers/postController");
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");

const router = express.Router();

router.get("/", postController.getPosts);
router.get("/:postId", postController.getPost);
router.delete("/:postId", postController.deletePost);
router.patch("/updatePost/:postId", postController.updatePost);
router.post("/", postController.addPost);

module.exports = router;
