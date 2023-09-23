const express = require('express');
const Router = express.Router();
const Categories = require('../models/Categories');
const Images = require('../models/Images');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsWithoutPromises = require('fs');

// Image
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = path.join(__dirname, '../public/images');
        // console.log('destinationPath: ' + destinationPath);
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        const filename = file.originalname; // Corrected to use file.originalname
        cb(null, filename);
    }
});

var upload = multer({
    storage: storage
});

Router.addImage = async (req, res) => {
    try {
        const { state, tags, categories } = req.body;
        const categoryNames = categories.split(","); // Split category names into an array
        // console.log("categoryNames: " + categoryNames);

        // Find category IDs based on category names
        const categoryIds = await Categories.find({ name: { $in: categoryNames } }).select('_id');

        // Extract _id values and create an array
        const categoryIdsArray = categoryIds.map(category => category._id);

        // console.log("categoryIds: " + categoryIdsArray);
        const tagsArray = tags.split(",");
        if (req.file.filename) {
            const checkImage = await Images.findOne({ name: req.file.filename })
            // console.log("checkImage: " + checkImage);
            if (checkImage) {
                res.json({ status: 400, message: 'This image already exist' });
            } else {
                // console.log("name:", name);
                const imageData = new Images({
                    name: req.file.filename,
                    state: state,
                    tags: tagsArray,
                    categories: categoryIdsArray
                });

                // console.log("ImageData:", imageData);

                await imageData.save();

                const checkImageSave = await Images.findOne({ name: req.file.filename })

                if (checkImageSave) {
                    res.json({ status: 200, message: 'Image uploaded Successfully', data: imageData });

                } else {
                    res.json({ status: 400, message: 'Image Not Upload' });
                }
            }
        }
        else {
            res.json({ status: 400, message: 'Please Fill all fields' });
        }
    } catch (error) {
        res.json({ status: 500, error: 'An error occurred in uploading the image' });
    }
};

Router.listOfImages = async (req, res) => {
    try {
        const imagesData = await Images.find();

        // console.log("Images List: " + imagesData);

        // Create a list to store images with category names
        const imagesWithCategoryNames = await Promise.all(imagesData.map(async (image) => {
            // Fetch category names based on category IDs stored in the image
            const categoryNames = await Categories.find({ _id: { $in: image.categories } }).select('name');

            // Map category documents to category names
            const categories = categoryNames.map(category => category.name);

            // Create a new object with category names and other image data
            const imageWithCategories = {
                ...image._doc, // Include existing image data
                categories: categories, // Replace category IDs with category names
            };

            return imageWithCategories;
        }));

        // console.log("Images List: " + imagesWithCategoryNames);

        res.json({ status: 200, data: imagesWithCategoryNames });
    } catch (error) {
        res.json({ status: 500, error: 'An error occurred while retrieving the records.' });
    }
};

Router.changeStatus = async (req, res) => {
    try {
        // console.log("Image ID: ", req.params.id);
        const checkImage = await Images.findById(req.params.id);

        if (checkImage) {
            if (checkImage.state === "Pending") {
                checkImage.state = "Approved";
                const updateState = await checkImage.save();
                if (updateState.state === "Approved") {
                    res.json({ status: 200, message: "Update Status Successfully" });
                }
            } else if (checkImage.state === "Approved") {
                checkImage.state = "Pending";
                const updateState = await checkImage.save();
                if (updateState.state === "Pending") {
                    res.json({ status: 200, message: "Update Status Successfully" });
                }
            }
        } else {
            res.json({ status: 400, message: "Image not found" });
        }
    } catch (error) {
        res.json({ status: 500, error: 'An error occurred while retrieving the record.' });
    }
};

Router.getImage = async (req, res) => {
    try {
        const checkImage = await Images.findById(req.params.id);
        if (checkImage) {
            // Map the category IDs to category names
            const categoryNames = await Categories.find({ _id: { $in: checkImage.categories } }, 'name');
            const categoryNamesArray = categoryNames.map(category => category.name);

            // Replace the category IDs with category names in the data
            const imageData = { ...checkImage._doc, categories: categoryNamesArray };

            res.json({ status: 200, message: "Image get Successfully", data: imageData });
        } else {
            res.json({ status: 400, message: "Image not found" });
        }
    } catch (error) {
        res.json({ status: 500, error: 'An error occurred while retrieving the records.' });
    }
};

Router.updateImage = async (req, res) => {
    try {
        const { state, tags, categories } = req.body;
        // console.log("categories: ", categories);
        // console.log("Image ID: ", req.params.id);
        if (!tags || !categories) {
            // console.log("Tags: " + tags);
            res.json({ status: 400, message: "Please Fill All Fields" });
        } else {
            const checkImage = await Images.findById(req.params.id);
            if (checkImage) {
                // Find category IDs based on category names
                const categoryIds = await Categories.find({ name: { $in: categories } }).select('_id');
                // console.log("categoryIds: ", categoryIds);
                // Extract _id values and create an array
                const categoryIdsArray = categoryIds.map(category => category._id);
                // console.log("categoryIdsArray: ", categoryIdsArray);

                // console.log("categoryIds: " + categoryIdsArray);

                const updateObject = {
                    name: checkImage.name,
                    tags: tags,
                    categories: categoryIdsArray,
                    state: state
                };

                await Images.findByIdAndUpdate({ _id: req.params.id }, { $set: updateObject })
                res.json({ status: 200, message: "Update Successfully" });

            } else {
                res.json({ status: 400, message: "Image not found" });
            }
        }
    } catch (error) {
        res.json({ status: 500, error: 'An error occurred while retrieving the records.' });
    }
};

Router.deleteImage = async (req, res) => {
    try {
        const checkImage = await Images.findById(req.params.id);

        if (checkImage) {
            await Images.findByIdAndRemove(req.params.id);
            // Delete the image if it exists
            const ImagePath = path.join(__dirname, '..', 'public', 'images', checkImage.name);
            if (fsWithoutPromises.existsSync(ImagePath)) {
                fsWithoutPromises.unlinkSync(ImagePath);
            }

            const checkImageDelete = await Images.findById(req.params.id)

            if (checkImageDelete) {
                res.json({ status: 400, message: 'Image Not Deleted' });
            } else {
                res.json({ status: 200, message: 'Image deleted Successfully' });
            }
        } else {
            res.json({ status: 400, message: "Image not found" });
        }
    } catch (error) {
        res.json({ status: 500, error: 'An error occurred while retrieving the record.' });
    }
};

module.exports = Router;
