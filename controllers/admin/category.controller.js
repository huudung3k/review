const categoryModel = require('../../models/category.model');
const accountAdminModel = require('../../models/account-admin.model');
const categoryTreeHelper = require('../../helpers/categoryTree.helper');
const moment = require('moment');
const slugify = require('slugify');

module.exports.list = async (req,res) => {
  const categoryFilter = {
    deleted : false
  }
  const createdAt = {};
  if(req.query.status){
    categoryFilter.status = req.query.status;
  }
  if(req.query.createdBy){
    categoryFilter.createdBy = req.query.createdBy;
  }
  if(req.query.startDate){
    createdAt.$gte = moment(req.query.startDate).startOf('date').toDate();
  }
  if(req.query.endDate){
    createdAt.$lte = moment(req.query.endDate).startOf('date').toDate();
  }
  if(Object.keys(createdAt).length > 0){
    categoryFilter.createdAt = createdAt;
  }
  if(req.query.keyword){
    // chuyển sang slug với thuộc tính là chữ thường
    const keyWordFormat = slugify(req.query.keyword,{lower : true});
    // chuyển sang regexp với /chuỗi/ thì khi tìm kiếm mongo sẽ tự tìm  trường có chứa  
    categoryFilter.slug = new RegExp(keyWordFormat);
  }
  // pagination
  const  totalRecord = await categoryModel.countDocuments(categoryFilter);
  const limitItem = process.env.LIMIT_PAGE_LIST;
  const limitPage = Math.ceil(totalRecord/limitItem);
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
  const skip = (page - 1) * limitItem;
  const pagination = {
    limitPage : limitPage,
    totalRecord : totalRecord,
    skip : skip
  }
  const  accountAdminList = await accountAdminModel.find({}).select("fullName");
  const categoryList = await categoryModel.find(categoryFilter).sort({position : "desc"}).limit(limitItem).skip(skip);
  for(const item of categoryList){
    const createdByFullName = await accountAdminModel.findOne({ _id : item.createdBy});
    if(createdByFullName){
      item.createdByFullName = createdByFullName.fullName;
    }
    else{
      item.createdByFullName = "";
    }
    item.createdAtFormat = moment(item.createdAt).format('HH:mm - DD/MM/YYYY');
  }
  for(const item of categoryList){
    const updatedByFullName = await accountAdminModel.findOne({ _id : item.updatedBy})
    if(updatedByFullName){
      item.updatedByFullName = updatedByFullName.fullName;
    }
    else{
      item.updatedByFullName = "";
    }
    item.updatedAtFormat = moment(item.updatedAt).format('HH:mm - DD/MM/YYYY');

  }
  res.render('admin/pages/category-list.pug',{
    pageTitle : "Category list",
    categoryList: categoryList,
    accountAdminList: accountAdminList,
    pagination : pagination
  })
  
}

module.exports.create = async (req,res) => {
  const categoryList = await  categoryModel.find({deleted : false});
  categoryTree = categoryTreeHelper.categoryTree(categoryList);
  res.render('admin/pages/category-create.pug',{
    pageTitle : "Category create",
    categoryList : categoryTree
  })
}
module.exports.trash = async (req,res) => {
  const filter = {
    deleted : true,
  }
  if(req.query.keyword){
    filter.name = new RegExp(req.query.keyword,'i');
  }
  const limitRecord = process.env.LIMIT_PAGE_LIST;
  const totalRecord = await categoryModel.countDocuments(filter);
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
  const categoryList = await  categoryModel.find(filter).limit(limitRecord).skip(skip);
  for(const item of categoryList){
    const createdByFullName = await accountAdminModel.findOne({ _id : item.createdBy});
    if(createdByFullName){
      item.createdByFullName = createdByFullName.fullName;
    }
    else{
      item.createdByFullName = "";
    }
    item.createdAtFormat = moment(item.createdAt).format('HH:mm - DD/MM/YYYY');
  }
  for(const item of categoryList){
    const updatedByFullName = await accountAdminModel.findOne({ _id : item.updatedBy})
    if(updatedByFullName){
      item.updatedByFullName = updatedByFullName.fullName;
    }
    else{
      item.updatedByFullName = "";
    }
    item.updatedAtFormat = moment(item.updatedAt).format('HH:mm - DD/MM/YYYY');

  }
  res.render('admin/pages/category-trash.pug',{
    pageTitle : "Category create",
    categoryList : categoryList,
    pagination : pagination
  })
}

module.exports.createPost = async(req,res) => {
  if(req.body.position){
    req.body.position = parseInt(req.body.position);
  }else{
    const totalRecord = await categoryModel.countDocuments({});
    req.body.position = totalRecord + 1;
  }
  req.body.avatar = req.file ? req.file.path : "";
  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  const newRecord = new categoryModel(req.body);
  await newRecord.save();
  // gui du lieu vao flash
  req.flash('success', 'Thêm doanh mục thành công');
  res.json({
      code : "success"
    });
}

