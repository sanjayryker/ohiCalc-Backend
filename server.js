const express = require('express')
const cors = require('cors');
require('dotenv').config();
const edi_route = require('./src/routes/EDI_route')
const cdi_route = require('./src/routes/CDI_route')
const idi_route = require('./src/routes/IDI_route')
const score_route = require('./src/routes/score_route')
const mongoose = require('mongoose')

//app config
const app = express()
const PORT = process.env.PORT || 5000

//Middleware
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended:false}))

// Initializing Routes
// app.use('/api/song',edi_route)
app.use('/EDI',edi_route)
app.use('/IDI',idi_route)
app.use('/CDI',cdi_route)
app.use('/api',score_route)

app.get('/',(req,res)=> res.send("Api Working"))

mongoose
.connect(process.env.MONGODB_URI)
.then(() => {
    //Listen
app.listen(PORT,() =>
{
    console.log(`connected to Db & server is running on ${PORT}`)
})
})
.catch((error) =>
{
    console.log(error.message)
})
