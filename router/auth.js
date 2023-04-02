const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const Register = require("../models/regNgoSchema");
const Volunteers = require("../models/volunteerSchema");
const RegisterUser = require("../models/regUserSchema");
const Fraud = require("../models/fraudSchema");
const Feedback = require("../models/feedbackSchema");
const Requests = require("../models/reqSchema");
const Report = require("../models/reportSchema");
const { sendmail } = require("../utils/sendmail");
const { Console } = require("console");

// router.get("/", (req, res) => {
//   res.send("auth.js home page");
// });

const verifyToken = (token) => {
  const data = jwt.verify(token, "hello");
  return data;
};

router.post("/token-data", async (req, res) => {
  const { token } = req.body;
  const user_id = verifyToken(token);
  const ngoLogin = await Register.findOne({ _id: user_id });
  const userLogin = await RegisterUser.findOne({ _id: user_id });
  console.log({ ngoLogin, userLogin });
  if (ngoLogin) {
    res.status(200).send({ userData: ngoLogin });
  } else if (userLogin) {
    res.status(200).send({ userData: userLogin });
  } else {
    res.status(400).send({ userData: null });
  }
});

// ******************* LOG-IN ROUTER ****************************
router.post("/login", async (req, res) => {
  try {
    let token;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please Filled the data" });
    }

    const ngoLogin = await Register.findOne({ email: email });
    const userLogin = await RegisterUser.findOne({ email: email });

    // console.log(userLogin);
    if (ngoLogin) {
      const pwd = await bcrypt.compare(password, ngoLogin.password);

      if (!pwd) {
        res.status(429).json({ error: "Password Error" });
      } else {
        token = await ngoLogin.generateAuthToken();
        console.log("token is : " + token);

        // res.cookie("jwt", token, {
        //   expires: new Date(Date.now() + 2546500045400),
        //   httpOnly: true,
        // });
        res
          .status(201)
          .json({ meassage: "Done Successfully", token, userData: ngoLogin });
      }
    } else if (userLogin) {
      const pwd = await bcrypt.compare(password, userLogin.password);

      if (!pwd) {
        res.status(429).json({ error: "Password Error" });
      } else {
        token = await userLogin.generateAuthToken();
        console.log("token is : " + token);

        // res.cookie("jwt", token, {
        //   expires: new Date(Date.now() + 2546500045400),
        //   httpOnly: true,
        // });
        res
          .status(201)
          .json({ meassage: "Done Successfully", token, userData: userLogin });
      }
    } else {
      res.status(413).json({ error: "You are Not Registered" });
    }
  } catch (err) {
    console.log(err);
  }
});

// router.post("/signin", async (req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;

//   if (!email || !password) {
//     res.status(400).send({ message: "Fill the data" });
//   }

//   try {
//     const data = await User.findOne({ email });
//     !data && res.status(422).send({ message: "Invalid Details" });
//     const isLogin = await bcryptjs.compare(password, data.password);
//     if (isLogin) {
//       const token = await data.createToken();
//       console.log(token);
//       res.cookie("jwtdata", token, {
//         expires: new Date(Date.now() + 60 * 60 * 2 * 1000),
//         httpOnly: true,
//       });
//       res.status(200).json({ message: "Signin successfully" });
//     } else {
//       res.status(422).send({ message: "Invalid Details" });
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(500).send(err);
//   }
// });

/****** File Document Store Code ***************/

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

/******************** OTP GENERATION FUNCTION ****************************/

