const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const regSchema = mongoose.Schema({
  ngo_name: {
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
  head_name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 20,
  },
  address: {
    type: String,
    required: true,
  },
  activity: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    // maxlength: 10,
  },
  cpassword: {
    type: String,
    required: true,
    // maxlength: 10,
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

regSchema.pre("save", async function (next) {
  console.log("inside");
  if (this.isModified("password")) {
    console.log("bcrypt");
    this.password = await bcrypt.hash(this.password, 12);
    this.cpassword = await bcrypt.hash(this.cpassword, 12);
  }
  next();
});

regSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, "hello");
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};
const Register = mongoose.model("REGUSER", regSchema);
module.exports = Register;
