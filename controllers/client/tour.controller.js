const Tour = require('../../models/tour.model');

module.exports.list = (req, res) => {
  res.render("client/pages/tour-list",{
    pageTitle : "Tour list"
  })
};
module.exports.detail = (req, res) => {
  res.render("client/pages/tour-detail.pug",{
    pageTitle : "Tour Detail"
  })
};