const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const Admins = require("../models/regAdminSchema");

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
    const { email, password, user } = req.body;
    console.log(user);

    if (!email || !password) {
      return res.status(400).json({ error: "Please Filled the data" });
    }

    // console.log(userLogin);
    if (!user) {
      const ngoLogin = await Register.findOne({ email: email });
      const pwd = await bcrypt.compare(password, ngoLogin.password);
      if (!ngoLogin) {
        res.status(413).json({ error: "Ngo Not Registerd" });
      } else if (!pwd) {
        res.status(429).json({ error: "Invalid Password " });
      } else {
        token = await ngoLogin.generateAuthToken();
        console.log("token is : " + token);

        res
          .status(201)
          .json({ meassage: "Done Successfully", token, userData: ngoLogin });
      }
    } else {
      const userLogin = await RegisterUser.findOne({ email: email });
      const pwd = await bcrypt.compare(password, userLogin.password);
      if (!userLogin) {
        res.status(413).json({ error: "User Not Registerd" });
      } else if (!pwd) {
        res.status(429).json({ error: "Invalid Password " });
      } else {
        token = await userLogin.generateAuthToken();
        console.log("token is : " + token);
        res
          .status(201)
          .json({ meassage: "Done Successfully", token, userData: userLogin });
      }
    }
  } catch (err) {
    console.log(err);
  }
});

// ==================Admin Login======================

router.post("/admin-login", async (req, res) => {
  try {
    let token;
    const { email, password, user } = req.body;
    console.log(user);

    if (!email || !password) {
      return res.status(400).json({ error: "Please Filled the data" });
    }

    // console.log(userLogin);
    const adminLogin = await Admins.findOne({ email: email });
    const pwd = await bcrypt.compare(password, adminLogin.password);
    if (!adminLogin) {
      res.status(413).json({ error: "Ngo Not Registerd" });
    } else if (!pwd) {
      res.status(429).json({ error: "Invalid Password " });
    } else {
      token = await adminLogin.generateAuthToken();
      console.log("token is : " + token);
      res
        .status(201)
        .json({ meassage: "Done Successfully", token, userData: adminLogin });
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
        if (userExists.isVerified == false) {
          await Register.deleteOne({ email: email, isVerified: false });
        } else {
          return res.status(422).json({ error: "Email Already registered" });
        }
      }
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

// ======================Admin register=======================

router.post("/admin-registration", async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(422).json({ error: "pls filled all the field" });
  }
  try {
    const userExists = await Admins.findOne({ email: email });

    if (userExists) {
      if (userExists.isVerified == false) {
        await Register.deleteOne({ email: email, isVerified: false });
      } else {
        return res.status(422).json({ error: "Email Already registered" });
      }
    }
    const otp = randomNumberForOtp(1000, 9999);
    console.log({ otp });
    const register = new Admins({
      name,
      email,
      password,
      otp,
    });

    console.log("admin registered Process");
    await register.save();

    const sendmailRes = await sendmail({
      email,
      subject: "OTP Verification",
      textMessage: `Your Otp ${otp}`,
    });

    res.status(201).json({ message: "user registered Successfully" });
    console.log(req.body);
  } catch (err) {
    console.log(err);
  }
});

// **************** ACCEPT REQUEST API ****************
router.put("/request-accept/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // const { req_email } = await Requests.find(_id);
    const { email } = req.body;
    console.log({ email, id });

    const acceptedReq = await Requests.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "accepted" } },
      { new: true }
    );
    await acceptedReq.save();
    const sendmailRes = await sendmail({
      email: email,
      textMessage: "Your Request Has Been Accepted :-)",
    });
    console.log({ sendmailRes });
    res.send("Successfully Updated");
  } catch (e) {
    console.log(e);
  }
});

