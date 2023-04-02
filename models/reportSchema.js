const mongoose = require("mongoose");
const validator = require("validator");

const reportSchema = mongoose.Schema({
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
  user_id: {
    type: String,
    required: true,
  },
  ngo_id: {
    type: String,
    required: true,
  },
});

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
