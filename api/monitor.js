const WebSocket = require('ws');
const errors  = require('./../lib/errors.js');
const respond = require('./../lib/response-handler.js');
const remote  = require('./../lib/remote.js');

var ws = new WebSocket('ws://live.stellar.org:9001');

ws.on('open', function() {
    console.log('ws connected');
});
module.exports = {
    generate: generate
};

function generate(request, response, next) {

    var _data = { command : "create_keys" }
    ws.send(JSON.stringify(_data))
    ws.on('message', function(data, flags) {
        var msg = JSON.parse(data);
        response.json(JSON.parse(data));
    });
    // server info
//    remote.request_server_info(function(err, res) {
//        if (err) {
//            console.log('<><><errrrrr<><',err, res)
//        } else {
//            console.log('<><>=========<<><',err, res)
//        }
//    });


    //monitoring
//    remote.connect(function() {
//        remote.on('transaction_all', function(transaction_data){
//            console.log('<><><<><', transaction_data)
//        });
//        remote.on('create_keys', function(ledgerListener){
//            console.log('<><><<><ledgerListener', ledgerListener)
//        })
//    });
//
//    function transactionListener (transaction_data) {
//        // handle transaction_data
//        // see https://www.stellar.org/api/#api-subscribe for the format of transaction_data
//    }
//
//    function ledgerListener (ledger_data) {
//        // handle ledger_data
//        // see https://www.stellar.org/api/#api-subscribe for the format of ledger_data
//    }

}