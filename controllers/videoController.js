const express = require('express');
const Router = express.Router();
const Categories = require('../models/Categories');
const Videos = require('../models/Videos');
const multer = require("multer");
// const ffmpeg = require('fluent-ffmpeg'); // Import fluent-ffmpeg
const { spawn } = require('child_process');
const path = require("path");
const fs = require("fs");
const fsWithoutPromises = require('fs');
const which = require('which');

// Function to find the path to the ffmpeg executable
function findFFmpegPath() {
    try {
        // Attempt to find the path to the ffmpeg executable
        const ffmpegPath = which.sync('ffmpeg');
        return ffmpegPath;
    } catch (error) {
        console.error('FFmpeg executable not found. Please make sure FFmpeg is installed and in your PATH.');
        process.exit(1);
    }
}

// Define a function to compress a video using FFmpeg
function compressVideo(inputPath, outputPath) {
    const ffmpegPath = findFFmpegPath();
    return new Promise((resolve, reject) => {
        // Use FFmpeg command to compress the video
        const ffmpeg = spawn('ffmpeg', [
            '-i', inputPath,              // Input file
            '-c:v', 'libx264',           // Video codec
            '-crf', '28',                // Constant Rate Factor (lower value means higher quality but larger file size)
            '-preset', 'slow',           // Compression preset (slow provides better compression)
            outputPath                   // Output file
        ]);
        // Listen for FFmpeg process events
        ffmpeg.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        ffmpeg.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                console.log('Video compression finished');
                resolve();
            } else {
                console.error(`Video compression process exited with code ${code}`);
                reject(`Video compression process exited with code ${code}`);
            }
        });
    });
}

// // Video
// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const destinationPath = path.join(__dirname, '../public/videos');
//         // console.log('destinationPath: ' + destinationPath);
//         cb(null, destinationPath);
//     },
//     filename: function (req, file, cb) {
//         const filename = file.originalname; // Corrected to use file.originalname
//         cb(null, filename);
//     }
// });

// var upload = multer({
//     storage: storage
// });
// // const multer = require("multer");
// // const path = require("path");
// // const fs = require('fs').promises; // Import the 'promises' version of the fs module
// // const fsWithoutPromises = require('fs');

// // // Video
// // var storage = multer.diskStorage({
// //     destination: function (req, file, cb) {
// //         const destinationPath = path.join(__dirname, "../public/Videos");
// //         cb(null, destinationPath);
// //     },
// //     filename: function (req, file, cb) {
// //         cb(null, file.originalname);
// //     }
// // });

// // var upload = multer({
// //     storage: storage
// // });

// async function AddVideos(categoryValues, option) {
//     // console.log("VideosTest: " + categoryValues);
//     categoryValues.forEach(async (categoryValue) => {
//         // console.log("categoryValue: " + categoryValue);
//         const VideosTest = await Categories.find({ name: categoryValue }, { numberOfVideos: 1, _id: 0 });
//         // console.log("VideosTest: " + VideosTest);
//         const mathematicalValue = VideosTest[0].numberOfVideos;
//         let newVideos = 0;
//         if (option === 1) {
//             console.log("Add");
//             newVideos = mathematicalValue + 1;
//         } else if (option === 2) {
//             console.log("Delete");
//             newVideos = mathematicalValue - 1;
//         } else {
//             console.log("Not a correct choice");
//         }

//         const check1 = await Categories.findOne({ name: categoryValue });
//         console.log("Before Delete: " + check1.numberOfVideos);

//         await Categories.updateOne(
//             { name: categoryValue },
//             { $set: { numberOfVideos: newVideos } }
//         );

//         const check2 = await Categories.findOne({ name: categoryValue });
//         console.log("After Delete: " + check2.numberOfVideos);

//     });
// }

Router.addVideo = async (req, res) => {
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
            const checkVideo = await Videos.findOne({ name: req.file.filename })
            // console.log("checkVideo: " + checkVideo);
            if (checkVideo) {
                res.json({ status: 400, message: 'This Video already exist' });
            } else {
                // console.log("name:", name);
                // Define input and output paths for video compression
                const inputVideoPath = path.join(__dirname, '../public/videos', req.file.filename);
                const compressedVideoPath = path.join(__dirname, '../public/videos/compress', req.file.filename);
                // Compress the video
                await compressVideo(inputVideoPath, compressedVideoPath);
                const VideoData = new Videos({
                    name: req.file.filename,
                    state: state,
                    tags: tagsArray,
                    categories: categoryIdsArray
                });

                // console.log("VideoData:", VideoData);

                await VideoData.save();

                const checkVideoSave = await Videos.findOne({ name: req.file.filename })

                if (checkVideoSave) {
                    res.json({ status: 200, message: 'Video uploaded Successfully', data: VideoData });

                } else {
                    res.json({ status: 400, message: 'Video Not Upload' });
                }
            }
        }
        else {
            res.json({ status: 400, message: 'Please Fill all fields' });
        }
    } catch (error) {
        res.json({ status: 500, error: 'An error occurred in uploading the Video' });
    }
};

