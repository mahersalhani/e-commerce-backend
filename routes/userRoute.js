const express = require("express");

const userController = require("../controllers/userController");

const authController = require("../controllers/authController");

const {
  //   //
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  changeLoggedUserPasswordValidator,
  updateLoddedUserValidator,
} = require("../utils/validators/userValidator");

const router = express.Router();

router.use(authController.protect);

router.get("/getMe", userController.getLoggedUserData, userController.getUser);

router.put("/changeMyPassword", changeLoggedUserPasswordValidator, userController.updateLoggedUserPassword);

router.put("/updateMe", updateLoddedUserValidator, userController.updateLoggedUserData);

router.put("/daleteMe", userController.deleteLoggedUserData);

router
  //
  .route("/")
  .post(
    //

    authController.allowedTo("admin"),
    userController.uploadUserImage,
    createUserValidator,
    userController.resize,
    userController.creatUser
  )
  .get(userController.getUsers);

router.put(
  //
  "/changepassword/:id",

  authController.allowedTo("admin", "manger"),
  changeUserPasswordValidator,
  userController.changeUserPassword
);

router
  //
  .route("/:id")
  .get(
    //

    authController.allowedTo("admin"),
    getUserValidator,
    userController.getUser
  )
  .put(
    //

    authController.allowedTo("admin"),
    userController.uploadUserImage,
    updateUserValidator,
    userController.resize,
    userController.updateUser
  )
  .delete(
    //

    authController.allowedTo("admin"),
    userController.deleteImage,
    deleteUserValidator,
    userController.deleteUser
  );

module.exports = router;
