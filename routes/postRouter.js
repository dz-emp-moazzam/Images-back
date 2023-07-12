const express = require('express');
const Router = express.Router();
const addCategories = require('./models/addCategories');
const addPosts = require('./models/addPosts');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Image
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = path.join(__dirname, "../public/images");
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({
    storage: storage
});

// Route to render the update post form
Router.get('/update-post', (req, res) => {
    res.render('adminFolder/update-post');
});

// Route to render the add post form
Router.get('/add-post', async (req, res) => {
    if (req.session.userRole) {
        let category1 = await addCategories.find();
        res.render('adminFolder/add-post', { category1: category1 });
    } else {
        res.redirect('/login');
    }
});

// Function to add posts and update the category count
async function AddPosts(categoryValue, option) {
    const postsTest = await addCategories.find({ c_name: categoryValue }, { noOfPosts: 1, _id: 0 });
    const mathematicalValue = postsTest[0].noOfPosts;
    let newposts = 0;
    if (option === 1) {
        newposts = mathematicalValue + 1;
    } else if (option === 2) {
        newposts = mathematicalValue - 1;
    } else {
        console.log("Not correct choice");
    }

    await addCategories.updateOne(
        { c_name: categoryValue },
        { $set: { noOfPosts: newposts } }
    );
}

// Route to handle the add post form submission
Router.post('/addPost', upload.single("p_image"), async (req, res) => {
    try {
        if (req.session.userRole) {
            if (req.body.c_role == "admin") {
                req.body.c_role = 1;
            }
            else {
                req.body.c_role = 0
            }

            const userData = new addPosts({
                p_title: req.body.p_title,
                c_name: req.body.c_name,
                p_image: req.file.filename,
                p_description: req.body.summernote,
                p_role: req.body.c_role,
                email: req.body.c_email
            });

            const user1 = await addPosts.findOne({ p_title: req.body.p_title });
            if (user1) {
                res.send('This product already added');
                return;
            }

            await userData.save().then(async () => {
                // Increment the category post count
                AddPosts(req.body.c_name, 1);
            });

            const user2 = await addPosts.findOne({ p_title: req.body.p_title });
            if (user2) {
                res.redirect("/dashboard/post");
                console.log('Data inserted.');
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log('Catch Block in add post');
        res.redirect("/dashboard/post");
    }
});

// Route to render the posts page
Router.get('/post', async (req, res) => {
    try {
        if (req.session.userRole) {
            if (req.session.userRole === 'admin')
            {
                const user3 = await addPosts.find().exec();
                res.render('adminFolder/post', { user3: user3 });
            }
            else if(req.session.userRole === "editor"){
                const user3 = await addPosts.find({email: req.session.userEmail})
                res.render('adminFolder/post', { user3: user3 });
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
        res.render('adminFolder/post', { user3: [] });
    }
});

// Route to get the edit record of a post
Router.get('/update-post/:id', async (req, res) => {
    if (req.session.userRole) {
        
        try {
            let id = req.params.id;
            console.log("Id in Update Post: ", id)
            let user = await addPosts.findOne({ _id: id }); // Use findOne instead of find
            console.log("User in Update Post: ", user)
            let category1 = await addCategories.find();

            if (!user) { // Check if user is null or undefined
                res.redirect('/dashboard/post');
            } else {
                res.render('adminFolder/update-post', { user: user, category1: category1 });
                console.log("Send fetch Data");
            }
        } catch (error) {
            res.redirect('/dashboard/post');
        }
    } else {
        res.redirect('/login');
    }
});


// Route to handle the update post form submission
Router.post('/update-post', upload.single("c_image_update"), async (req, res) => {
    try {
        let id = req.body.post_id_update;
        let categoryById = await addPosts.findById(id);
        let c1 = categoryById.c_name;
        console.log("Catgoery though Id: ", c1);

        let c2 = req.body.category_update;
        console.log("Catgoery though Body: ", c2);

        if (c1 !== c2) {
            AddPosts(c1, 2);
            AddPosts(c2, 1);
        }

        let newImage = "";

        if (req.file) {
            newImage = req.file.filename;
            try {
                fs.unlinkSync("./public/images/" + req.body.old_image_update);
                console.log("Enter in 2nd try block");
            } catch (error) {
                console.log(error);
                console.log("Enter in 2nd catch block");
            }
        } else {
            newImage = req.body.old_image_update;
            // console.log("Enter in else block");
        }

        await addPosts.findByIdAndUpdate(id, {
            p_title: req.body.post_title_update,
            p_description: req.body.summernote,
            c_name: req.body.category_update,
            p_image: newImage
        });

        res.redirect("/dashboard/post");
    } catch (error) {
        res.redirect("/dashboard/post");
        console.log('Not Update');
    }
});

// Route to delete a post
Router.get('/deletePost/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log("Id in Post Api: ", id);
        const user = await addPosts.findById(id);
        const c_name1 = user.c_name;
        console.log(c_name1);

        if (!user) {
            res.send('Post not found');
            return;
        }

        addPosts.findOneAndRemove({ _id: id }).then(async () => {
            // Decrement the category post count
            AddPosts(c_name1, 2);
        });

        res.redirect('/dashboard/post');
        console.log('Delete');
    } catch (error) {
        res.send('Error in deletion');
        console.log('Error in deletion');
    }
});

module.exports = Router;
