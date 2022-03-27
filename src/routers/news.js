const express = require('express')

const router = express.Router()
const News = require('../models/news')

const auth = require('../middelware/auth')

const multer = require('multer')

// post 

router.post('/news',auth,async(req,res)=>{
    try{
        const news = new News({...req.body,owner:req.reporter._id})
        await news.save()
        res.status(200).send(news)
    }
    catch(e){
        res.status(400).send(e.message)
    }
})

// get news //

router.get('/news',auth,async(req,res)=>{
    try{
        await req.reporter.populate('news')
        req.status(200).send(req.reporter.news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})

// get news by id 

router.get('/news/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id
        const news = await News.findOne({_id,owner:req.reporter._id})
        console.log(news)
        if(!news){
          return  res.status(404).send('Unable to find news')
        }
        res.send(news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})


// update news 
router.patch('/news/:id',auth,async(req,res)=>{
    try{
        const id = req.params.id
        const news = await Task.findOneAndUpdate({_id:id,owner:req.reporter._id},req.body,{
            new:true,
            runValidators:true
        })
        if(!news){
            return res.status(404).send('No news')
        }
        res.status(200).send(news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})
 // delete news 
 router.delete('/news/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id
        const news = await Task.findOneAndDelete({_id,owner:req.reporter._id})
        if(!news){
         return  res.status(404).send('No news is found')
        }
        res.status(200).send(news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})


router.get('/reporterNews/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id
        const news = await News.findOne({_id,owner:req.reporter._id})
        if(!news){
            return res.status(404).send('No news')
        }
        await news.populate('owner') // refrence 
        res.status(200).send(news.owner)
    }
    catch(e){
        res.status(500).send(e)
    }
})



const uploads = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
            return cb(new Error('please upload image'))
        }
        cb(null,true)
    }
})

router.post('/profile/image',auth,uploads.single('img'),async(req,res)=>{
    try{
        req.news.avatar = req.file.buffer
        await req.news.save()
        req.send()
    }
    catch(e){
        res.send()
    }
})

module.exports = router