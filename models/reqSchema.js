const mongoose = require("mongoose");
const validator = require("validator");

// const takeData = () => {
//   let dateVal = new Date();
//   let month = dateVal.getMonth();
//   let year = dateVal.getFullYear();
//   let date = dateVal.getDate();
//   return `${date}/${month}/${year}`;
// };

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
  time: {
    type: Date,
    default: new Date(),
  },
});

const Requests = mongoose.model("Request", reqSchema);
module.exports = Requests;
