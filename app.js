//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin-mahmoud:mahmoud@cluster0-9nalb.mongodb.net/todolistDB?retryWrites=true&w=majority', {useNewUrlParser: true , useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);
var _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemSchema = new mongoose.Schema({
  name : String
});
const Item = mongoose.model('Item', itemSchema);

const item1 = new Item ({
  name : " Welcome to todolist"
});

const item2 = new Item({
  name : "Hit + button to add a new item"
});

const item3 = new Item ({
  name : "<-- Hit this to delete an item"
});


const defaultItems = [item1 , item2 , item3];

const listSchema = {
  name : String,
  items : [itemSchema]
};
const List = mongoose.model("List" , listSchema);
app.get("/", function(req, res) {
Item.find({} , (err , items)=>{
  if (items.length === 0){
    Item.insertMany(defaultItems ,(err)=>{
      if(err){
        console.log(err);
      }
      else {
        console.log("successfully added items to the DB")
      }
    });
    res.redirect("/")
  }
  else {
  res.render("list" , {listTitle : "Today" , newListItems : items})
}});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
const item = new Item ({
  name : itemName
});
if (listName === "Today"){
  item.save();
  res.redirect("/")
}

else {
  List.findOne({name : listName} , (err , foundList)=>{

  foundList.items.push(item);
  foundList.save();
  res.redirect("/" + listName)


  });
}
});



app.post("/delete" , (req ,res)=>{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

   if (listName === "Today"){
     Item.findByIdAndRemove(checkedItemId, (err)=>{

       if(!err) {
    console.log("Successfully deleted the item");
    res.redirect("/");
  }
});}
  else {
    List.findOneAndUpdate({name : listName} , {$pull : {items :{_id : checkedItemId}}} ,(err , foundList)=>{
      if(!err){
      res.redirect("/" + listName)
    }
    })
  }
});




app.get("/:customListName" , (req , res)=>{
const customListName = _.capitalize(req.params.customListName);

List.findOne({name : customListName} , (err , foundList)=>{
  if(!err){
    if (!foundList){
      const list = new List ({
        name : customListName,
        items : defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
  }
  else {
    res.render("list" , {listTitle : foundList.name , newListItems : foundList.items} )
  }
  }
  else {
    console.log(err)
  }
});

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
