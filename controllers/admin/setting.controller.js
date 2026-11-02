const websiteInfoModel = require('../../models/website-info.model');
const AccountAdminModel = require('../../models/account-admin.model');
const permissionConfig = require('../../config/permission');
const roleModel = require('../../models/role.model');
const bcrypt = require('bcryptjs');
const moment = require('moment');
module.exports.list = (req,res) => {
  res.render('admin/pages/setting-list.pug',{
    pageTitle : "Setting"
  })
}
module.exports.websiteInfo = async (req,res) => {
  const websiteInfo = await websiteInfoModel.findOne({});
  
  res.render('admin/pages/setting-website-info.pug',{
    pageTitle : "Website infor",
    websiteInfo : websiteInfo
  })
}
module.exports.websiteInfoPatch = async(req,res) => {
  if(req.files && req.files.logo){
    req.body.logo = req.files.logo[0].path;
  }
  else{
    delete req.body.logo;
  }
  if(req.files && req.files.favicon){
    req.body.favicon = req.files.favicon[0].path;
  }
  else{
    delete req.body.favicon;
  }
  await websiteInfoModel.updateOne({},req.body);
  req.flash('success',"Cập nhập thành công");
  res.json({code : 'success'});
}
module.exports.acountAdminList = async (req,res) => {
  const filterAccountAdmin = {
    deleted : false
  }
  if(req.query.status){
    filterAccountAdmin.status = req.query.status;
  }
  const createdAt = {};
  if(req.query.startDate){
    createdAt.$gte = moment(req.query.startDate).startOf('date').toDate();
  }
  if(req.query.endDate){
    createdAt.$lte = moment(req.query.endDate).startOf('date').toDate();
  }
  if(Object.keys(createdAt).length > 0){
    filterAccountAdmin.createdAt = createdAt;
  }
  if(req.query.role){
    filterAccountAdmin.role = req.query.role;
  }
  if(req.query.keyword){
    filterAccountAdmin.fullName = new RegExp(req.query.keyword,'i');
  }
  const totalRecord = await AccountAdminModel.countDocuments(filterAccountAdmin);
  const limitRecord = process.env.LIMIT_ACCOUNT_LIST;
  const limitPage = Math.ceil(totalRecord / limitRecord);
  let page = 1;
  if(req.query.page){
    pageParseInt = parseInt(req.query.page);
    if(pageParseInt > 0){
      page = pageParseInt;
    }
    if(page > limitPage & limitPage > 0){
      page = limitPage;
    }
  }
  const skip = (page - 1) * limitRecord;
  const pagination = {
    totalRecord,
    limitPage,
    skip
  }
  const roleList = await roleModel.find({deleted : false});
  const AccountAdminList = await AccountAdminModel.find(filterAccountAdmin).limit(limitRecord).skip(skip).sort({createdAt : "desc"});
  for(const item of AccountAdminList){
    if(item.role){
      const roleDetail = await roleModel.findOne({_id : item.role});
      if(roleDetail){
        item.nameRole = roleDetail.name;
      }
    }
  }
  res.render('admin/pages/setting-account-admin-list.pug',{
    pageTitle : "Setting account",
    AccountAdminList : AccountAdminList,
    roleList : roleList,
    pagination : pagination
  })
}
module.exports.acountAdminChangeMultiPatch = async (req,res) => {
  try{
    const {option , ids} = req.body;
    switch(option){
      case "active":
      case "inactive":
        if(!req.roleDetail.permissions.includes('account-admin-edit')){
          res.json({
            code : "error",
            message : "Tài khoảng không có quyền truy cập !"
          });
          return;
        }
        await AccountAdminModel.updateMany({_id : {$in : ids},deleted : false},{status : option});
        req.flash('success','Cập nhật thành công');
        res.json({code : 'success'});
        break;
      case "delete" :
        if(!req.roleDetail.permissions.includes('account-admin-delete')){
          res.json({
            code : "error",
            message : "Tài khoảng không có quyền truy cập !"
          });
          return;
        }
        await AccountAdminModel.updateMany({_id : {$in : ids},deleted : false},{deleted : true});
        req.flash('success','Đã chuyển vào thùng rác');
        res.json({code : 'success'});
        break;
      default:
        res.json({
          code : 'error',
          message : "Hành động không tồn tại !"
        })
    }
  }
  catch(error){
    res.json({
      code : "error",
      message : "Danh mục không tồn tại !"
    })
  }
}
module.exports.acountAdminChangeTrashMultiPatch = async (req,res) => {
  try{
    const {option , ids} = req.body;
    switch(option){
      case "undo":
        await AccountAdminModel.updateMany({_id : {$in : ids},deleted : true},{deleted : false});
        req.flash('success','Khôi phục thành công');
        res.json({code : 'success'});
        break;
      case "delete-destroy" :
        await AccountAdminModel.deleteMany({_id : {$in : ids},deleted : true});
        req.flash('success','Đã xóa thành công');
        res.json({code : 'success'});
        break;
      default:
        res.json({
          code : 'error',
          message : "Hành động không tồn tại !"
        })
    }
  }
  catch(error){
    res.json({
      code : "error",
      message : "Danh mục không tồn tại !"
    })
  }
}
module.exports.acountAdminCreate = async (req,res) => {
  const roleList = await roleModel.find({deleted : false});
  res.render('admin/pages/setting-account-admin-create.pug',{
    pageTitle : "Setting account",
    roleList : roleList,
    
  })
}
module.exports.acountAdminCreatePost = async (req,res) => {
  const existAccount = await AccountAdminModel.findOne({email : req.body.email});
  if(existAccount){
    res.json({
      code : "error",
      message : "Email đã tồn tại !"
    });
    return;
  }
  req.body.avatar = req.file ? req.file.path : "";
  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password,salt);
  req.body.password = hashedPassword;
  const newRecord = new AccountAdminModel(req.body);
  await newRecord.save();
  req.flash('success',"Tạo thành công ");
  res.json({code : 'success'});
}