function randomNumberForOtp(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

/************* VETIFY OTP Code ***************/

router.post("/verify-otp", async (req, res) => {
  const { email, vOtp } = req.body;
  console.log({ email, vOtp, body: req.body });
  const ngoLogin = await Register.findOne({ email: email });
  const userLogin = await RegisterUser.findOne({ email: email });
  console.log({ ngoLogin, userLogin });
  if (userLogin) {
    const otp = userLogin.otp;
    if (vOtp.toString() === otp.toString()) {
      // isVerified
      console.log("same");
      const resUser = await RegisterUser.updateOne(
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
  } else if (ngoLogin) {
    const otp = ngoLogin.otp;
    if (vOtp.toString() === otp.toString()) {
      // isVerified
      console.log("same");
      const resUser = await Register.updateOne(
        { _id: ngoLogin.id },
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

/************* NGO REGISTRATION Code ***************/
router.post(
  "/registration",
  upload.single("document"),
  async (req, res, next) => {
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

        console.log("user registered Process");
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
  }
);

/************* USER REGISTRATION Code ***************/
router.post("/user-registration", async (req, res) => {
  const { user_name, email, password, contact_number } = req.body;
  console.log(user_name);
  console.log(email);
  console.log(password);
  console.log(contact_number);

  if (!user_name || !email || !password || !contact_number) {
    return res.status(422).json({ error: "pls filled all the field" });
  }

  try {
    const userExists = await RegisterUser.findOne({ email: email });
    // console.log(userExists);
    if (userExists) {
      return res.status(422).json({ error: "Email Already registered" });
    } else {
      const otp = randomNumberForOtp(1000, 9999);
      console.log(`User Otp Is :${otp}`);
      const registeruser = new RegisterUser({
        user_name,
        email,
        password,
        contact_number,
        otp,
      });

      await registeruser.save();

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

// **************** ACCEPT REQUEST API ****************
router.put("/request/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log({ status });
    res.send(id);
    const acceptedReq = await Requests.findByIdAndUpdate(
      { id },
      { $set: { status: "accepted" } },
      { new: true }
    );
    console.log(req.body);
    console.log({ acceptedReq });
    res.send("Successfully Updated");
    await acceptedReq.save();
  } catch (e) {
    console.log(e);
  }
});

// router.post("/decline-request/:status", async (req, res) => {
//   const { status } = req.params;
//   console.log(status);
//   const acceptedReq = await Requests.findOne({ email: email });
//   if (acceptedReq) {
//     const sendmailRes = await sendmail({
//       email,
//       textMessage: `Your Request Has Been ${status}`,
//     });
//     res.send("Mail Send Successfully");
//   } else {
//     console.log("User Are Not Found");
//   }
// });

router.get("/logout", (req, res) => {
  console.log("this is logout page");
  res.cookie("jwt", { path: "/" });
  res.status(200).send("logout Page");
});

router.post("/feedback", async (req, res) => {
  const { email, message } = req.body;

  if (!email || !message) {
    return res.status(422).json({ error: "pls filled all the field" });
  }
  try {
    const feedback = new Feedback({
      email,
      message,
    });
    await feedback.save();

    res.status(201).json({ message: "Message Send Successfully" });
    console.log(req.body);
  } catch (e) {
    res.send(e);
  }
});
router.post("/fraud", async (req, res) => {
  const { email, address, activity, message } = req.body;

  if (!email || !address || !activity || !message) {
    return res.status(422).json({ error: "pls filled all the field" });
  }
  try {
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
router.post("/report", async (req, res) => {
  const { email, address, activity, message, user_id, ngo_id } = req.body;

  if (!email || !address || !activity || !message) {
    return res.status(422).json({ error: "pls filled all the field" });
  }
  try {
    const report = new Report({
      email,
      address,
      activity,
      message,
      user_id,
      ngo_id,
    });
    await report.save();

    res.status(201).json({ message: "Reprt to Ngo Send Successfully" });
    console.log(req.body);
  } catch (e) {
    res.send(e);
  }
});

/*************** VOLUNTEER DTABASE CODE ********************/

router.post("/volunteer", async (req, res) => {
  const {
    fname,
    lname,
    email,
    address,
    activity,
    gender,
    occupation,
    contact_number,
  } = req.body;
  if (
    !email ||
    !fname ||
    !lname ||
    !address ||
    !activity ||
    !gender ||
    !occupation ||
    !contact_number
  ) {
    return res.status(422).json({ error: "pls filled all the field" });
  }
  try {
    const volunteer = new Volunteers({
      fname,
      lname,
      email,
      address,
      activity,
      gender,
      occupation,
      contact_number,
    });
    console.log(req.body);
    // console.log(dateExist);
    await volunteer.save();

    res.status(201).json({ message: "Send Successfully" });
  } catch (e) {
    res.send(e);
  }
});

router.post("/request", async (req, res) => {
  const { user_name, email, message, contact, user_id, ngo_id } = req.body;
  if (!user_name || !email || !contact || !message) {
    return res.status(422).json({ error: "pls filled all the field" });
  }
  try {
    const request = new Requests({
      user_name,
      email,
      contact,
      message,
      user_id,
      ngo_id,
    });

    const d = await request.save();

    console.log(req.body);
    res.status(201).json({ message: "Send Successfully" });
  } catch (e) {
    console.log({ e });
  }
});

router.all("/request-all/:id", async (req, res) => {
  const { id } = req.params;
  console.log({ id });
  const records = await Requests.find({ ngo_id: id, status: "pending" });
  res.send(records);
  console.log(records);
});

//route name request-alll
//_id
//const records = await Model.find({ 'ngo_id': _id });
//records

module.exports = router;
