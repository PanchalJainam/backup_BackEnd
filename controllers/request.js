const Requests = require("../models/reqSchema");

const getRequest = async (req, res) => {
  try {
    const data = await Requests.find();
    res.status(200).send(data);
  } catch (error) {
    res.status(404).send(error);
  }
};
const deleteRequest = async (req, res) => {
  try {
    const _id = req.params.id;
    await Requests.findByIdAndRemove(_id);
    res.send("User deleted Successfully");
  } catch (error) {
    res.status(409).send(error);
  }
};

module.exports = { getRequest, deleteRequest };