module.exports.acountAdminEdit = async (req,res) => {
  try{
    const id = req.params.id;
    const accountDetail = await AccountAdminModel.findOne({_id : id, deleted : false});
    const roleList = await roleModel.find({deleted: false});
    res.render('admin/pages/setting-account-admin-edit.pug',{
      pageTitle : "Setting account",
      roleList : roleList,
      accountDetail : accountDetail
    })
  }
  catch(error){
    res.redirect(`/${pathAdmin}/setting/account-admin/list`);
  }
}
module.exports.acountAdminEditPatch = async (req,res) => {
  try{
    const id = req.params.id;
    if(req.file){
      req.body.avatar = req.file.path;
    }
    else delete req.body.avatar;
    if(req.body.password){
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password,salt);
      req.body.password = hashedPassword;
    }
    req.body.updatedBy = req.account.id;
    await AccountAdminModel.updateOne({_id : id, deleted : false},req.body);
    req.flash('success',"Cập nhập thành công");
    res.json({
      code : "success"
    });
  }
  catch(error){
    res.json({
      code : "error",
      message : "Lỗi cập nhập !"
    });
  }
}
module.exports.acountAdminDeletePatch = async (req,res) => {
  try{
    const id = req.params.id;
    await AccountAdminModel.updateOne({_id : id, deleted : false},{deleted : true, deletedBy : req.account.id,deletedAt : Date.now()});
    req.flash('success',"Đã thêm vào thùng rác");
    res.json({
      code : "success"
    });
  }
  catch(error){
    res.json({
      code : "error",
      message : "Bản ghi không tồn tại !"
    });
  }
}
module.exports.acountAdminUndoPatch = async (req,res) => {
  try{
    const id = req.params.id;
    await AccountAdminModel.updateOne({_id : id, deleted : true},{deleted : false});
    req.flash('success',"Đã khôi phục");
    res.json({
      code : "success"
    });
  }
  catch(error){
    res.json({
      code : "error",
      message : "Bản ghi không tồn tại !"
    });
  }
}
module.exports.acountAdminDeleteDestroyPatch = async (req,res) => {
  try{
    const id = req.params.id;
    await AccountAdminModel.deleteOne({_id : id, deleted :true});
    req.flash('success',"Xóa thành công");
    res.json({
      code : "success"
    });
  }
  catch(error){
    res.json({
      code : "error",
      message : "Bản ghi không tồn tại !"
    });
  }
}
module.exports.acountAdminEditPatch = async (req,res) => {
  try{
    const id = req.params.id;
    if(req.file){
      req.body.avatar = req.file.path;
    }
    else delete req.body.avatar;
    if(req.body.password){
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password,salt);
      req.body.password = hashedPassword;
    }
    req.body.updatedBy = req.account.id;
    await AccountAdminModel.updateOne({_id : id, deleted : false},req.body);
    req.flash('success',"Cập nhập thành công");
    res.json({
      code : "success"
    });
  }
  catch(error){
    res.json({
      code : "error",
      message : "Lỗi cập nhập !"
    });
  }
}
module.exports.roleList = async (req,res) => {
  const roleFilter = {
    deleted : false,
  }
  if(req.query.keyword){
    roleFilter.name = new RegExp(req.query.keyword,"i");
  }
  const roleList = await roleModel.find(roleFilter);
  res.render('admin/pages/setting-role-list.pug',{
    pageTitle : "Setting role",
    roleList : roleList
  })
}
module.exports.roleCreate = (req,res) => {
  res.render('admin/pages/setting-role-create.pug',{
    pageTitle : "Setting role",
    permissionList : permissionConfig.permissionList
  })
}
module.exports.roleCreatePost = async (req,res) => {
  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  const newRecord = new roleModel(req.body);
  await newRecord.save();
  req.flash('success',"Tạo thành công");
  res.json({
    code : 'success'
  })
}
module.exports.roleChangeMultiPatch = async (req,res) => {
  try{
    const {option,ids} = req.body;
    switch(option){
      case "delete" :
        await roleModel.updateMany({_id : {$in : ids}, deleted : false},{deleted : true,deletedBy : req.account.id,deletedAt: Date.now()})  
        req.flash('success',"Đã chuyển vào thùng rác");
        res.json({code : "success"});
        break;
      default:
        res.json({code : "error",message : "Hành động không tồn tại !"});
        break;
    }
  }
  catch(error){
    res.json({
      code : "error",
      message : "Bảng ghi không tồn tại !"
    })
  }
}
module.exports.roleDelete = async(req,res) => {
  console.log('aaa');
  try{
    const id = req.params.id;
    await roleModel.updateOne({_id : id,deleted :false},{deleted : true,deletedBy : req.account.id,deletedAt: Date.now()});
    req.flash('success',"Đã chuyển vào thùng rác");
    res.json({
      code : 'success'
    });
  }
  catch(error){
    res.json({
      code : "error",
      message : "Bản ghi không tồn tại !"
    })
  }
}

