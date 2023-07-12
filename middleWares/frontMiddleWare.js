const addCategories = require('../routes/models/addCategories');
const addPosts = require('../routes/models/addPosts');

const headerCategories = async (req, res, next) => {
    try {
        const categories = await addCategories.find();
        console.log(categories);
        res.locals.Hcategories = categories;
        next();
    }
    catch (err) {
        console.log("Error in header middleware: " + err.message);
    }
};

const sidebarPosts = async (req, res, next) => {
    try {
        const posts = await addPosts.find().sort({ p_date: -1 }).limit(3);
        console.log(posts);
        res.locals.Sposts = posts;
        next();
    }
    catch (err) {
        console.log("Error in Sidebar middleware: " + err.message);
    }
};

module.exports =  {
    headerCategories,
    sidebarPosts
}