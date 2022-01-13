const Queue = require('./app/models/queue')
const Profile = require('./app/models/profile')

// define server and client ports
// used for cors and local port declaration
const serverDevPort = 8000
const clientDevPort = 3000

// define port for API to run on
// adding PORT= to your env file will be necessary for deployment
const port = process.env.PORT || serverDevPort


// require necessary NPM packages
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

// require route files
const exampleRoutes = require('./app/routes/example_routes')
const userRoutes = require('./app/routes/user_routes')
const profileRoutes = require('./app/routes/profile_routes')
const queueRoutes = require('./app/routes/queue_routes')


// require middleware
const errorHandler = require('./lib/error_handler')
const replaceToken = require('./lib/replace_token')
const requestLogger = require('./lib/request_logger')

// require database configuration logic
// `db` will be the actual Mongo URI as a string
const db = require('./config/db')

// require configured passport authentication middleware
const auth = require('./lib/auth')



// establish database connection
// use new version of URL parser
// use createIndex instead of deprecated ensureIndex
mongoose.connect(db, {
	useNewUrlParser: true,
})

// instantiate express application object
const app = express()

// set CORS headers on response from this API using the `cors` NPM package
// `CLIENT_ORIGIN` is an environment variable that will be set on Heroku
app.use(
	cors({
		origin: process.env.CLIENT_ORIGIN || `http://localhost:${clientDevPort}`,
	})
)

//
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const { listeners } = require('process')
const io = new Server(server, {
	cors: {
		origins: ["*"],
		handlePreflightRequest: (req, res) => {
			res.writeHead(200, {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET,POST",
				"Access-Control-Allow-Headers": "you-get-one",
				"Access-Control-Allow-Credentials": true
			})
			res.end()
		}
	}
})

///////////////////////////////////////
// SOCKET.IO LISTENERS AND FUNCTIONS //
///////////////////////////////////////

io.on('connection', socket => {
	console.log('USER CONNECTED')
	socket.on('chat message', msg => {
		// console.log('message: ' + msg.message)
        io.emit('broadcast', msg)
    })

	socket.on('joined queue',  () => {
		// if the queue is not running, start it
		console.log('received join queue notif')
		if (!queueRunning) {
			startQueueProcessing()
		} else {
			console.log('the queue is already running')
		}
	})

	socket.on('left queue', () => {
		io.emit('queue update')
	})

	socket.on('fed frog', (payload) => {
		// console.log(payload)
		// console.log('frog has been fed!')
		Profile.findOneAndUpdate({owner: payload.userId}, {$inc: {fedCount: 1}})
			.then(profile => {
				console.log(profile)
			})
	})

    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
})



// this middleware makes it so the client can use the Rails convention
// of `Authorization: Token token=<token>` OR the Express convention of
// `Authorization: Bearer <token>`
app.use(replaceToken)

// register passport authentication middleware
app.use(auth)

// add `express.json` middleware which will parse JSON requests into
// JS objects before they reach the route files.
// The method `.use` sets up middleware for the Express application
app.use(express.json())
// this parses requests sent by `$.ajax`, which use a different content type
app.use(express.urlencoded({ extended: true }))

// log each request as it comes in for debugging
app.use(requestLogger)

// register route files
app.use(exampleRoutes)
app.use(userRoutes)
app.use(profileRoutes)
app.use(queueRoutes)

// register error handling middleware
// note that this comes after the route middlewares, because it needs to be
// passed any error messages from them
app.use(errorHandler)


// queue updater interval -- removes the first name from the list and pings all users to update their queues?

let queueRunning = false

const startQueueProcessing = () => {
	queueRunning = true
	const queueProcessing = setInterval(()=> {
		Queue.find({})
			.sort({'dateCreated': 'desc'})
			.then(queues => {
				console.log('the query ran again')
				if (queues.length > 1) {
					io.emit('queue update')
					io.emit('kick current player')
					queues[0].deleteOne()
				} else if (queues.length === 1) {
					io.emit('queue update')
					io.emit('kick current player')
					queues[0].deleteOne()
					clearInterval(queueProcessing)
					queueRunning = false
				}
			})
	}, 10000)
}


// setInterval(()=> {
//     Queue.find({})
//         .sort({'dateCreated': 'desc'})
//         .then(queues => {
//             if (queues.length > 0) {
//                 io.emit('queue update')
//                 queues[0].deleteOne()
//             }
            
//         })
// }, 10000) // absurdly large for testing

// run API on designated port (4741 in this case)
server.listen(port, () => {
	console.log('listening on port ' + port)
})

// needed for testing
module.exports = app
