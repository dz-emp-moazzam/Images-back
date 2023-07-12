const express = require('express');
const Router = express.Router();
const addUsers = require('./models/addUser');

// Home page
Router.get('/login', (req, res) => {
    console.log(req.session.userRole);
    if (req.session.userRole) {
        // If user is logged in, redirect to users page
        if (req.session.userRole === 'admin') {
            res.redirect('/dashboard/users');
            console.log("Session is decalred. This is Admin");
        }
        else if (req.session.userRole === 'editor') {
            res.redirect('/dashboard/post');
            console.log("Session is decalred. This is Editor");
        }
    }

    console.log("User is not logged")
    res.render('adminFolder/index');
});

// Logout
Router.get('/dashboard/logout', (req, res) => {
    req.session.destroy(); // Destroy session
    res.redirect('/login');
});

// Add user page
Router.get('/dashboard/add-user', (req, res) => {
    if (req.session.userRole) {
        res.render('adminFolder/add-user');
    } else {
        res.redirect('/login');
    }
});

// Update user page
Router.get('/dashboard/update-user', (req, res) => {
    if (req.session.userRole) {
        res.render('adminFolder/update-user');
    } else {
        res.redirect('/login');
    }
});

// Users page
Router.get('/dashboard/users', async (req, res) => {
    if (req.session.userRole) {
        console.log('session lies enter in /admin/users');
        try {
            const user1 = await addUsers.find().exec();
            res.render('adminFolder/users', { user1: user1 });
        } catch (error) {
            console.log(error);
            res.render('adminFolder/users', { user1: [] });
        }
    } else {
        console.log('no session lies enter in /admin/users');
        res.redirect('/login');
    }
});

// Add user - form submission
Router.post('/dashboard/add-user', async (req, res) => {
    if (req.session.userRole) {
        try {
            console.log(req.body);
            const userData = new addUsers({
                email: req.body.email,
                username: req.body.username,
                password: req.body.password,
                role: req.body.role,
            });
            console.log("Api 2");
            const user1 = await addUsers.findOne({ email: req.body.email });
            if (user1) {
                res.send('This user with this email is already inserted.');
                return;
            }
            console.log("Api 3");
            await userData.save();
            console.log("Api 4");
            const user2 = await addUsers.findOne({ email: req.body.email });
            if (user2) {
                res.json('work');
                console.log('Data inserted.');
            }
        } catch (error) {
            console.log('Catch Block');
            res.json('not work');
        }
    } else {
        res.redirect('/login');
    }
});

// Login - form submission
Router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await addUsers.findOne({ email });
        const role = user?.role;
        // console.log("user: " , user);
        if (!user) {
            res.json({ status: 'error' });
            return;
        }

        // Compare the provided password with the stored password
        if (password !== user.password) {
            res.json({ status: 'error' });
            return;
        }

        // Password is valid, user is authenticated
        const userRole = (role === 0) ? "editor" : "admin";
        req.session.userEmail = email;
        req.session.userRole = userRole;
        console.log("req.session.userRole",req.session.userRole);
        res.json({ status: 'success' , userRoleObject: req.session.userRole});
    } catch (error) {
        console.log('Catch Block');
        res.json({ status: 'error' });
    }
});

// Delete user
Router.get('/dashboard/api/delete/:id', async (req, res) => {
    if (req.session.userRole) {
        try {
            const id = req.params.id;
            // Find the user to get the image filename
            const user = await addUsers.findById(id);
            if (!user) {
                res.send('User not found');
                return;
            }

            // Delete the data in the database
            await addUsers.findOneAndRemove({ _id: id });

            res.redirect('/dashboard/users');
            console.log('Delete');
        } catch (error) {
            res.send('Error in deletion');
            console.log('Error in deletion');
        }
    } else {
        res.redirect('/login');
    }
});

// Get the Edit Record of the user
Router.get('/dashboard/api/user/:id', async (req, res) => {
    if (req.session.userRole) {
        try {
            let id = req.params.id;
            let user = await addUsers.findById(id);

            if (user == null) {
                res.redirect('/dashboard/users');
            } else {
                res.json(user);
            }
        } catch (error) {
            res.redirect('/dashboard/users');
        }
    } else {
        res.redirect('/login');
    }
});

// Update user - form submission
Router.post('/dashboard/api/user/:id', async (req, res) => {
    if (req.session.userRole) {
        try {
            let id = req.params.id;
            console.log('Id in Api: ' + id);
            console.log(req.body);
            // Update the new data in the database
            await addUsers.findByIdAndUpdate(id, {
                email: req.body.email1,
                username: req.body.username1,
                role: req.body.role1,
            });

            res.send('Update ');
        } catch (error) {
            res.send('Not Update');
            console.log('Not Update');
        }
    } else {
        res.redirect('/login');
    }
});

module.exports = Router;
