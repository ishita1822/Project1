var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
const tokenPromise = require("./token.js")
var morgan = require("morgan");
var ejs = require("ejs");
var zlib = require("zlib");
const { createProxyMiddleware } = require("http-proxy-middleware");
const lodash = require("lodash");

var lst;
const test = [{
  id: 1,
  name: "Binita Soni",
  username: "BiniSni",
  email: "bini@april.biz",
  address: {
    street: "K Lame",
    suite: "Apt. 5343",
    city: "Gwenborough",
    zipcode: "92998-38776674",
    geo: {
      lat: "-37.3434",
      lng: "91.1496"
    }
  },
  phone: "1-770-736-5677 x56442",
  website: "binitasoni.org",
  company: {
    name: "BSONI",
    catchPhrase: "Multi-layered client-server neural-net",
    bs: "harness real-time e-markets"
  }
}];


var app = express();

app.set("port", 4000); // set our application port
app.set("view engine", "ejs");

// set morgan to log info about our requests for development use.
app.use(morgan("dev"));

// initialize body-parser to parse incoming parameters requests to req.body
// generally use to get form values which is coming
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
// initialize cookie-parser to allow us access the cookies stored in the browser.
app.use(cookieParser());
// app.use(createProxyMiddleware(options));

// initialize express-session to allow us track the logged-in user across sessions.
app.use(
  session({
    key: "ses_id",
    secret: "somerandonstuffs",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 4 * 60 * 60 * 1000,
    },
  })
);

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie("user_sid");
    res.clearCookie("ses_id");
  }
  next();
});

// middleware function to check for logged-in users
// whenever we make anysort of request to our nodeJS server these middleware will be executed first
var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.render("dashboard");
  } else {
    next();
  }
};

// route for Home-Page
// sessionChecker will execute every time when ever we open the home route
// it will 1st check if user has signed in or not
app.get("/", sessionChecker, (req, res) => {
  res.render("login");
});

// route for user Login
app
  .route("/login")
  .get(sessionChecker, (req, res) => {
    // res.sendFile(__dirname + "/public/login.html");
    res.render("login");
  })
  .post(async (req, res) => {
    const { username, password } = req.body;
    try {
      if (username == 'admin@email.com' && password == "admin") {
        tokenPromise.getNewTokenPromise().then(
          (data) => {
            res.cookie("user_sid", data, {
              maxAge: 4 * 60 * 60 * 1000,
              httpOnly: true,
            });
            req.session.user = { username: username, password: password };
            res.render("dashboard");
          }
        ).catch(err => console.error(err));
      }
      else {
        res.render("login");
      }
    } catch (error) {
      console.log(error);
    }
  });

// route for user's dashboard
app.get("/dashboard", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    // res.sendFile(__dirname + "/public/dashboard.html");
    res.render("dashboard");
  } else {
    // res.redirect("/login");
    res.render("login");
  }
});

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://jsonplaceholder.typicode.com",
    changeOrigin: true,
    selfHandleResponse: true,
    pathRewrite: {
      "^/api/users": "/users",
      // "^/api/comments": "/comments",
      // "^/api/albums": "/albums",
      // "^/api/photos": "/photos",
      // "^/api/todos": "/todos",
    },
    onProxyRes: function onProxyRes(proxyRes, req, res) {
      if (req.method == 'GET' && req._parsedUrl.pathname == '/api/users') {
        //   if (proxyRes.headers["content-encoding"]) {
        //     res.setHeader("content-encoding", proxyRes.headers["content-encoding"]);  
        //   }
        //   proxyRes.on("data", function (data) {
        //     res.write(data);
        //   });
        //   proxyRes.on("end", function () {
        //     res.end();
        //   });
        // }else{
        //   res.end();
        var body = Buffer.from("");
        proxyRes.on('data', function (data) {
          lst = data;
          body = Buffer.concat([body, data]);
        });
        proxyRes.on('end', function () {
          const bodyString = zlib.gunzipSync(body);
          lst = JSON.parse(bodyString)
          lst = lodash.assign(lst, test);
          res.redirect("/table");
        });
      } else {
        res.end("Sorry Not For Interception");
      }
    },
  })
);

app.get("/table", (req, res) => {
  res.render("table", { lst });
});

// route for user logout
app.get("/logout", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.clearCookie("user_sid");
    res.clearCookie("ses_id");
    res.redirect("/");
  } else {
    res.render("login");
  }
});

// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!");
});

// start the express server
app.listen(app.get("port"), () =>
  console.log(`App started on port ${app.get("port")}`)
);
