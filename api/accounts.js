const Wallet  = require('stellar-lib').Wallet;
const errors  = require('./../lib/errors.js');
const respond = require('./../lib/response-handler.js');

module.exports = {
  generate: generate
};

function generate(request, response, next) {
  var wallet = Wallet.generate();
  if (wallet) {
    respond.success(response, { account: wallet });
  } else {
    next(new errors.ApiError('Could not generate wallet'));
  }
}