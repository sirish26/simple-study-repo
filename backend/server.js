const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');

require('dotenv').config();

var cors = require('express-cross');


const app = express();
app.use(express.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
const port = process.env.PORT || 3001;


// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});
const upload = multer({ storage });

mongoose.connect(process.env.MONGODB_URI)
      .then(() => {
        console.log("Connection Successfull");
      })
      .catch((error) => {
        console.log("Connection Unsuccessfull");
      });




const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});
// Define Material schema and model
const materialSchema = new mongoose.Schema({
  title: String,
  category: String,
  format: String,
  file: String,
});
const Material = mongoose.model('Material', materialSchema);

// Set up API routes
app.get('/materials', async (req, res) => {
  try {
    const materials = await Material.find();
    console.log("sent materials")
    res.json(materials);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/materials', upload.single('file'), async (req, res) => {
  try {
    const { title, category, format } = req.body;
    const file = req.file.filename;

    const material = new Material({ title, category, format, file });
    await material.save();

    res.json({ message: 'Material uploaded successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.use('/download', express.static('uploads'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
