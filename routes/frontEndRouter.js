const express = require('express');
const Router = express.Router();
// const addCategories = require('./models/addCategories');
const addPosts = require('./models/addPosts');
// const addUsers = require('./models/addUser');
const { headerCategories, sidebarPosts } = require("../middleWares/frontMiddleWare");
// const paginateResults = require("../middleWares/pagination");

// Use That Middleware //
Router.use(headerCategories);
Router.use(sidebarPosts);

Router.get('/', async (req, res) => {
    const user = await addPosts.find().exec();
    // console.log("User: " , user);
    res.render("index", { user: user });
})

Router.get('/single', async (req, res) => {
    const id = req.query.id;
    const Singleuser = await addPosts.findById(id);
    // console.log("Singleuser: ", Singleuser);
    res.render("single", { row: Singleuser });
})

Router.get('/category', async (req, res) => {
    const categoryName = req.query.c_name;
    const PostofSpecificCategory = await addPosts.find({c_name:categoryName});
    // console.log("PostofSpecificCategory: ", PostofSpecificCategory);
    res.render("category", { user: PostofSpecificCategory });
})


// // usko modify kr do is sey
// Router.get("/category", async (req, res) => {
//   const c_name =req.query.c_name;
//   const currentPage = parseInt(req.query.page) || 1; // Get the current page from the query parameters
//   const pageSize = 10; // Define the number of records per pagec 
//   console.log("currentPage: " , currentPage);
//   console.log("pageSize: " , pageSize);
//   try {
//     const { results, totalPages } = await paginateResults(addPosts, { c_name:c_name }, currentPage, pageSize);
//     console.log("results: " , results);
//     console.log("totalPages: " , totalPages);
//     // res.render('category', {
//     //   user: results,
//     //   totalPages: totalPages,
//     //   currentPage: currentPage
//     // });
//   } catch (error) {
//     res.status(500).json({ error: 'An error occurred while retrieving the records.' });
//   }
// });

Router.get('/author', async (req, res) => {
    const emailOfSpecificPost = req.query.email;
    const PostofSpecificEmail = await addPosts.find({email:emailOfSpecificPost});
    // console.log("PostofSpecificEmail: ", PostofSpecificEmail);
    res.render("author", { user: PostofSpecificEmail });
})

Router.get('/search', async (req, res) => {
    let input = req.query.search;
    const search = await addPosts.find({$or: [{ p_title: { $regex: new RegExp(`.*${input}.*`, 'i') } } , { email: { $regex: new RegExp(`.*${input}.*`, 'i') } }]});
    // console.log("Search Input results:",search);
    res.render("search" , {input:input,user:search});
})

module.exports = Router;
