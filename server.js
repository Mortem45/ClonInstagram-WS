'use strict'

const http = require('http')
const socketio = require('socket.io')
const r = require('rethinkdb')
const config = require('./config')

const server = http.createServer()
const io = socketio(server)
const port = process.env.PORT || 5151

r.connect(config.db, (err, conn) => {
  if (err) return console.error(err.message)

  r.table('images').changes().run(conn, (err, cursor) => {
    if (err) return console.error(err.message)
    cursor.on('data', data => {
      let image = data.new_val
      let imageOld = data.old_val
      if (image.publicId != null && (image.likes == imageOld.likes)) {
        io.sockets.emit('image', image)
	}
    })
  })
})

server.listen(port, () => console.log(`listen on port ${port}`))
