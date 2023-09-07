const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const categories = require("./routes/categoryRoutes");

const MongoUrl = "mongodb+srv://amirrafay135:XyImBf1YGtzacNcK@blogcluster.drny97g.mongodb.net/deploye?retryWrites=true&w=majority";

const app = express();
const port = 4000;

// Database Connection
mongoose.connect(MongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on("error", () => {
  console.log("Error occurred in db connection");
});
db.once("open", () => {
  console.log("Connected");
});

// app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + "/public"));

// Parse incoming requests with urlencoded and json bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// Run Route Files APIs
app.use("/category", categories);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
