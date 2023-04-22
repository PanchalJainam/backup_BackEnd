const regNgo = require('../models/regNgoSchema');


const getNgo = async (req, res) => {
    try {
        const data = await regNgo.find();
        res.status(200).send(data);
    } catch (error) {
        res.status(404).send(error);
    }
}


const deleteNgo = async (req, res) => {
    try {
        const _id = req.params.id;
        await regNgo.findByIdAndRemove(_id);
        res.send("User deleted Successfully");
    } catch (error) {
        res.status(409).send(error);
    }
}


module.exports = { getNgo, deleteNgo }