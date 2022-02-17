const express = require("express")
const app = express()
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
const Log = require("./models/Log")
const Document = require("./models/Document")
const mongoose = require("mongoose")
mongoose.connect("mongodb+srv://notedb:sidmongo@cluster0.jrtkr.mongodb.net/pastebin?retryWrites=true&w=majority", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
})

app.get("/", async(req, res) => {
  const code = `Welcome!!

Use the new commands in the top right corner
to create a new file to share with others.

use display command to view all the code and
get thier links

use change command to either delete or
increase expiry day of a code by one day

use logs command to see which link was accessed 
when`
  let doc = await Document.find()
  var d = new Date()
  d.setDate(d.getDate() - 1)
  //console.log(doc[0]);
  //console.log(d<doc[0].date);
  for(let i=0;i<doc.length;i++)
  {
    
    if(d>doc[i].date)
    {
      //console.log(i);
      Document.deleteOne({_id:doc[i]._id})
      .then(result=>{
        res.status(200).json({
          msg:"deleted",
          result:result
        })
      })
      .catch(err=>{
        res.status(405).json({
          error:err
        })
      })
        
      
    }
  }


  res.render("code-display", { code, language: "plaintext" })
})

app.delete("/", async(req,res)=>{
  let doc = await Document.find()
  var d = new Date()
  d.setDate(d.getDate() - 1)
  for(let i=0;i<doc.length;i++)
  {
    if(d>doc[i].date)
    {
      Document.remove({_id:doc[i]._id})
        
      
    }
  }
})
app.get("/new", (req, res) => {
  res.render("new")
})

/*
app.get("/all",(req,res)=>{
  Document.find()
  .then(result=>{
    res.render("display",{result})
  })
  .catch(err=>{
    res.status(405).json({
      error:err
    })
  })
})
*/
app.get("/all",  function (req, res) {
    //var doc=  Document.find({})
    Document.find({}).sort([['last', -1]]).exec(function(err, data) { 
      if(err) throw err;
      res.render("display", { title: 'Displaying all ', records: data });
     });
    /*
    doc.exec(function(err,data){
      if(err) throw err;
      res.render("display", { title: 'displaying all ', records: data });
    });
    */

})


app.post("/save", async (req, res) => {
  const value = req.body.value
  const date = new Date();
  const last = new Date();
  let access=0;
  try {
    const document = await Document.create({ value ,date,last, access})
    res.redirect(`/${document.id}`)
  } catch (e) {
    res.render("new", { value })
  }
})

app.get("/change",  function (req, res) {
  //var doc=  Document.find({})
  Document.find({}).sort([['last', -1]]).exec(function(err, data) { 
    if(err) throw err;
    res.render("change", { title: 'displaying all ', records: data });
   });
  /*
  doc.exec(function(err,data){
    if(err) throw err;
    res.render("display", { title: 'displaying all ', records: data });
  });
  */

})

app.get("/log",  function (req, res) {
  //var doc=  Document.find({})
  Log.find({}).sort([['date', -1]]).exec(function(err, data) { 
    if(err) throw err;
    res.render("log", { title: 'Displaying all Logs', records: data });
   });
  /*
  doc.exec(function(err,data){
    if(err) throw err;
    res.render("display", { title: 'displaying all ', records: data });
  });
  */

})

app.get('/delete/:id', function(req,res){
  var id = req.params.id;
  console.log(id);
  
  Log.deleteMany({value: id }, function (err, docs) {
    if (err){
        console.log(err)
    }
    else{
        console.log("Deleted User : ", docs);
    }
});

  
  var doc = Document.findByIdAndDelete(id);
  doc.exec(function(err){
    if(err) throw err;
    res.redirect("/change");
  });
  
});

app.get('/edit/:id', function(req,res){
  var id = req.params.id;
  console.log(id);
  
  var doc = Document.findById(id);
  Document.updateOne({
    _id: id
}, {
    $set: {
        
        date : new Date()
    },
})
.then(() => {
        
})
.catch((err) => {
    console.log(err);
});
res.redirect("/change");
  
});



app.get("/:id/duplicate", async (req, res) => {
  const id = req.params.id

  try {
    const document = await Document.findById(id)
    const n=document.access+1;
    Document.updateOne({
      _id: id
  }, {
      $set: {
          access: n
      },
  })
  .then(() => {
          
  })
  .catch((err) => {
      console.log(err);
  });

    res.render("new", { value: document.value })
  } catch (e) {
    res.redirect(`/${id}`)
  }
})

/*
app.get("/:id", async (req, res) => {
  const id = req.params.id
  try {
    const document = await Document.findById(id)
    const n=document.access+1;
    Document.updateOne({
      _id: id
  }, {
      $set: {
          access: n,
          last : new Date()
      },
  })
  .then(() => {
          
  })
  .catch((err) => {
      console.log(err);
  });
    
    res.render("code-display", { code: document.value, id })
  } catch (e) {
    res.redirect("/")
  }
})
*/

app.get("/:id", async (req, res) => {
  const value= req.params.id;
  var IP= req.ip;
  console.log(req.ip);
  const date = new Date();
  const id = req.params.id
  try {
    const document = await Document.findById(id)
    const n=document.access+1;
    Document.updateOne({
      _id: id
  }, {
      $set: {
          access: n,
          last : new Date()
      },
  })
  .then(() => {
          
  })
  .catch((err) => {
      console.log(err);
  });
    const log = await Log.create({ value ,date,IP})
    res.render("code-display", { code: document.value, id })
  } catch (e) {
    res.redirect("/")
  }
})



app.listen(3000)
