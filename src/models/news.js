const mongoose = require('mongoose')
const News = mongoose.model('News',{
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    img:{
        type:Buffer
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Reporter'
    }


},{timestamps:true})

module.exports = News