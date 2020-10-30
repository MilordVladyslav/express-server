const cuid = require('cuid')
const { isURL } = require('validator')

const db = require('../db')

const Notes = db.model('notes', {
	_id: { type: String, default: cuid },
	title: {type:String, required: true},
	description: {type: [String], required: true},
	elementsTypeList: { type: [String], required: true},
	image: {type: [String]},
})

module.exports = {
	get,
	list,
	create,
	edit,
	remove,
	model: Notes
}

async function list (opts = {}) {
	const { offset = 0, limit = 25, tag } = opts
	const query = tag ? { tags: tag } : {opts}
	const notes = await Notes.find()
		.sort({_id: 1})
		.skip(offset)
		.limit(limit)
	return notes
}

async function remove (_id) {
	await Notes.deleteOne({ _id })
}

async function edit (_id, change) {
	const note = await get({ _id })
	Object.keys(change).forEach(function (key) {
		note[key] = change[key]
	})
	await note.save()
	return note
}

async function create (fields) {
	const note = await new Notes(fields).save()
	return note
}

async function get (_id) {
	const note = await Notes.findById(_id)
	return note
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