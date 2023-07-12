const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
    p_title:{
        type:String,
        unique:true,
        required:true
    },
    c_name:{
        type:String,
        required:true
    },
    p_date:{
        type:Date,
        required:true,
        default: Date.now
    },
    p_role: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    p_image: {
        type: String,
        required: true
    },
    p_description:{
        type:String
    }
});

// Registeruser is the name of the collection in the database //
module.exports = mongoose.model("posts" , postSchema);