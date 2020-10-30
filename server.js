require('dotenv').config({path: 'variables.env'});

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const api = require('./api')
const auth = require('./auth')
const middleware = require('./middleware')
const crypto = require('crypto')
const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
  destination: 'public',
  filename: (req, file, callback) => {
      crypto.pseudoRandomBytes(16, function (err, raw) {
          if (err) return callback(err);
          callback(null, raw.toString('hex') + path.extname(file.originalname));
      });
  }
});

let upload = multer({ storage: storage })


const port = process.env.PORT || 1337
const app = express()



app.use(express.static('public'));
app.use(middleware.cors)
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors())

app.post('/login', auth.authenticate, auth.login)
app.post('/projects/', auth.ensureUser, upload.fields([{name:'image',maxCount:100},{name:'previewImage',maxCount: 1}]), api.createProject)
app.post('/servefile', auth.ensureUser, upload.array('imagePath'), api.serveFile)
app.delete('/projects/:id', auth.ensureUser, api.deleteProject)
app.put('/projects/:id', auth.ensureUser, api.editProject)
app.get('/projects/:id', api.getProject)
app.get('/projects', api.listProjects)
app.get('/public/*', api.respondStatic)
app.get('/notes', api.listNotes)
app.get('/notes/:id', api.getNote)
app.put('/notes/:id', auth.ensureUser, api.editNote)
app.post('/notes', auth.ensureUser,  upload.fields([{name:'image',maxCount:12}]),  api.createNote)

app.delete('/notes/:id', auth.ensureUser, api.deleteNote)

app.use(middleware.handleValidationError)
app.use(middleware.handleError)
app.use(middleware.notFound)

const server = app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})