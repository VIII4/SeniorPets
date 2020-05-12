require("dotenv").config();
var express = require("express");
var exphbs = require("express-handlebars");

var db = require("./models");
var seniorSeed = require("./seeders/seniorSeed");
var taskSeed = require("./seeders/taskSeed");

var app = express();
var PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Routes
require("./routes/task-api-routes")(app);
require("./routes/volunteer-api-routes")(app);
require("./routes/htmlRoutes")(app);

var syncOptions = { force: false };

if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(function() {
  //Destroy then Seed Seniors
  db.Senior.destroy({
    where: {},
    truncate: true
  }).then(function() {
    db.Senior.bulkCreate(seniorSeed);
  });

  //TESTING ONLY
  if (process.env.HB_TEST_ENV === "true") {
    db.Task.destroy({
      where: {},
      truncate: true
    }).then(function() {
      db.Task.bulkCreate(taskSeed);
    });
  }
  //TESTING ONLY REMOVE BEFORE COMMIT

  app.listen(PORT, function() {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });
});

module.exports = app;
