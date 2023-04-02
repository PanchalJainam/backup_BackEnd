const express = require("express");
const monogoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const Register = require("./models/regNgoSchema");

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
    res.send(e);
  }
});

app.get("/regngos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    const userNgo = await Register.findById({ _id: id });

    res.status(201).json(userNgo);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

    res.json(updatedUser);
    await updatedUser.save();
    console.log("User Name is: " + updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/regngos/:id", (req, res) => {
  const userId = req.params.id;

  // delete user from database using userId

  res.sendStatus(200);
});

app.listen(5000, () => {
  console.log("Succesfully run");
});
