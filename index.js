#!/usr/bin/env node

const debug = require('debug')('bluetoothClient');
const { BluetoothSerialPort } = require('bluetooth-serial-port');

const serial = new BluetoothSerialPort();

const readline = require('readline');

function Terminal() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  this.inputQueue = [];
  this.requestQueue = [];

  rl.on('line', (line) => {
    if (this.requestQueue.length > 0) {
      const resolve = this.requestQueue.shift();
      resolve(line);
    } else {
      this.inputQueue.push(line);
    }
  });

  this.close = () => {
    rl.close();
  };

  this.readLine = () => (new Promise((resolve) => {
    if (this.inputQueue.length > 0) {
      resolve(this.inputQueue.shift());
    } else {
      this.requestQueue.push(resolve);
    }
  }));
  return this;
}

function connect(srl, address, channel) {
  return new Promise((resolve, reject) => {
    srl.connect(address, channel, () => {
      debug('Connected to device');
      resolve();
    }, () => {
      reject(new Error('Error'));
    });
  });
}

async function main() {
  try {
    const terminal = new Terminal();
    console.log('Enter MAC address');
    const macAddress = await terminal.readLine();
    console.log('Enter channel');
    const channel = await terminal.readLine();
    console.log(`Trying to connect to "${macAddress}" using "${channel}" channel`);
    await connect(serial, macAddress, channel);

    serial.on('data', (buffer) => {
      debug(buffer.toString('utf-8'));
    });

    let comunicationEnds = false;
    while (!comunicationEnds) {
      const command = await terminal.readLine(); // eslint-disable-line
      if (command === 'exit') {
        comunicationEnds = true;
        // TODO make the correct disconect using bluetooth
      }
      serial.write(Buffer.from(command, 'utf-8'), (err, bytesWritten) => {
        if (err) {
          debug(err);
          debug(bytesWritten);
        }
      });
    }

    terminal.close();
  } catch (err) {
    debug(err);
  }
}

main();
