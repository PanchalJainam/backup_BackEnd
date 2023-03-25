const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const Register = require("../models/regSchema");
const Fraud = require("../models/fraudSchema");
const Requests = require("../models/reqSchema");
const { sendmail } = require("../utils/sendmail");

// router.get("/", (req, res) => {
//   res.send("auth.js home page");
// });

router.post("/login", async (req, res) => {
  try {
    let token;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please Filled the data" });
    }

    const userLogin = await Register.findOne({ email: email });

    console.log(userLogin);
    if (userLogin) {
      // res.status(413).json({ error: "Email Already Exists" });
      // alert("User Not Found");
      const pwd = await bcrypt.compare(password, userLogin.password);

      // console.log("Pwd is : " + pwd);

      if (!pwd) {
        res.status(429).json({ error: "Password Error" });
      } else {
        token = await userLogin.generateAuthToken();
        console.log("token is : " + token);

        res.cookie("jwt", token, {
          expires: new Date(Date.now() + 2546500045400),
          httpOnly: true,
        });
        res.status(201).json({ meassage: "Done Successfully" });
      }
    } else {
      res.status(413).json({ error: "User Not Registered" });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/signin", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send({ message: "Fill the data" });
  }

  try {
    const data = await User.findOne({ email });
    !data && res.status(422).send({ message: "Invalid Details" });
    const isLogin = await bcryptjs.compare(password, data.password);
    if (isLogin) {
      const token = await data.createToken();
      console.log(token);
      res.cookie("jwtdata", token, {
        expires: new Date(Date.now() + 60 * 60 * 2 * 1000),
        httpOnly: true,
      });
      res.status(200).json({ message: "Signin successfully" });
    } else {
      res.status(422).send({ message: "Invalid Details" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

const uploadPath = path.join(__dirname, "../upload");

const storage = multer.diskStorage({
  destination: function (req, file, next) {
    next(null, uploadPath);
  },
  filename: function (req, file, next) {
    next(null, uuidv4() + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

function randomNumberForOtp(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

router.post("/registration", upload.single("document"), async (req, res) => {
  const {
    ngo_name,
    email,
    head_name,
    address,
    activity,
    password,
    contact_number,
  } = req.body;

  const { filename = "" } = req.file;

  if (
    !ngo_name ||
    !email ||
    !head_name ||
    !address ||
    !activity ||
    !password ||
    !contact_number
  ) {
    return res.status(422).json({ error: "pls filled all the field" });
  }

  try {
    const userExists = await Register.findOne({ email: email });
    // console.log(userExists);
    if (userExists) {
      return res.status(422).json({ error: "Email Already registered" });
    } else {
      const otp = randomNumberForOtp(1000, 9999);
      console.log({ otp });
      const register = new Register({
        ngo_name,
        email,
        head_name,
        address,
        activity,
        password,
        contact_number,
        document: filename,
        otp,
      });

      await register.save();

      const sendmailRes = await sendmail({
        email,
        textMessage: `Your Otp ${otp}`,
      });

      res.status(201).json({ message: "user registered Successfully" });
      console.log(req.body);
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, vOtp } = req.body;
  console.log({ email, vOtp, body: req.body });
  const userLogin = await Register.findOne({ email: email });
  console.log({ userLogin });
  if (userLogin) {
    const otp = userLogin.otp;
    if (vOtp.toString() === otp.toString()) {
      // isVerified
      console.log("same");
      const resUser = await Register.updateOne(
        { _id: userLogin.id },
        { $set: { isVerified: true } }
      );
      console.log({ resUser });
      res
        .status(200)
        .send({ message: "User Verified Successfully", success: true });
    } else {
      res.status(200).send({ message: "Otp invalid" });
    }
  }
});

router.get("/logout", (req, res) => {
  console.log("this is logout page");
  res.cookie("jwt", { path: "/" });
  res.status(200).send("logout Page");
});

router.post("/fraud", async (req, res) => {
  const { email, address, activity, message } = req.body;

  if (!email || !address || !activity || !message) {
    return res.status(422).json({ error: "pls filled all the field" });
  }
  try {
    // const fraudExist = await Fraud.findOne({ email: email });
    const fraud = new Fraud({
      email,
      address,
      activity,
      message,
    });
    await fraud.save();

    res.status(201).json({ message: "Fraud Ngo Details Send Successfully" });
    console.log(req.body);
  } catch (e) {
    res.send(e);
  }
});

router.post("/request", async (req, res) => {
  const { email, message, contact } = req.body;
  if (!email || !contact || !message) {
    return res.status(422).json({ error: "pls filled all the field" });
  }
  try {
    const request = new Requests({
      email,
      contact,
      message,
    });
    console.log(dateExist);
    await request.save();

    res.status(201).json({ message: "Send Successfully" });
    console.log(req.body);
  } catch (e) {
    res.send(e);
  }
});

module.exports = router;
