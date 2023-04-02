const mongoose = require("mongoose");
const validator = require("validator");

const reqSchema = mongoose.Schema({
  user_name: {
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
  contact: {
    tyep: Number,
  },
  message: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  ngo_id: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
});

const Requests = mongoose.model("Request", reqSchema);
module.exports = Requests;