router.put("/request-rejected/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // const { req_email } = await Requests.find(_id);
    const { email } = req.body;
    console.log({ email, id });

    const acceptedReq = await Requests.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "rejected" } },
      { new: true }
    );
    await acceptedReq.save();
    const sendmailRes = await sendmail({
      email: email,
      textMessage: "Your Request Has Been Rejected.",
    });
    console.log({ sendmailRes });
    res.send("Successfully Updated");
  } catch (e) {
    console.log(e);
  }
});

router.get("/logout", (req, res) => {
  console.log("this is logout page");
  res.cookie("jwt", { path: "/" });
  res.status(200).send("logout Page");
});

router.post("/feedback", async (req, res) => {
  const { user_name, email: emailfeedback, message, rating } = req.body;
  console.log(user_name, emailfeedback, message);

  if (!user_name || !emailfeedback || !message) {
    return res.status(422).json({ error: "pls filled all the field" });
  }
  try {
    console.log();
    const feedback = new Feedback({
      user_name,
      emailfeedback,
      message,
      rating,
    });
    console.log(rating);
    await feedback.save();

    res.status(201).json({ message: "Message Send Successfully" });
    console.log(req.body);
  } catch (e) {
    console.log(e);
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
    console.log(e);
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
    console.log(e);
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
  // const { ngo_id } = req.params;
  const { user_name, email, message, contact_number, user_id, ngo_id } =
    req.body;
  console.log(user_name);
  console.log(email);
  console.log(contact_number);
  if (!user_name || !email || !contact_number || !message) {
    return res.status(422).json({ error: "pls filled all the field" });
  }
  try {
    const request = new Requests({
      user_name,
      email,
      contact_number,
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

router.put("/changepwd/:id", async (req, res) => {
  const { curpwd, newpwd } = req.body;
  const { id } = req.params;
  console.log({ id });

  const ngoLogin = await Register.findById({ _id: id });
  const pwd = await bcrypt.compare(curpwd, ngoLogin.password);
  if (pwd) {
    const password = await bcrypt.hash(newpwd, 12);

    const updatedUser = await Register.updateOne(
      { _id: id },
      { $set: { password } },
      { new: true }
    );
    console.log({ newpwd });
    console.log({ updatedUser });
  }
});

router.post("/send-mail-for-forgot-password", async (req, res) => {
  const { email } = req.body;
  const otp = randomNumberForOtp(1000, 9999);

  console.log({ email });
  const ngoLogin = await Register.findOne({ email: email });
  const userLogin = await RegisterUser.findOne({ email: email });

  if (ngoLogin) {
    const resUser = await Register.updateOne(
      { email: email },
      { $set: { otp: otp.toString() } }
    );
    console.log({ resUser });

    const sendmailRes = await sendmail({
      email,
      textMessage: `Your Otp ${otp}`,
    });

    res.status(200).send({ message: "email sent", user: "ngo" });
  } else if (userLogin) {
    const resUser = await RegisterUser.updateOne(
      { email: email },
      { $set: { otp: otp.toString() } }
    );
    console.log({ resUser });
    const sendmailRes = await sendmail({
      email,
      textMessage: `Your Otp ${otp}`,
    });
    res.status(200).send({ message: "email sent", user: "user" });
  } else {
    res.status(400).send({ message: "email not found", user: "user" });
  }
});

router.post("/change-password-with-otp", async (req, res) => {
  const { password, otp, email } = req.body;
  const ngoLogin = await Register.findOne({ email: email });
  const userLogin = await RegisterUser.findOne({ email: email });
  const encPassword = await bcrypt.hash(password, 12);
  if (ngoLogin) {
    const resUser = await Register.updateOne(
      { email: email, otp: otp },
      { $set: { password: encPassword } }
    );
    res.status(200).send({ message: "password changes" });
  } else if (userLogin) {
    const resUser = await RegisterUser.updateOne(
      { email: email, otp: otp },
      { $set: { password: encPassword } }
    );
    res.status(200).send({ message: "password changes" });
  } else {
    console.log("invalid email");
    res.status(400).send({ message: "Something went wrong" });
  }
});

module.exports = router;
