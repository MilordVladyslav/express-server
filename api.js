const autoCatch = require('./lib/auto-catch')
const Notes = require('./models/notes')
const Projects = require('./models/projects')

const fs = require('fs')
const cuid = require('cuid')
const _ = require('lodash')



module.exports = autoCatch({
	getProject,
	createProject,
	editProject,
	listProjects,
	deleteProject,
	editNote,
	getNote,
	listNotes,
	deleteNote,
	createNote,
	serveFile,
	respondStatic
})

function serveFile(req) {
	let imagePath = []
	let imageThumb = []
	if(req.files.imagePath.length) {
		for(let i = 0; req.files.imagePath.length; i++) {
			imagePath.push(req.protocol + "://" + host + '/' + req.files.imagePath[i].path)
		} 
	}
	if(req.files.imageThumb.length) {
		for(let i = 0; req.files.imageThumb.length; i++) {
			imageThumb.push(req.protocol + "://" + host + '/' + req.files[i].path)
		}
	}
}

async function deleteProject (req, res, next) {
	if (!req.isAdmin) return forbidden(next)

	await Projects.remove(req.params.id)
	res.json({ success: true })
}

async function getProject (req, res, next) {
	const { id } = req.params

	const project = await Projects.get(id)
	if (!project) return next()
	
	res.json(project)
}

async function editNote (req, res, next) {
  if (!req.isAdmin) return forbidden(next)

  const change = req.body
  const note = await Notes.edit(req.params.id, change)

  res.json(note)
}

async function deleteNote (req, res, next) {
	if(!req.isAdmin) return forbidden(next)
	await Notes.remove(req.params.id)
	res.json({ success: true })
}

async function getNote (req, res, next) {
	const { id } = req.params
	const note = await Notes.get(id)
	if (!note) return next()
	res.json(note)
}


async function listNotes (req, res, next){
	const { offset = 0, limit = 25, tag } = req.query
	const notes = await Notes.list({
		offset: Number(offset),
		limit: Number(limit),
		tag
	})
	res.json(notes)
}

async function editProject (req, res, next) {
	if (!req.isAdmin) return forbidden(next)
  
	const change = req.body
	const project = await Projects.edit(req.params.id, change)
  
	res.json(project)
}  

async function listProjects (req, res, next) {

	const { offset = 0, limit = 25, tag } = req.query

	const projects = await Projects.list({
		offset: Number(offset),
		limit: Number(limit),
		tag
	})

	res.json(projects)
}

async function createNote (req, res, next) {
	if (!req.isAdmin) return forbidden(next)
	let image = []
	const host = req.get('host')
	if(req.files) {
		if(req.files.image && req.files.image.length) {
			for(let i = 0; i < req.files.image.length; i++) {
				image.push(req.protocol + "://" + host + '/' + req.files.image[i].path)
			} 
		}
	}
	req.body.image = [...image]
	if(!req.body.elementsTypeList) {
		const err = new Error('Bad Request')
		err.statusCode = 400
		return next(err)
	}
	if(!Array.isArray(req.body.elementsTypeList)) {
		req.body.elementsTypeList = [req.body.elementsTypeList]
	}
	
	for(let i = 0; i < req.body.elementsTypeList.length; i++) {
		const _id = cuid()
		req.body.elementsTypeList[i] = {
			value:req.body.elementsTypeList[i],
			_id: _id
		}
	}
	const uniqElementsTypes = _.uniqBy(req.body.elementsTypeList, 'value')
	
	for(let i = 0; i < uniqElementsTypes.length; i++) {
	  const descriptions = req.body.elementsTypeList.filter(
		(item) =>  item.value === uniqElementsTypes[i].value
	  );
	  if(!Array.isArray(req.body[uniqElementsTypes[i].value])) {
		req.body[uniqElementsTypes[i].value]  = [req.body[uniqElementsTypes[i].value]]
	  }

	  req.body[uniqElementsTypes[i].value] = req.body[uniqElementsTypes[i].value].map((item, index) => {
		return {
		  value: item,
		  _id: descriptions[index]._id
		}
	})

	}

	const note = await Notes.create(req.body)
	res.json(note)
}



async function createProject (req, res, next) {
	if (!req.isAdmin) return forbidden(next)
	let image = []
	let previewImage = []
	const host = req.get('host')
	if(req.files) {
		if(req.files.image && req.files.image.length) {
			for(let i = 0; i < req.files.image.length; i++) {
				image.push(req.protocol + "://" + host + '/' + req.files.image[i].path)
			} 
		}
		if(req.files.previewImage && req.files.previewImage.length) {
			for(let i = 0; i < req.files.previewImage.length; i++) {
				previewImage.push(req.protocol + "://" + host + '/' + req.files.previewImage[i].path)
			}
		}
	}
	req.body.image = [...image]
	req.body.previewImage = [...previewImage]
	if(!req.body.elementsTypeList) {
		const err = new Error('Bad Request')
		err.statusCode = 400
		return next(err)
	}
	if(!Array.isArray(req.body.elementsTypeList)) {
		req.body.elementsTypeList = [req.body.elementsTypeList]
	}
	
	for(let i = 0; i < req.body.elementsTypeList.length; i++) {
		const _id = cuid()
		req.body.elementsTypeList[i] = {
			value:req.body.elementsTypeList[i],
			_id: _id
		}
	}
	const uniqElementsTypes = _.uniqBy(req.body.elementsTypeList, 'value')
	
	for(let i = 0; i < uniqElementsTypes.length; i++) {
	  const descriptions = req.body.elementsTypeList.filter(
		(item) =>  item.value === uniqElementsTypes[i].value
	  );
	  if(!Array.isArray(req.body[uniqElementsTypes[i].value])) {
		req.body[uniqElementsTypes[i].value]  = [req.body[uniqElementsTypes[i].value]]
	  }

	  req.body[uniqElementsTypes[i].value] = req.body[uniqElementsTypes[i].value].map((item, index) => {
		return {
		  value: item,
		  _id: descriptions[index]._id
		}
	})

	}
	console.log(req.body)
	const project = await Projects.create(req.body)
	res.json(project)
}

async function respondStatic (req, res) {
	const filename = `${__dirname}/public/${req.params[0]}`
	fs.createReadStream(filename)
	.on('error', () => respondNotFound(req, res))
	.pipe(res)
}

function respondNotFound (req, res) {
	res.writeHead(404, { 'Content-Type': 'text/plain' })
	res.end('Not Found')
}

function forbidden (next) {
	const err = new Error('Forbidden')
	err.statusCode = 403
	return next(err)
}