var ripple  = require('stellar-lib');
var config = require('./config-loader');
var dbinterface = require('./db-interface');
var logger = require('./logger.js').logger;

var remoteOpts = {
  servers: config.get('stellard_servers'),
  storage: dbinterface
};

if (config.get('debug')) {
  remoteOpts.trace = true;
}

var remote = new ripple.Remote(remoteOpts);

function prepareRemote() {
  var connect = remote.connect;
  var connected = false;

  function ready() {
    if (!connected) {
      logger.info('[STLD] Connection established');
      connected = true;
    }
  };

  remote.reconnect = function() {
    logger.info('[STLD] Attempting to connect to the Stellar network...');
    connect.apply(remote, arguments);
  };

  remote.on('error', function(err) {
    logger.error('[STLD] error: ', err);
      remote.reconnect();
  });

  remote.on('disconnect', function() {
    logger.info('[STLD] Disconnected from the Stellar network');
    connected = false;
      remote.reconnect();
  });

  remote._servers.forEach(function(server) {
    server.on('connect', function() {
      logger.info('[STLD] Connected to stellard server:', server._url);
      server.once('ledger_closed', ready);
    });
    server.on('disconnect', function() {
      logger.info('[STLD] Disconnected from stellard server:', server._url);

    });
  });

  process.on('SIGHUP', function() {
    logger.info('Received signal SIGHUP, reconnecting to Stellar network');
    remote.reconnect();
  });

  setInterval(function() {
    var pingRequest = remote.request('ping');
    pingRequest.on('error', function(){
        logger.info('Ping error');
    });
    pingRequest.on('success', function(){
        logger.info('Ping success');
    });
    pingRequest.broadcast();
  }, 1000 * 15);
};

if (config.get('NODE_ENV') !== 'test') {
  prepareRemote();
}

module.exports = remote;
