const regUser = require('../models/regUserSchema.js');
const fraud = require('../models/fraudSchema');
const regNgo = require('../models/regNgoSchema');

const getUsers = async (req, res) => {
    try {
        const data = await regUser.find();
        res.status(200).send(data);
    } catch (error) {
        res.status(404).send(error);
    }
}


const deleteUser = async (req, res) => {
    try {
        const _id = req.params.id;
        console.log(_id);
        await regUser.findByIdAndRemove(_id);
        res.send("User deleted Successfully");
    } catch (error) {
        res.status(409).send(error);
    }
}
// const getFraud = async (req, res) => {
//     try {
//         const data = await fraud.find();
//         res.status(200).send(data);
//     } catch (error) {
//         res.status(404).send(err);
//     }
// }


// const getNgo = async (req, res) => {
//     try {
//         const data = await regNgo.find();
//         res.status(200).send(data);
//     } catch (error) {
//         res.status(404).send(err);
//     }
// }



module.exports = { getUsers, deleteUser }