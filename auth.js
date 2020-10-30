const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const passport = require('passport')
const Strategy = require('passport-local').Strategy

const autoCatch = require('./lib/auto-catch')

const jwtSecret = process.env.JWT_SECRET || 'mark it zero'
const adminPassword = process.env.ADMIN_PASSWORD
const jwtOpts = { algorithm: 'HS256', expiresIn: '30d' }

passport.use(adminStrategy())
const authenticate = passport.authenticate('local', {session: false})

module.exports = {
    authenticate,
    login: autoCatch(login),
    ensureUser: autoCatch(ensureUser)
}

async function login (req, res, next) {
  const token = await sign({ username: req.user.username })
  res.cookie('jwt', token, { httpOnly: true })
  res.json({ success: true, token: token })
}

async function sign (payload) {
  const token = await jwt.sign(payload, jwtSecret, jwtOpts)
  return token
}

async function ensureUser (req, res, next) {
	const jwtString = req.headers.authorization || req.cookies.jwt || null
		const payload = await verify(jwtString)
		if (payload.username) {
			req.user = payload
			if (req.user.username === 'admin') req.isAdmin = true
			return next()
		}
	
		const err = new Error('Unauthorized')
		err.statusCode = 401
		next(err)
}  

async function verify (jwtString = '') {
  jwtString = jwtString.replace(/^Bearer /i, '')
  try {
    const payload = jwt.verify(jwtString, jwtSecret)
    return payload
  } catch (err) {
    err.statusCode = 401
    throw err
  }
}

function adminStrategy() {
	return new Strategy(async function (username, password, cb) {
		const isAdmin = username === 'admin' && password === adminPassword
		if (isAdmin) return cb(null, {username: 'admin'})
		cb(null, false)
	})
}