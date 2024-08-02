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

// Database connection URIs
const db1URI = process.env.MONGODB_URI1;
const db2URI = process.env.MONGODB_URI2;

const db1Connection = mongoose.createConnection(db1URI);
const db2Connection = mongoose.createConnection(db2URI);

// Middleware to select the correct database
const selectDatabase = (req, res, next) => {
    if (req.path.startsWith('/EDI') || req.path.startsWith('/IDI') || req.path.startsWith('/CDI') || req.path.startsWith('/api')) {
        req.dbConnection = db1Connection;
    } else if (req.path.startsWith('/weight') ) {
        req.dbConnection = db2Connection;
    } else {
        return res.status(400).send('Invalid path');
    }
    next();
};
app.use(selectDatabase);

// Initializing Routes
app.use('/EDI',edi_route)
app.use('/IDI',idi_route)
app.use('/CDI',cdi_route)
app.use('/api',score_route)

app.get('/',(req,res)=> res.send("Api Working"))

// mongoose
// .connect(process.env.MONGODB_URI2)
// .then(() => {
//     //Listen
// app.listen(PORT,() =>
// {
//     console.log(`connected to Db & server is running on ${PORT}`)   
// })
// })
// .catch((error) =>
// {
//     console.log(error.message)
// })

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
