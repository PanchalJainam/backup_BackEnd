const express = require("express");
const monogoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const Register = require("./models/regSchema");

// const validator = require("validator");

app.use(express.json());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(bodyParser.json({ limit: "50mb" }));

// console.log(validator);

dotenv.config({ path: "./config.env" });

require("./db/conn");

// const Register = require("./models/regSchema");

app.use(require("./router/auth"));

app.get("/", (req, res) => {
  res.send("home page");
});

app.get("/regusers", async (req, res) => {
  try {
    const ngoData = await Register.find();
    res.send(ngoData);
  } catch (e) {
    res.send(e);
  }
});

app.listen(5000, () => {
  console.log("Succesfully run");
});
