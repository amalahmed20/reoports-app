const express = require('express')
const app = express()
const port = process.env.PORT ||3000
require('./db/mongoose')
app.use(express.json())

const reporterRouter = require('./routers/reporter')
const newsRouter = require('./routers/news')
// const News = require('./models/news')
app.use(reporterRouter)
app.use(newsRouter)





app.listen(port,()=>{console.log('server Running')})