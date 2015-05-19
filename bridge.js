var net = require('net');
var util = require('util');
var http = require('http');
var fs = require('fs');
var _ = require('lodash');
var yaml = require('js-yaml');
var config = yaml.safeLoad(fs.readFileSync(__dirname + '/config.yml', 'utf8'));

 
var client = new net.Socket();
client.connect(1099, '127.0.0.1', function() {
	console.log('Connected');
});
 
client.on('data', function(data) {
	var rows = data.toString().split('\n');
	_.each(rows, function(row) {
    parts = row.split(' ');
    if (parts.length == 8) {
      var deviceId = parts[5].toLowerCase();
      var command = parts[7].toLowerCase();
      console.log(util.format('Received %s message from device %s', command, deviceId));
      var deviceConfig = config.devices[deviceId];
      if (deviceConfig !== undefined && deviceConfig.actions[command] !== undefined) {
        var actionConfig = deviceConfig.actions[command];
        if (actionConfig.type == 'http') {
          var callback = function(response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
              });
            response.on('end', function () {
              console.log(str);
            });
          };	
          http.get(actionConfig.options, callback).end();
        }
      }
    }
	}); 
});
 
client.on('close', function() {
	console.log('Connection closed');
});
