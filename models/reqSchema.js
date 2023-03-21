const mongoose = require("mongoose");
const validator = require("validator");

const reqSchema = mongoose.Schema({
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
  contact: {
    tyep: Number,
    // required: true,
    // max: 10,
  },
  message: {
    type: String,
    required: true,
  },
});

// reqSchema.pre("save", async function (next) {
//   const dateExist = await Requests.insertOne({ timestamp: new Date() });
//   console.log(dateExist);
//   next();
// });

const Requests = mongoose.model("Request", reqSchema);
module.exports = Requests;
