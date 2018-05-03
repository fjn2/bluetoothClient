const { BluetoothSerialPort } = require('bluetooth-serial-port');

const serial = new BluetoothSerialPort();

serial.listPairedDevices((pairedDevices) => {
  console.log(JSON.stringify(pairedDevices, null, 2));
});
