const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

//requiring a module inside the directory

const date = require(__dirname + "/date.js");

const app = express();
// using mongoose to store data in the database
const url =
  "mongodb+srv://admin-akshat:hello123@cluster0.fl9ev.mongodb.net/todolist";

mongoose.connect(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
});
//to initialize the schema of the item
const itemSchema = mongoose.Schema({
  name: String,
});

const listSchema = mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

// let items = ["Buy Food", "Cook Food"];
// let workItems = [];

const item1 = new Item({ name: "This is to-do list app" });
const item2 = new Item({ name: "Testing the mongoose model" });

const defaultArray = [item1, item2];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");
//calling the func from date module
const day = date.getDate();

app.get("/", (req, res) => {
  // to render the list.ejs in the browser
  //while providing the data to the variables
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      // to only add if the database is empty
      Item.insertMany(defaultArray, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Success");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems,
      });
    }
  });
});

app.post("/", (req, res) => {
  const item = req.body.data;
  const listName = req.body.list;
  const itemName = new Item({ name: item });

  if (listName === "Today") {
    itemName.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(itemName);
      foundList.save();
      res.redirect(`/${listName}`);
    });
  }

  // if (req.body.list == "Work") {
  //   // send to work list
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   //Creating an empty array in the beginning

  //   items.push(item);

  // }
});

// app.get("/work", (req, res) => {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems,
//   });
// });

app.post("/delete", (req, res) => {
  //to delete and item from the database and then redirecting it to the home route.
  const itemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(itemID, (err) => {
      if (!err) {
        console.log("Deleted successfully");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: itemID } } },
      (err, foundList) => {
        if (!err) {
          res.redirect(`/${listName}`);
        }
      }
    );
  }
});

app.post("/work", (req, res) => {
  let item = req.body.data;

  workItems.push(item);
  res.redirect("/work");
});

app.get("/about", (req, res) => {
  res.render("about");
});
// to create new list
app.get("/:name", (req, res) => {
  const listName = _.capitalize(req.params.name);
  List.findOne({ name: listName }, (err, foundList) => {
    if (!err) {
      // if list doesn't exist
      if (!foundList) {
        const list = new List({
          name: listName,
          items: defaultArray,
        });
        list.save();
        res.redirect("/");
      } else {
        //if list does exist
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});
app.listen(3000, () => {
  console.log("Server started at 3000");
});
