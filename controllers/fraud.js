const fraud = require('../models/fraudSchema.js');
const report = require('../models/reportSchema.js');

const getFrauds = async (req, res) => {
    try {
        const data = await fraud.find();
        res.status(200).send(data);
    } catch (error) {
        res.status(404).send(error);
    }
}

const addFraud = async (req, res) => {
    try {
        let { email, address, activity, message } = req.body;
        let data = await fraud.create({ email, address, activity, message });
        res.status(201).send(data);

    } catch (error) {
        res.status(404).send(error);
    }
}

const deleteReport = async (req, res) => {
    try {
        const _id = req.params.id;
        await report.findByIdAndRemove(_id);
        res.status(201).send("Report deleted Successfully");
    } catch (error) {
        res.status(409).send(error);
    }
}

const deleteFraud = async (req, res) => {
    try {
        const _id = req.params.id;
        await fraud.findByIdAndRemove(_id);
        res.status(201).send("Fraud deleted Successfully");
    } catch (error) {
        res.status(409).send(error);
    }
}


module.exports = { addFraud, deleteReport, getFrauds, deleteFraud }