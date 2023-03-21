const mongoose = require("mongoose");
const validator = require("validator");

const fraudSchema = mongoose.Schema({
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
  address: {
    type: String,
    required: true,
  },
  activity: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const Frauds = mongoose.model("Fraud", fraudSchema);
module.exports = Frauds;
