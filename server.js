const path = require( 'path' );
const express = require( 'express' );
const socketIO = require( 'socket.io' );

//const io = require('socket.io') //require socket.io module and pass the ttp object (server)
const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var LED = new Gpio(17, 'out'); //use GPIO pin 17 as output
var pushButton = new Gpio(14, 'in', 'both'); //use GPIO pin 14 as input, and 'both' button presses, and releases should be handled
// import LED control API
const { toggle } = require( './led-control' );

// create an express app
const app = express();

// send `index.html` from the current directory
// when `http://<ip>:9000/` route is accessed using `GET` method
app.get( '/', ( request, response ) => {
  response.sendFile( path.resolve( __dirname, 'webapi/index.html' ), {
    headers: {
      'Content-Type': 'text/html',
    }
  } );
} );

// send asset files
app.use( '/assets/', express.static( path.resolve( __dirname, 'webapi' ) ) );
app.use( '/assets/', express.static( path.resolve( __dirname, 'node_modules/socket.io-client/dist' ) ) );

// server listens on `9000` port
const server = require('http').createServer(app);
const s =  server.listen( 9000, () => console.log( 'Express server started!' ));
// create a WebSocket server
const io = socketIO( server );

// listen for connection
io.on( 'connection', ( client ) => {
  console.log('A client is connected', client.id );

  // listen to `led-toggle` event
  client.on( 'led-toggle', ( data ) => {
    console.log( 'Received led-toggle event.' );
        toggle( data.r, data.g, data.b ); // toggle LEDs
  } );

  let lightvalue = 0; //static variable for current status
  pushButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
      return;
    }
    lightvalue = value;
    client.emit('light', lightvalue); //send button status to client
  });

    client.on('light', function(data) { //get light switch status from client
    lightvalue = data;
    if (lightvalue != LED.readSync()) { //only change LED if status has changed
      LED.writeSync(lightvalue); //turn LED on or off
    }
});

process.on('SIGINT', function () { //on ctrl+c
  LED.writeSync(0); // Turn LED off
  LED.unexport(); // Unexport LED GPIO to free resources
  pushButton.unexport(); // Unexport Button GPIO to free resources
  process.exit(); //exit completely
});
});
