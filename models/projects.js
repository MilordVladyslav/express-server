const cuid = require('cuid')
const { isURL } = require('validator')

const db = require('../db')

const Projects = db.model('projects', {
	_id: { type: String, default: cuid },
	title: {type:String, required: true},
	description: {type: [{}], required: true},
	elementsTypeList: { type: [{}], required: true},
	image: {type: [{}]},
	previewImage: {type: [{}]}
})

module.exports = {
	get,
	list,
	create,
	edit,
	remove,
	model: Projects
}

async function list (opts = {}) {
	const { offset = 0, limit = 25, tag } = opts
	const query = tag ? { tags: tag } : {opts}
	const projects = await Projects.find()
		.sort({_id: 1})
		.skip(offset)
		.limit(limit)
	return projects
}

async function remove (_id) {
	await Projects.deleteOne({ _id })
}

async function edit (_id, change) {
	const project = await get({ _id })
	Object.keys(change).forEach(function (key) {
	    project[key] = change[key]
	})
	await project.save()
	return project
}

async function create (fields) {
	const project = await new Projects(fields).save()
	return project
}

async function get (_id) {
	const project = await Projects.findById(_id)
	return project
}

function urlSchema (opts = {}) {
	const { required } = opts
	return {
		type: [String],
		required: !!required,
		validate: {
			validator: isURL,
			message: props => `${props.value} is not a valid URL`
		}
	}
}