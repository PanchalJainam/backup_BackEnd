const report = require('../models/reportSchema.js');

const getReports = async (req, res) => {
    try {
        const data = await report.find();
        res.status(200).send(data);
    } catch (error) {
        res.status(404).send(error);
    }
}

module.exports = { getReports }