module.exports.edit = async (req,res) => {
  try{
    const id = req.params.id;
    const categoryDetail = await categoryModel.findOne({_id : id});
    const categoryList = await  categoryModel.find({deleted : false});
    categoryTree = categoryTreeHelper.categoryTree(categoryList);
    res.render(`admin/pages/category-edit.pug`,{
      pageTitle : "Category create",
      categoryList : categoryTree,
      categoryDetail : categoryDetail
    })
  }
  catch(error){
    res.redirect(`/${pathAdmin}/category/list`);
  }
}

module.exports.editPatch = async(req,res) => {
  try{
    const id = req.params.id;
    if(req.body.position){
      req.body.position = parseInt(req.body.position);
    }else{
      const totalRecord = await categoryModel.countDocuments({});
      req.body.position = totalRecord + 1;
    }
    if(req.file){
      req.body.avatar = req.file.path;
    }
    else{
      delete req.body.avatar;
    }
    req.body.updatedBy = req.account.id;
    await categoryModel.updateOne({_id : id, deleted : false},req.body);
    // gui du lieu vao flash
    req.flash('success', 'Chỉnh sửa  doanh mục thành công');
    res.json({
        code : "success"
      });
  }
  catch(error){
    res.json({
        code : "error",
        message : "Sản phẩm không tồn tại"
      });
  }
}

module.exports.deletePatch = async (req,res) => {
  try{
    const id = req.params.id;
    await categoryModel.updateOne({_id : id,deleted : false},{deleted : true,deletedBy : req.account.id, deletedAt : Date.now()});
    req.flash('success','Đã chuyển vào thùng rác ');
    res.json({code : "success"});
  }
  catch(error){
    console.log(error);
    res.json({
      code : "error",
      message : "Lỗi không chuyển danh mục vào thùng rác được"
    })
  }
}
module.exports.categoryUndo = async (req,res) => {
  try{
    const id = req.params.id;
    await categoryModel.updateOne({_id : id,deleted : true},{deleted : false});
    req.flash('success','Đã khôi phục thành công');
    res.json({code : "success"});
  }
  catch(error){
    console.log(error);
    res.json({
      code : "error",
      message : "Bảng ghi không tồn tại"
    })
  }
}
module.exports.deleteDestroy = async (req,res) => {
  try{
    const id = req.params.id;
    await categoryModel.deleteOne({_id : id,deleted : true});
    req.flash('success','Đã xóa thành công');
    res.json({code : "success"});
  }
  catch(error){
    console.log(error);
    res.json({
      code : "error",
      message : "Bảng ghi không tồn tại"
    })
  }
}
module.exports.applyOptionPatch = async(req,res) => {
  try{
    const {option,ids} = req.body;
    switch(option){
      case "active":
      case "inactive":       
        if(!req.roleDetail.permissions.includes('category-edit')){
          res.json({
            code : "error",
            message : "Tài khoảng không có  quyền truy cập !"
          });
          return;
        }
        await categoryModel.updateMany({_id : {$in : ids}},{status : option});
        req.flash('success','Cập nhật thành công');
        res.json({code : "success"});
        break;
      case "delete":
        if(!req.roleDetail.permissions.includes('category-delete')){
          res.json({
            code : "error",
            message : "Tài khoảng không có quyền truy cập !"
          });
          return;
        }        
        await categoryModel.updateMany({_id : {$in : ids}},{deleted : true,deletedAt : Date.now(),deletedBy : req.account.id});
        req.flash('success','Đã chuyển vào thùng rác');
        res.json({code : "success"});
        break;
      default : 
        res.json({
          code : "error",
          message : "Lỗi hành động"
        });
        break;
    }

  }
  catch(error){
    res.json({
      code : "error",
      message : "Danh mục không tồn tại"
    })
  }
}
module.exports.categoryTrashChangeMulti = async(req,res) => {
  try{
    const {option,ids} = req.body;
    switch(option){
      case "undo":
        await categoryModel.updateMany({_id : {$in : ids},deleted : true},{deleted : false});
        req.flash('success','Đã khôi phục thành công');
        res.json({code : "success"});
        break;
      case "delete-destroy":
        await categoryModel.deleteMany({_id : {$in : ids},deleted : true});
        req.flash('success','Đã xóa thành công');
        res.json({code : "success"});
        break;
      default : 
        res.json({
          code : "error",
          message : "Lỗi hành động"
        });
        break;
    }
  }
  catch(error){
    res.json({
      code : "error",
      message : "Danh mục không tồn tại"
    })
  }
}
