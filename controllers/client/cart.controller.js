module.exports.cart = (req,res) => {
  res.render('client/pages/cart.pug',{
    pageTitle: "Cart"
  });
}
