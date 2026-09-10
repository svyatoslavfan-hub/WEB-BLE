 var deviceData = null;
var characteristicData = [];
var characteristicLED = null;
var characteristicMotor = null;
var connectButton = document.querySelector("#bleOn");
var disconnectButton = document.querySelector("#bleOff");
var ledOnButton = document.querySelector("#ledOn");
var ledOffButton = document.querySelector("#ledOff");
var slider = document.querySelector("#pwmSlider");
var bleStatus = document.querySelector("#bleStatus");
var ledStatus = document.querySelector("#ledStatus");


connectButton.addEventListener("click", function(){
   bleConnect();
});

ledOnButton.addEventListener("click", function(){
  ledTurnOn(characteristicData[0])
  .then(_ => {
   console.log("LED turned on!");
   ledStatus.textContent = "LED Status: Turned on";
  })
  .catch(error => {
   console.error(error);
  });
});

ledOffButton.addEventListener("click", function(){
   ledTurnOff(characteristicData[0])
   .then(_ => {
      console.log("LED turned off!");
      ledStatus.textContent = "Led Status: Turned off";
   })
   .catch(error =>{
      console.error(error);
   });
});

disconnectButton.addEventListener("click", function(){
 bleDisconnect(deviceData);
});

slider.addEventListener("input", throttle(() => {
 
 sliderMove(characteristicData[1], slider.value);

 /*.then(_ => {
   console.log("PWM value changed!");
 })
 .catch(error => {
   console.error(error);
 })
*/
}, 500));



function bleConnect(){
   requestBluetoothDevice()
   .then(device => connectDeviceAndCharacteristic(device))
   .catch(error => {
      console.error(error);
   })
}

function requestBluetoothDevice(){
console.log("Requesting Bluetooth Devices..");

return navigator.bluetooth.requestDevice({
   acceptAllDevices : true,
   optionalServices: ['1b600fe6-1265-47ad-94be-512692f6e0b0']
})
.then(device => {
   // console.log(device);
   console.log(`${device.name} device selected`);
   deviceData = device;
   return deviceData;
});
}

function connectDeviceAndCharacteristic(device){
 console.log("Connecting to GATT server..");

 return device.gatt.connect()
 .then(server => {
   console.log("GATT server connected, getting service..");

   return server.getPrimaryService('1b600fe6-1265-47ad-94be-512692f6e0b0');
 })
 .then(service => {
   console.log("Service found, getting characteristics..");
   
  // return service.getCharacteristic('a31afb8b-460f-49c8-9399-8975a46af59c');
 return Promise.all([service.getCharacteristic('a31afb8b-460f-49c8-9399-8975a46af59c'), 
  service.getCharacteristic('0c52bf44-eafa-4f4b-9ee9-31da11880caa')]);
 })
 .then(characteristic => {
   console.log("Characteristics found");
     characteristicData[0] = characteristic[0];
     characteristicData[1] = characteristic[1];
    //characteristicData = characteristic;
    console.log(characteristicData);
    bleStatus.textContent = "Connection status: Connected";
   return characteristicData;
 });
}
 
function ledTurnOn(characteristic){
  console.log("Turning on LED..");
  const turnOn = Uint8Array.of(1);
  return characteristic.writeValue(turnOn);
}

function ledTurnOff(characteristic){
  console.log("Turning off LED..");
  const turnOff = Uint8Array.of(0);
  return characteristic.writeValue(turnOff);
}

function bleDisconnect(device){
   if(deviceData.gatt.connected){
      console.log("Disconnecting from BLE device..");
      deviceData.gatt.disconnect();
      console.log("Device disconnected!");
      bleStatus.textContent = "Connection status: Disconnected";
   }
   else{
      console.log("BLE device is already disconnected!");
   }
};

function sliderMove(characteristic, data){
  //var value = slider.value;
 // console.log(value);   
var value =  Uint8Array.of(slider.value);
console.log(`Got new value ${value}`);
var label = document.querySelector("label").textContent = `PWM value: ${value}`;
return characteristic.writeValue(value);
};

function throttle(fn, delay){
 var t = 0;
 return function(...args){
   var now = Date.now();
   if(now - t >= delay){
      fn.apply(this, args);
      t = now;
   }
 };
}