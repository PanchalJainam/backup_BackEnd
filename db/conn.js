const mongoose = require("mongoose");
// const dotenv = require("dotenv");

// dotenv.config({ path: "../config.env" });
// const DB = process.env.DATABASE;

mongoose.set("strictQuery", true);

mongoose
  .connect(
    "mongodb+srv://jainam:jainam@cluster0.wy91a.mongodb.net/prayatna?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log(`connect succeesfully`);
  })
  .catch((err) => {
    console.log(err);
  });