Router.listOfVideos = async (req, res) => {
    try {
        const VideosData = await Videos.find();

        // console.log("Videos List: " + VideosData);

        // Create a list to store Videos with category names
        const VideosWithCategoryNames = await Promise.all(VideosData.map(async (Video) => {
            // Fetch category names based on category IDs stored in the Video
            const categoryNames = await Categories.find({ _id: { $in: Video.categories } }).select('name');

            // Map category documents to category names
            const categories = categoryNames.map(category => category.name);

            // Create a new object with category names and other Video data
            const VideoWithCategories = {
                ...Video._doc, // Include existing Video data
                categories: categories, // Replace category IDs with category names
            };

            return VideoWithCategories;
        }));

        // console.log("Videos List: " + VideosWithCategoryNames);

        res.json({ status: 200, data: VideosWithCategoryNames });
    } catch (error) {
        res.json({ status: 500, error: 'An error occurred while retrieving the records.' });
    }
};

Router.changeStatus = async (req, res) => {
    try {
        // console.log("Video ID: ", req.params.id);
        const checkVideo = await Videos.findById(req.params.id);

        if (checkVideo) {
            if (checkVideo.state === "Pending") {
                checkVideo.state = "Approved";
                const updateState = await checkVideo.save();
                if (updateState.state === "Approved") {
                    res.json({ status: 200, message: "Update Status Successfully" });
                }
            } else if (checkVideo.state === "Approved") {
                checkVideo.state = "Pending";
                const updateState = await checkVideo.save();
                if (updateState.state === "Pending") {
                    res.json({ status: 200, message: "Update Status Successfully" });
                }
            }
        } else {
            res.json({ status: 400, message: "Video not found" });
        }
    } catch (error) {
        res.json({ status: 500, error: 'An error occurred while retrieving the record.' });
    }
};

Router.getVideo = async (req, res) => {
    try {
        const checkVideo = await Videos.findById(req.params.id);
        if (checkVideo) {
            // Map the category IDs to category names
            const categoryNames = await Categories.find({ _id: { $in: checkVideo.categories } }, 'name');
            const categoryNamesArray = categoryNames.map(category => category.name);

            // Replace the category IDs with category names in the data
            const VideoData = { ...checkVideo._doc, categories: categoryNamesArray };

            res.json({ status: 200, message: "Video get Successfully", data: VideoData });
        } else {
            res.json({ status: 400, message: "Video not found" });
        }
    } catch (error) {
        res.json({ status: 500, error: 'An error occurred while retrieving the records.' });
    }
};

Router.updateVideo = async (req, res) => {
    try {
        const { state, tags, categories } = req.body;
        // console.log("categories: ", categories);
        // console.log("Video ID: ", req.params.id);
        if (!tags || !categories) {
            // console.log("Tags: " + tags);
            res.json({ status: 400, message: "Please Fill All Fields" });
        } else {
            const checkVideo = await Videos.findById(req.params.id);
            if (checkVideo) {
                // Find category IDs based on category names
                const categoryIds = await Categories.find({ name: { $in: categories } }).select('_id');
                // console.log("categoryIds: ", categoryIds);
                // Extract _id values and create an array
                const categoryIdsArray = categoryIds.map(category => category._id);
                // console.log("categoryIdsArray: ", categoryIdsArray);

                // console.log("categoryIds: " + categoryIdsArray);

                const updateObject = {
                    name: checkVideo.name,
                    tags: tags,
                    categories: categoryIdsArray,
                    state: state
                };

                await Videos.findByIdAndUpdate({ _id: req.params.id }, { $set: updateObject })
                res.json({ status: 200, message: "Update Successfully" });

            } else {
                res.json({ status: 400, message: "Video not found" });
            }
        }
    } catch (error) {
        res.json({ status: 500, error: 'An error occurred while retrieving the records.' });
    }
};

Router.deleteVideo = async (req, res) => {
    try {
        const checkVideo = await Videos.findById(req.params.id);

        if (checkVideo) {
            await Videos.findByIdAndRemove(req.params.id);
            // Delete the Video if it exists
            const VideoOriginalPath = path.join(__dirname, '..', 'public', 'videos', checkVideo.name);
            if (fsWithoutPromises.existsSync(VideoOriginalPath)) {
                fsWithoutPromises.unlinkSync(VideoOriginalPath);
            }
            const VideoCompressPath = path.join(__dirname, '..', 'public', 'videos', 'compress', checkVideo.name);
            if (fsWithoutPromises.existsSync(VideoCompressPath)) {
                fsWithoutPromises.unlinkSync(VideoCompressPath);
            }

            const checkVideoDelete = await Videos.findById(req.params.id)

            if (checkVideoDelete) {
                res.json({ status: 400, message: 'Video Not Deleted' });
            } else {
                // Find category IDs based on category names
                const categoryNames = await Categories.find({ _id: { $in: checkVideo.categories } }).select('name');
                // Extract _id values and create an array
                const categoryNamesArray = categoryNames.map(category => category.name);
                // console.log("categoryNamesArray", categoryNamesArray);
                // Decrement the category Video count
                AddVideos(categoryNamesArray, 2);
                res.json({ status: 200, message: 'Video deleted Successfully' });
            }
        } else {
            res.json({ status: 400, message: "Video not found" });
        }
    } catch (error) {
        res.json({ status: 500, error: 'An error occurred while retrieving the record.' });
    }
};

module.exports = Router;
