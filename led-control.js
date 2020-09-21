// import `onoff` package
const { Gpio } = require( 'onoff' );


// configure LED pins
const pin_red = new Gpio( 13, 'out' );
const pin_yellow = new Gpio( 19, 'out' );
const pin_green = new Gpio( 26, 'out' );

// toggle LED states
exports.toggle = ( r, y, g ) => {
  pin_red.writeSync( r ? 1 : 0 );
  pin_yellow.writeSync( y ? 1 : 0 );
  pin_green.writeSync( g ? 1 :0 );
};

