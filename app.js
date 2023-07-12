// nodemon app.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRouter");
const postRouter = require("./routes/postRouter");
const categoryRouter = require("./routes/categoryRouter");
const frontEndRouter = require("./routes/frontEndRouter");

const MongoUrl = "mongodb://localhost:27017/blog";

const app = express();
const port = process.env.PORT || 4200;

// Database Connection
mongoose.connect(MongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on("error", () => {
  console.log("Error occurred in db connection");
});
db.once("open", () => {
  console.log("Connected");
});

// Set view engine and static files directory
app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + "/public"));

// Parse incoming requests with urlencoded and json bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session middleware
const oneHour = 1000 * 60 * 60;
app.use(
  session({
    secret: "thisismysecrectkey",
    saveUninitialized: true,
    cookie: { maxAge: oneHour },
    resave: false
  })
);

// Cookie parser middleware
app.use(cookieParser());

// Middleware function to add session variables to response locals
app.use((req, res, next) => {
  res.locals.userRole = req.session.userRole;
  res.locals.userEmail = req.session.userEmail
  next();
});

// app.use((req, res, next) => {
//   req.session.userid = req.body.email; // Set the session ID to the email field or any desired value
//   next();
// });

app.use((req, res, next) => {
  const allowedRoutes = [
    '/dashboard/post',
    '/dashboard/addPost',
    '/dashboard/add-post',
    '/dashboard/update-post/:id',
    '/dashboard/update-post',
    '/dashboard/deletePost/:id',
    '/login',
    '/dashboard/logout',
    '/'
  ];

  const isEditor = req.session.userRole === 'editor';
  const isUpdatePostPage = req.path.startsWith('/dashboard/update-post/');
  const isDeletePostPage = req.path.startsWith('/dashboard/deletePost/');

  if (isEditor && !allowedRoutes.includes(req.path) && !isUpdatePostPage && !isDeletePostPage) {
    res.redirect('/404');
  } else {
    next();
  }
});

// Run Route Files APIs
app.use("/", userRouter);
app.use("/dashboard", postRouter);
app.use("/dashboard", categoryRouter);
app.use("/", frontEndRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
