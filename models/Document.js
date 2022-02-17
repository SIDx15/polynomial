const mongoose = require("mongoose")



const documentScheme = new mongoose.Schema({
  value: {
    
    type: String,
    required: true,
  },
  date: Date,
  last: Date,
  access:Number
})

module.exports = mongoose.model("Document", documentScheme)
