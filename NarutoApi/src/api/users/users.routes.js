const express = require("express");
const User = require("./users.model");
const router = express.Router();
const bcrypt = require("bcrypt");
const { generateSign } = require("../../utils/jwt/jwt");
const { isAuth } = require("../../utils/middleware/auth");

router.get("/", async (req, res) => {
  try {
    const allUsers = await User.find();
    return res.status(200).json(allUsers);
  } catch (error) {
    return res.status(500).json("Error al leer los usuarios");
  }
});

router.post("/create", async (req, res, next) => {
  try {
    const user = req.body;
    const newUser = new User(user);
    const createdUser = await newUser.save();
    return res.status(201).json(createdUser);
  } catch (error) {
    return next(error);
  }
});

router.delete("/delete/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    return res.status(201).json("User deleted");
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const userDB = await User.findOne({ email: req.body.email });
    if (!userDB) {
      return res.status(404).json("Is that you? Do we know each other?");
    }
    if (bcrypt.compareSync(req.body.password, userDB.password)) {
      let token = generateSign(userDB._id, userDB.email);
      return res.status(200).json({ token, userDB });
    } else {
      return res.status(200).json("Thats a invalid password mate");
    }
  } catch (error) {
    return res.status(500).json("Log in error");
  }
});

router.post("/logout", async (req, res) => {
  try {
    let token = null;
    return res.status(200).json(token);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/checksession", [isAuth], async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
