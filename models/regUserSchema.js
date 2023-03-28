const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const regUserSchema = mongoose.Schema({
  user_name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is Invalid");
      }
    },
  },
  contact_number: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  // cpassword: {
  //   type: String,
  // },
  otp: {
    type: String,
  },
  isVerified: {
    type: Boolean,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

regUserSchema.pre("save", async function (next) {
  console.log("inside");
  if (this.isModified("password")) {
    console.log("bcrypt");
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

regUserSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, "hello");
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};

const RegisterUser = mongoose.model("REGUSER", regUserSchema);
module.exports = RegisterUser;
