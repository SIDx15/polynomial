const mongoose = require("mongoose")



const logScheme = new mongoose.Schema({
  value: {
    
    type: String,
    required: true,
  },
  date: Date,
  IP:String
  
})

module.exports = mongoose.model("Log", logScheme)
