const express = require('express');
const Router = express.Router();
const addCategories = require('./models/addCategories');
const addPosts = require('./models/addPosts');

Router.get('/update-category', (req, res) => {
    res.render('adminFolder/update-category');
})

// category page
Router.get('/category', async (req, res) => {
    try {
        if (req.session.userRole) {
            const user2 = await addCategories.find().exec();
            res.render('adminFolder/category', { user2: user2 });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
        res.render('adminFolder/category', { user2: [] });
    }
});

Router.post('/add-category', async (req, res) => {
    try {
        // console.log(req.body);
        const userData = new addCategories({
            c_name: req.body.c_name,
            noOfPosts: req.body.noOfPosts
        });
        // console.log("Api 2");
        const user1 = await addCategories.findOne({ c_name: req.body.c_name });
        if (user1) {
            res.json('this Category already Added');
            return;
        }
        // console.log("Api 3");
        await userData.save();
        // console.log("Api 4");
        const user2 = await addCategories.findOne({ c_name: req.body.c_name });
        if (user2) {
            res.json('work');
            console.log('Data inserted.');
        }
    } catch (error) {
        console.log('Catch Block');
        res.json('not work');
    }
});

// Get the Edit Record of the category
Router.get('/categorySet/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let user = await addCategories.findById(id);

        if (user == null) {
            res.redirect('/dashboard/category');
        } else {
            res.json(user);
        }
    } catch (error) {
        res.redirect('/dashboard/category');
    }
});

// Update user - form submission
Router.post('/category/update/:userId', async (req, res) => {
    try {
        let id = req.params.userId;
        // console.log('Id in Api: ' + id);
        // console.log(req.body);
        // Update the new data in the database
        await addCategories.findByIdAndUpdate(id, {
            c_name: req.body.categoryName
        });

        res.send('Update');
    } catch (error) {
        res.send('Not Update');
        console.log('Not Update');
    }
});

// Delete Category
Router.get('/delete/Category/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // console.log("Id in Api: ", id);
        const user = await addCategories.findById(id);
        if (!user) {
            res.send('Category not found');
            return;
        }

        // Delete the data in the database
        let category = await addCategories.findOneAndRemove({ _id: id });
        let categoryName = category ? category.c_name : null;

        // console.log("categoryName: ",categoryName);
        if (categoryName) {
            await addPosts.deleteMany({ c_name: categoryName });
        }

        res.redirect('/dashboard/category');
        console.log('Delete');
    } catch (error) {
        res.send('Error in deletion');
        console.log('Error in deletion');
    }
});

module.exports = Router;
