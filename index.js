'use strict';

var GetIntrinsic = require('get-intrinsic');
require('call-bound');
var inspect = require('object-inspect');
var getSideChannelMap = require('side-channel-map');
var $TypeError = require('es-errors/type');
var $WeakMap = GetIntrinsic('%WeakMap%', true);
var getStorage = require('./storage');

/**
 * @template K, V
 * @returns {{ assert: (key: K) => void, 'delete': (key: K) => boolean, get: (key: K) => V | undefined, has: (key: K) => boolean, set: (key: K, value: V) => void }}
 */
var createChannel = function getSideChannelWeakMap() {
	/** @typedef {{ assert: (key: K) => void, 'delete': (key: K) => boolean, get: (key: K) => V | undefined, has: (key: K) => boolean, set: (key: K, value: V) => void }} Channel */

	/** @type {{ 'delete': (key: K) => boolean, get: (key: K) => V | undefined, has: (key: K) => boolean, set: (key: K, value: V) => void }} */
	var storage = getStorage();

	/** @type {Channel} */
	var channel = {
		assert: function (key) {
			if (!channel.has(key)) {
				throw new $TypeError('Side channel does not contain ' + inspect(key));
			}
		},
		'delete': storage['delete'],
		get: storage.get,
		has: storage.has,
		set: storage.set
	};

	return channel;
};

module.exports = $WeakMap ? createChannel : getSideChannelMap;
