const mongoose = require("mongoose");
const validator = require("validator");

const feedbackSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  emailfeedback: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;
