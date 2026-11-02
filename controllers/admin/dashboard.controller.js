const authMiddleWare = require('../../middleware/admin/auth.middleware.js');


module.exports.dashboard = (req,res) => {
  res.render('admin/pages/dashboard.pug',{
    pageTitle : "Dashboard"
  })
}
