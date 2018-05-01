var BluetoothSerialPort = require("bluetooth-serial-port").BluetoothSerialPort;
var serial = new BluetoothSerialPort();

serial.listPairedDevices(function(pairedDevices) {
  console.log(JSON.stringify(pairedDevices));
    const result = pairedDevices.find((device) => (device.name === 'OBDII'));
    // const service = result.services.find((srv) => (srv.name === 'RFCOMM custom service'));
    if (result) {
      const service = result.services[0];
    }

    serial.connect(result.address, service.channel, () =>{
      console.log('connected');
      serial.on('data', function(buffer) {
        console.log(buffer.toString('utf-8'));
      });
    }, () => {
      console.log('error');
    });

});

var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
  serial.write(new Buffer(line, 'utf-8'), function(err, bytesWritten) {
    if (err) console.log(err);
  });
})
