const express = require("express");
const router = express.Router();
const {
  createToken,
  postStk,
  userResponse,
  userCallback,
} = require("../controller/token");

router.post("/", createToken, postStk);
router.post("/call_back", userCallback);
router.post("/userResponse", createToken, userResponse);
module.exports = router;
