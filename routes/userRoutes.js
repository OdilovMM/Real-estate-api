const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.get("/:id", userController.getUser);
router.patch("/updateMe", userController.updateMe);
router.get("/", userController.getAllUsers);
router.get("/get-profile-posts/:userId", userController.profilePosts);
router.patch("/deleteMe", userController.deleteMe);
router.post("/savePost", userController.savePost);
router.get("/getSavedPosts/:userId", userController.getSavedPosts);

module.exports = router;