module.exports.roleEdit = async (req,res) => {
  try{
    const id = req.params.id;
    const role = await roleModel.findOne({_id : id,deleted: false});
    res.render('admin/pages/setting-role-edit.pug',{
      pageTitle : "Setting role",
      permissionList : permissionConfig.permissionList,
      role : role
    })
  } catch(error){
    res.redirect(`/${pathAdmin}/setting/role/list`)
  }
}
module.exports.roleEditPatch = async (req,res) => {
  try{
    const id = req.params.id;
    req.body.updatedBy = req.account.id;
    await roleModel.updateOne({_id :id, deleted : false},req.body);
    req.flash("success","Cập nhật thành công");
    res.json({
      code : "success"
    })
  } catch(error){
      res.json({
      code : "error",
      message : "Bản ghi không tồn tại !"
    })
  }
}
module.exports.acountAdminTrash = async (req,res) => {
  const filterAccountAdmin = {
    deleted : true
  }
  if(req.query.keyword){
    filterAccountAdmin.fullName = new RegExp(req.query.keyword,'i');
  }
  const limitRecord = process.env.LIMIT_ACCOUNT_LIST;
  const totalRecord = await AccountAdminModel.countDocuments(filterAccountAdmin);
  const limitPage = Math.ceil(totalRecord / limitRecord);
  let page = 1;
  if(req.query.page){
    const pageParseInt = parseInt(req.query.page);
    if(pageParseInt > 0){
      page = pageParseInt;
    }
    if(page > limitPage && limitPage > 0){
      page = limitPage;
    }
  }
  const skip = (page - 1) * limitRecord;
  const pagination = {
    totalRecord,
    skip,
    limitPage
  }
  const AccountAdminList = await AccountAdminModel.find(filterAccountAdmin).limit(limitRecord).skip(skip);
  for(const item of AccountAdminList){
    if(item.role){
      const roleDetail = await roleModel.findOne({_id : item.role});
      if(roleDetail){
        item.nameRole = roleDetail.name;
      }
    }
  }
  res.render('admin/pages/setting-account-admin-trash.pug',{
    pageTitle : "Trash",
    AccountAdminList : AccountAdminList,
    pagination : pagination
  })
}