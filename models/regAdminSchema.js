const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

// const takeData = () => {
//   let dateVal = new Date();
//   let month = dateVal.getMonth();
//   let year = dateVal.getFullYear();
//   let date = dateVal.getDate();
//   return `${date}/${month}/${year}`;
// };

const regAdminSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is Invalid");
      }
    },
  },
  password: {
    type: String,
    required: true,
    // maxlength: 10,
  },
  otp: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
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

regAdminSchema.pre("save", async function (next) {
  console.log("inside");
  if (this.isModified("password")) {
    console.log("bcrypt");
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const Admins = mongoose.model("Admin", regAdminSchema);
module.exports = Admins;
