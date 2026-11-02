const mongoose = require('mongoose');

const shema = new mongoose.Schema({
  websiteName : String,
  phone : String,
  email : String,
  address : String,
  logo : String,
  favicon : String,
});

const WebsiteInfo = mongoose.model('WebsiteInfo',shema,'setting-website-info');
module.exports = WebsiteInfo;