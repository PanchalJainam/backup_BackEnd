const feedback = require('../models/feedbackSchema');

const getFeedback = async (req, res) => {
    try {
        const data = await feedback.find();
        res.status(200).send(data);
    } catch (error) {
        res.status(404).send(error);
    }
}

module.exports = { getFeedback }
