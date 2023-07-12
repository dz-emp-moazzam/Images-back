const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    c_name:{
        type:String,
        unique:true,
        required:true
    },
    noOfPosts:{
        type:Number
    }
});

// Registeruser is the name of the collection in the database //
module.exports = mongoose.model("Categories" , categorySchema);