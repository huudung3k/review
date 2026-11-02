const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

const schema = new mongoose.Schema({
  name : String,
  category : String,
  position : Number,
  status : String,
  avatar : String,
  priceAdult : Number,
  priceChildren : Number,
  priceBaby : Number,
  priceNewAdult : Number,
  priceNewChildren : Number,
  priceNewBaby : Number,
  stockAdult : Number,
  stockChildren : Number,
  stockBaby : Number,
  locations : Array,
  time : String,
  vehicle : String,
  departureDate : Date,
  information : String,
  schedules : Array,
  createdBy : String,
  updatedBy : String,
  slug : {
    type : String,
    slug : "name",
    unique : true
  },
  deletedBy : String,
  deletedAt : Date,
  deleted : {
    type : Boolean,
    default : false
  }
},
  {
    timestamps : true
  }
);

// 'Tour là biến chứa dữ liệu',
// khi gọi new Tour(a) thì sẽ tự coi 'Tour' là 
const Tour = mongoose.model('Tour',schema,'tours');
// export tour ra, khi xài chỉ cần new tour 
module.exports = Tour;