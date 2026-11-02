const AccountAdminModel = require('../../models/account-admin.model');
const bcrypt = require('bcryptjs');

module.exports.profileEdit = async  (req,res) => {
  const accountAdminDetail = await AccountAdminModel.findOne({_id : req.account.id});
  res.render('admin/pages/profile-edit.pug',{
    pageTitle : "Profilem edit",
    accountAdminDetail : accountAdminDetail
  })
}
module.exports.profileEditPatch = async  (req,res) => {
  try{
    console.log(req.body)
    if(req.file){
      req.body.avatar = req.file.path;
    }
    else delete req.body.avatar
    await AccountAdminModel.updateOne({_id : req.account.id, deleted : false},req.body);
    req.flash('success',"Cập nhập thành công");
    res.json({code : "success"});
  }
  catch(error){
    res.json({code :"error",message : "Tài khoản không tồn tại, vui lòng làm mới trang"})
  }
}
module.exports.changePassword = (req,res) => {
  res.render('admin/pages/profile-change-password.pug',{
    pageTitle : "Profile edit"
  })
}
module.exports.changePasswordPatch = async (req,res) => {
  try{
    const {password} = req.body;
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(password, salt);
    req.body.updatedBy = req.account.id;
    await AccountAdminModel.updateOne({_id : req.account.id, deleted : false},{password : hashedPassword});
    req.flash('success',"Cập nhập mật khẩu thành công");
    res.json({
      code : "success"
    })
  }
  catch(error){
    res.json({
      code : "error",
      message : "Tài khoản không tồn tại "
    })
  }

}