'use strict';

/**
 * Module dependencies.
 */

const raw = require('raw-body');
const inflate = require('inflation');
const utils = require('./utils');
const msgpack = require('@msgpack/msgpack');

/**
 * Return a Promise which parses msgpack requests.
 *
 * Pass a node request or an object with `.req`,
 * such as a koa Context.
 *
 * @param {Request} req
 * @param {Options} [opts]
 * @return {Function}
 * @api public
 */

module.exports = async function(req, opts) {
  req = req.req || req;
  opts = utils.clone(opts);

  // defaults
  const len = req.headers['content-length'];
  const encoding = req.headers['content-encoding'] || 'identity';
  if (len && encoding === 'identity') opts.length = ~~len;
  opts.limit = opts.limit || '1mb';

  const str = await raw(inflate(req), opts);
  try {
    const parsed = parse(str);
    return opts.returnRawBody ? { parsed, raw: str } : parsed;
  } catch (err) {
    err.status = 400;
    err.body = str;
    throw err;
  }

  function parse(str) {
    return msgpack.decode(str);
  }
};
