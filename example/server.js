var express = require('express')
  , http = require('http')
  , app = express();
var config = {
  rootDirectory: __dirname + '/media',
  apiPrefix: '/api/v1',
  limits: {
    uploadMB: '50mb'
  },
  host: {
    port: 8080
  }
};
var server = http.createServer(app);
var apiServer = require('../index');
apiServer(config, app);
/**
 * Start HTTP Server
 */
server.listen(config.host.port, function () {
  console.log('HATEOAS Server listening on port ' + config.host.port);
});
