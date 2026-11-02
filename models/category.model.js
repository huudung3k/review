const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
// nhúng slug vào mongoose
mongoose.plugin(slug);

const schema = new mongoose.Schema({
  name : String,
  parent : String,
  position : Number,
  status : String,
  avatar : String,
  description : String,
  createdBy : String,
  updatedBy : String,
  slug : {
    type : String,
    slug : "name",
    unique : true
  },
  deleted : {
    type : Boolean,
    default : false
  },
  deletedBy : String,
  deletedAt : Date
  },
  {
    timestamps : true
  });
const category = mongoose.model('category',schema,'categories');

module.exports = category;