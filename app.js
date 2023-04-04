const express = require("express");
const monogoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const Register = require("./models/regNgoSchema");
const RegisterUser = require("./models/regUserSchema");
const Volunteers = require("./models/volunteerSchema");
const Requests = require("./models/reqSchema");

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

/********************* Ngo API ***************************/
app.get("/regngos", async (req, res) => {
  try {
    const ngoData = await Register.find();
    res.send(ngoData);
  } catch (e) {
    cconsole.log(err);
  }
});

app.get("/reguser", async (req, res) => {
  try {
    const userData = await RegisterUser.find();
    res.send(userData);
  } catch (e) {
    console.log(err);
  }
});

/********************* User API ***************************/
app.get("/reguser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    const userNgo = await RegisterUser.findById({ _id: id });

    res.status(201).json(userNgo);
  } catch (err) {
    console.log(err);
  }
});

app.get("/regngos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id);

    const userNgo = await Register.findById({ _id: id });

    res.status(201).json(userNgo);
  } catch (err) {
    console.log(err);
  }
});

// **************** UPDATE TABLE VALUE CODE *****************

app.put("/regngos/:id", async (req, res) => {
  try {
    console.log("hello");
    const { _id } = req.params.id;
    const { ngo_name, activity } = req.body;

    const updatedUser = await Register.updateOne(
      _id,
      { $set: { ngo_name, activity } },
      { new: true }
    );
    console.log({ ngo_name });

    console.log({ updatedUser });
    res.status(200).send("Data Updated Successfully");
  } catch (err) {
    console.log(err);
  }
});

app.delete("/regngos/:id", (req, res) => {
  const userId = req.params.id;

  // delete user from database using userId

  res.sendStatus(200);
});

app.get("/volunteer", async (req, res) => {
  try {
    const volData = await Volunteers.find();
    res.send(volData);
  } catch (e) {
    console.log(e);
  }
});

app.get("/historydata/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log({ id });
    // const query = Requests.where({ status: "accepted" });
    const query1 = Requests.where({ status: "rejected" });
    // const volData = await query.find({ ngo_id: id });
    const volData = await query1.find({ ngo_id: id });
    res.send(volData);
  } catch (e) {
    console.log(e);
  }
});

app.listen(5000, () => {
  console.log("Succesfully run");
});
