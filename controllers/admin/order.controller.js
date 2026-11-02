module.exports.list = (req,res) => {
  res.render('admin/pages/order-list.pug',{
    pageTitle : "Order list"
  })
}
module.exports.edit = (req,res) => {
  res.render('admin/pages/order-edit.pug',{
    pageTitle : "Order edit"
  })
}
