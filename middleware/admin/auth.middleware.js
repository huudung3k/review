const jwt = require('jsonwebtoken');
const accountAdminModel = require('../../models/account-admin.model');
const roleModel = require('../../models/role.model');
const { exist } = require('joi');

module.exports.verifyToken = async (req,res,next) => {
  try{
    const token = req.cookies.token;
    if(!token){
      res.redirect(`/${pathAdmin}/account/login`);
      return;
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET); 
    const {id,email} = decoded;
    const existAccount = await accountAdminModel.findOne(
      {
        _id : id,
        email : email,
        status : "active"
      }
    );
    if(!existAccount){
      res.clearCookie("token");
      res.redirect(`/${pathAdmin}/account/login`);
      return;
    }
    const roleDetail = await roleModel.findOne({_id : existAccount.role,deleted : false});
    if(roleDetail){
      req.roleDetail = roleDetail;
      res.locals.roleDetail = roleDetail;
    }
    req.account = existAccount;
    // pug cos the xai duoc
    res.locals.account = existAccount;
    next();
  }
  catch(error){ 
      res.clearCookie("token");
      res.redirect(`/${pathAdmin}/account/login`);
  }
}
module.exports.requireAuth = (permission) => {
  return (req,res,next) => {
    if(!req.roleDetail || !req.roleDetail.permissions.includes(permission)){
      // nếu truy câp theo patch,post,.. thì sẽ chặn, không cho vào controller  và return;
      // !== cho chặt chẽ 
      if(req.method !== "GET"){
        res.json({
          code : "error",
          message : "Tài khoản không có quyền truy cập!"
        });
        return;
      }
      // nếu theo Get thì sẽ render ra error 403 để tránh controller phải truy cập DB lấy dữ liệu và gửi qua front-end
      // nếu ko chặn phương thức get thì nếu có người không có quyền spam vào trang liên tục sẽ gây ra quá tải,
      // truy cập DB và sử lý các logic chỉ để bên front-end ẩn giao diện thì sẽ vô ích, tốn công
      // nên  phải chặn cả phương thức Get
      else{
        res.render("admin/pages/error-403.pug",{
          pageTitle : "403 Forbidden",
        });
        return;
      }
    }
    next();
  }
}