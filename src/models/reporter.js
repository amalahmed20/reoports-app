const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

const reporterSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    adress:{
        type:String,
        trim:true,
        required:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error ('Email is invalid')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:6,
        validate(value){
            let password = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])")
            if(!password.test(value)){
                throw new Error ('password must contain special character')
            }
        }

    },
    phpne:{
        type:String,
        trim:true,
        required:true,
        validate(value){
            if(!validator.isMobilePhone(value, ['ar-EG'])){
                throw new Error ('phone number is invalid')
            }
        }

    },
    tokens:[
        {
            type:String,
            required:true
        }
    ],
    avatar:{
        type:Buffer

    }
},{timestamps:true})

/////

// password //

reporterSchema.pre('save',async function(){
    const reporter = this 
    if(reporter.isModified('password'))
    reporter.password = await bcryptjs.hash(reporter.password,8)
})


// login // 

reporterSchema.statics.findByCredentials = async(email,password) =>{
    const reporter = await Reporter.findOne({email})
    if(!reporter){
        throw new Error('Unable to login')
    }
    const isMatch = await bcryptjs.compare(password,reporter.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
    return reporter
}


/// generate token ///

reporterSchema.methods.generateToken = async function(){
    const reporter = this 
    const token = jwt.sign({_id:reporter._id.toString()},'nodecourse')
    reporter.tokens = reporter.tokens.concat(token)
    await reporter.save()
    return token
}

reporterSchema.methods.toJSON = function(){
    const reporter = this
    const reporterObject = reporter.toObject()
    delete reporterObject.password
    delete reporterObject.tokens
    return reporterObject
}
 
reporterSchema.virtual('news',{
    ref:'News',
    localField:'_id',
    foreignField:'owner'
    
})





const Reporter = mongoose.model('Reporter',reporterSchema)
module.exports = Reporter








