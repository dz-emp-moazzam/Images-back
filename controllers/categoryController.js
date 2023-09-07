const express = require('express');
const Router = express.Router();
const Categories = require('../models/Categories');

Router.addCategory = async (req, res) => {
    try {
        const { name } = req.body;

        const categoryData = new Categories({
            name
        });

        await categoryData.save();
        res.json({ message: 'Successfully insert' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred in insertion of category.' });
    }
};

// Router.get = async (req, res) => {
//     try {
//         res.status(200).json({ result: await customer.find() });
//     } catch (error) {
//         res.status(500).json({ error: 'An error occurred while retrieving the records.' });
//     }
// };

// Router.get = async (req, res) => {
//     try {
//         res.status(200).json({ result: await customer.find() });
//     } catch (error) {
//         res.status(500).json({ error: 'An error occurred while retrieving the records.' });
//     }
// };

// Router.get = async (req, res) => {
//     try {
//         res.status(200).json({ result: await customer.find() });
//     } catch (error) {
//         res.status(500).json({ error: 'An error occurred while retrieving the records.' });
//     }
// };

// Router.get = async (req, res) => {
//     try {
//         const getCustomer = await customer.findOne({ _id: req.params.id });

//         if (!getCustomer) {
//             return res.send('Customer not found');
//         }

//         await customer.findOneAndRemove({ _id: req.params.id });
//         res.status(200).json("Deleted");
//     } catch (error) {
//         res.status(500).json("Customer not Delete");
//     }
// };

module.exports = Router;
