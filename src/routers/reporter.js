const express = require('express')
const router = express.Router()
const Reporter = require('../models/Reporter')
const auth = require('../middelware/auth')
const multer = require('multer')


// sign up ///

router.post('/reporters',async(req,res)=>{
    try{
        const reporter = new Reporter(req.body)
        const token = await reporter.generateToken()
        await reporter.save()
        res.status(200).send({reporter,token})
    }
    catch(e){
        res.status(400).send(e.message)
    }
})

// login //

router.post('/login',async(req,res)=>{
    try{
        const reporter = await Reporter.findByCredentials(req.body.email,req.body.password)
        const token = await reporter.generateToken()
        res.status(200).send({reporter,token})
    }
    catch(e){
        res.status(400).send(e.message)

    }
})

// profile //
router.get('/profile',auth,async(req,res)=>{
    res.status(200).send(req.reporter)
})


// get reporters //
router.get('/reporters',auth,(req,res)=>{
    Reporter.find({}).then((reporters)=>{
        res.status(200).send(reporters)
    }).catch((e)=>{
        res.status(500).send(e)
    })
})

// get by id //
router.get('/reporters/:id',auth,(req,res)=>{
    const _id = req.params.id
    Reporter.findById(_id).then((reporter)=>{
        if(!reporter){
           return res.status(404).send('Unable to find reporter')
        }
        res.status(200).send(reporter)
    }).catch((e)=>{
        res.status(500).send(e)
    })
})

/// update reporter //
router.patch('/reporters',auth,async(req,res)=>{
    try{
        const updates = Object.keys(req.body)
        console.log(updates)
        
        updates.forEach((update)=>(  req.reporter[update]=req.body[update]))
        await   req.reporter.save()
        res.status(200).send(  req.reporter)

    }
    catch(error){
        res.status(400).send(error)
    }
})


// delete reporter //

router.delete('/reporters/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id
        const reporter = await Reporter.findByIdAndDelete(_id)
        if(!reporter){
            return res.status(404).send('unable to find reporter')

        }
        res.status(200).send(reporter)

    }
    catch(e){
        res.status(500).send(e)
    }
})

// logout ///

router.delete('/logout',auth,async(req,res)=>{
    try{
        console.log(req.reporter)
        req.reporter.tokens = req.reporter.tokens.filter((el)=>{
            return el !== req.token
        })
        await req.reporter.save()
        res.send()
    }
    catch(e){
        res.status(500).send(e)
    }

})

//logout all //

router.delete('/logoutAll',auth,async(req,res)=>{
    try{
        req.reporter.tokens = []
        await req.reporter.save()
        res.send()
    }
    catch(e){
        res.status(500).send(e)
    }
})

// upload image  //

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

router.post('/profile/avatar',auth,uploads.single('avatar'),async(req,res)=>{
    try{
        req.reporter.avatar = req.file.buffer
        await req.reporter.save()
        req.send()
    }
    catch(e){
        res.send()
    }
})

module.exports = router

