const mongoose = require('mongoose');
// đặt tên
module.exports.connect = async() => {
    try{
        await mongoose.connect(process.env.DATABASE);
        console.log("Ket noi database thanhc cong");
    }
    catch(error){
        console.log(error);
    }

}