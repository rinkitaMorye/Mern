require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const app = express();
let TaskArr = [];
let Arr = [];
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rinkita:Test=123@atlascluster.osgbnds.mongodb.net/todoListdb", {
  useNewUrlParser: true,
});

const itemSchema = new mongoose.Schema({
  name: String,
});

const taskList = mongoose.model("taskList", itemSchema);

const task1 = new taskList({
  name: "Start Writing",
});

const task2 = new taskList({
  name: "Start Coding",
});

const task3 = new taskList({
  name: "Deep Work",
});
TaskArr = [task1, task2, task3];
taskList.insertMany(TaskArr);


const listSchema = new mongoose.Schema({
    name:String,
    items:[itemSchema]
});

const list  = mongoose.model("List",listSchema);

app.get("/:customListName",function(req,res){
    const customListName= _.capitalize(req.params.customListName);
    list
    .findOne({name:customListName}).then((foundItems) => {
      if (!foundItems) {
            const list_item = new list({
                    name:customListName,
                    items: TaskArr
                });
                list_item.save().then(console.log("Successfully added list"));

                res.redirect("/"+ customListName);
      } else {
            console.log("Already Exist");
            res.render("list",{ListTitle:foundItems.name,taskList:foundItems.items});
      }
    })
    .catch((error) => {
      console.error(error);
    });
});
app.get("/", function (req, res) {
  let day = date.getDate();
  taskList
    .find({})
    .exec()
    .then((foundItems) => {
      if (foundItems.length === 0) {
        taskList
          .insertMany(TaskArr)
          .then(() => {
            console.log("Succesfully saved TaskArr to DB.");
          })
          .catch((error) => {
            console.error("There was an error inserting into DB: ", error);
          });
        res.render("list", { ListTitle: "ToDay", taskList: foundItems });
      } else {
        res.render("list", { ListTitle: "ToDay", taskList: foundItems }); 
      }
    })
    .catch((error) => {
      console.error(error);
    });
});

app.post("/", function (req, res) {
  let task = req.body.task;
  let listType=req.body.listType;
  const item = new taskList({
    name:task
  });

  if(listType==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    list.findOne({name:listType}).then((foundItems)=>{
      foundItems.items.push(item);
      foundItems.save();
      res.redirect("/"+listType);
    });
  }
});
app.post("/delete", function (req, res) {
    const checkedItemId = req.body.CheckBox;
    const deleteFromList = req.body.deletefromList;
    if(deleteFromList==="ToDay")
    {
      if(checkedItemId != undefined){
      taskList.findByIdAndRemove(checkedItemId)
      .then(()=>console.log(`Deleted ${checkedItemId} Successfully`))
      .catch((err) => console.log("Deletion Error: " + err));
      res.redirect("/");
      }
    }
    else{
      list.findOneAndUpdate({name:deleteFromList},{$pull:{items:{_id:checkedItemId}}})
      .then(()=>{
        console.log("Item deleted successfully");
        res.redirect("/"+deleteFromList);
      })
      .catch((err)=>console.error("Error while deleting"+err));
    }
  });

app.get("/work", function (req, res) {
  res.render("list", { ListTitle: "Work List", taskList: workList });
});

app.get("/about", function (req, res) {
  res.render("about");
});

// let port = process.env.PORT;
// console.log(port);
// if(port==null || port == "")
// {
//   port=3000;
// }

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server started on port"+port);
});
