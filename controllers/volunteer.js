const volunteer = require('../models/volunteerSchema.js');

const getVolunteer = async (req, res) => {
    try {
        const data = await volunteer.find();
        res.status(200).send(data);
    } catch (error) {
        res.status(404).send(error);
    }
}


const deleteVolunteer = async (req, res) => {
    try {
        const _id = req.params.id;
        await volunteer.findByIdAndRemove(_id);
        res.send("User deleted Successfully");
    } catch (error) {
        res.status(409).send(error);
    }
}



module.exports = { getVolunteer, deleteVolunteer }