const WebSocket = require('websocket').client;
const errors  = require('./../lib/errors.js');
const respond = require('./../lib/response-handler.js');
const remote  = require('./../lib/remote.js');
const config  = require('./../../gatewayd/config/config.json');

var url = 'wss://live.stellar.org:9001';
var client = new WebSocket();
var connection

client.on('connect', function (c) {
    connection = c;
    console.log('--WebSocket connection established');
    connection.on('close', function () {
        console.log('--WebSocket connection close');
        client.connect(url);
    });
    connection.on('error', function () {
        console.log('--WebSocket connection error');
        client.connect(url);
    });
});

client.on('connectFailed', function (err) {
    console.log('--WebSocket connection fail: ' + err + err.stack);
});

client.connect(url);

module.exports = {
    generateHotWallet: generateHotWallet,
    infoHashTransaction: infoHashTransaction,
    setRegularKey: setRegularKey,
    transaction: transaction,
    trustSet: trustSet,
    transactionWithDestinationTag: transactionWithDestinationTag,
    accountLines: accountLines,
    setDestinationFlag: setDestinationFlag,
    accountMerge: accountMerge,
    subscribe: subscribe
};


function transaction(request, response, next) {
    var _data = {
        command : "submit",
        secret : request.query.secret || config.HOT_WALLET.secret,
        tx_json : {
            Account : request.query.account || config.HOT_WALLET.address,
            Amount : Number(request.query.valueSTR) * 100000 || {
                currency:request.query.currency ||"XRP",
                value:request.query.value || "100000",
                issuer: request.query.account || config.HOT_WALLET.address
            },
            Destination : request.query.destination || config.COLD_WALLET,
            TransactionType : "Payment"
        }
    }
    connection.send(JSON.stringify(_data))

    connection.on('message', function(data) {

        try {
            var msg = JSON.parse(data.utf8Data);
            response.json(msg);
        } catch (e) {
            next()
        }
    });

}

function trustSet(request, response, next) {
    var _data = {
        command : "submit",
        secret : request.query.secret || config.HOT_WALLET.secret,
        tx_json : {
            Account : request.query.account || config.HOT_WALLET.address,
            LimitAmount : {
                currency:request.query.currency ||"XRP",
                value:request.query.limitAmount || "100000",
                issuer: request.query.issuer || config.COLD_WALLET
            },
            TransactionType : "TrustSet"
        }
    }
    connection.send(JSON.stringify(_data))
    connection.on('message', function(data) {
        try {
            var msg = JSON.parse(data.utf8Data);
            response.json(msg);
        } catch (e) {
            next()
        }
    });

}

function accountMerge(request, response, next) {
    var _data = {
        command : "submit",
        secret : request.query.secret || config.HOT_WALLET.secret,
        tx_json : {
            Account : request.query.account || config.HOT_WALLET.address,
            Destination : request.query.destination || config.COLD_WALLET,
            TransactionType : "AccountMerge"
        }
    }
    connection.send(JSON.stringify(_data))
    connection.on('message', function(data) {
        try {
            var msg = JSON.parse(data.utf8Data);
            response.json(msg);
        } catch (e) {
            next()
        }
    });

}

function setDestinationFlag(request, response, next) {
    var _data = {
        command : "submit",
        secret : request.query.secret || config.HOT_WALLET.secret,
        tx_json : {
            Account : request.query.account || config.HOT_WALLET.address,
            Flags: "65536",
            TransactionType : "AccountSet",
            SetFlag: request.query.flag || 1
        }
    }
    connection.send(JSON.stringify(_data))

    connection.on('message', function(data) {
        try {
            var msg = JSON.parse(data.utf8Data);
            response.json(msg);
        } catch (e) {
            next()
        }
    });
}

function transactionWithDestinationTag(request, response, next) {
    var _data = {
        command : "submit",
        secret :  request.query.secret,
        tx_json : {
            Account : request.query.account,
            Amount : {
                currency:request.query.currency ||"XRP",
                value:request.query.value || "100000",
                issuer: request.query.issuer || config.COLD_WALLET
            },
            Destination : request.query.destination || config.HOT_WALLET.address,
            TransactionType : "Payment",
            DestinationTag: request.query.dt || "222"
        }
    }
    connection.send(JSON.stringify(_data))
    connection.on('message', function(data) {

        try {
            var msg = JSON.parse(data.utf8Data);
            response.json(msg);
        } catch (e) {
            next()
        }
    });

}

//function offerTransaction(request, response, next) {
//
//    var _data = {
//        command: "submit",
//        secret: "s3q5ZGX2ScQK2rJ4JATp7rND6X5npG3De8jMbB7tuvm2HAVHcCN",
//        tx_json: {
//            TransactionType: "OfferCreate",
//            Account: "ganVp9o5emfzpwrG5QVUXqMv8AgLcdvySb",
//            TakerGets: {
//                currency: "USD",
//                value: "1500",
//                issuer: "ghj4kXtHfQcCaLQwpLJ11q2hq6248R7k9C"
//            },
//            TakerPays: {
//                currency: "BTC",
//                value: "2.5",
//                issuer: "ghj4kXtHfQcCaLQwpLJ11q2hq6248R7k9C"
//            }
//        }
//    }
//    connection.send(JSON.stringify(_data))
//    connection.on('message', function(data) {
//        try {
//            var msg = JSON.parse(data.utf8Data);
//            response.json(msg);
//        } catch (e) {
//            next()
//        }
//
//    });
//}

function infoHashTransaction(request, response, next) {

    var _data = {
        command : "tx",
        transaction: request.query.hash || config.LAST_PAYMENT_HASH
    }
    connection.sendUTF(JSON.stringify(_data))
    connection.on('message', function(data) {
        try {
            var msg = JSON.parse(data.utf8Data);
            response.json(msg);
        } catch (e) {
            next()
        }

    });
}


function generateHotWallet(request, response, next) {

    var _data = { command : "create_keys" }
    connection.send(JSON.stringify(_data))
    connection.on('message', function(data) {
        try {
            var msg = JSON.parse(data.utf8Data);
            response.json(msg);
        } catch (e) {
            next()
        }
    });

}
function subscribe(request, response, next) {

    var _data = {
        command : "subscribe",
        accounts : [ config.COLD_WALLET ]
    }
    connection.send(JSON.stringify(_data))
    connection.on('message', function(data) {
        console.log('<><><><><><><><><><')
        console.log(data.utf8Data)
        console.log('<><><><><><><><><><')
        try {
            var msg = JSON.parse(data.utf8Data);
            response.json(msg);
        } catch (e) {
            next()
        }
    });

}

function accountLines(request, response, next) {

    var _data = {
        command: "account_lines",
//        id: 24,
        account: request.query.account || config.COLD_WALLET
    }
    connection.send(JSON.stringify(_data))
    connection.on('message', function(data) {
        try {
            var msg = JSON.parse(data.utf8Data);
            response.json(msg);
        } catch (e) {
            next()
        }
    });

}

function setRegularKey(request, response, next) {

    var _data = { command : "SetRegularKey" }
    connection.send(JSON.stringify(_data))
    connection.on('message', function(data) {
        try {
            var msg = JSON.parse(data.utf8Data);
            response.json(msg);
        } catch (e) {
            next()
        }
    });
}

    // server info
//    remote.request_server_info(function(err, res) {
//        if (err) {
//            console.log('<><><errrrrr<><',err, res)
//        } else {
//            console.log('<><>res<<><',err, res)
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
