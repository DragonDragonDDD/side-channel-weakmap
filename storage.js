'use strict';

var GetIntrinsic = require('get-intrinsic');
var callBound = require('call-bound');
var getSideChannelMap = require('side-channel-map/storage');

var $WeakMap = GetIntrinsic('%WeakMap%', true);

/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K) => V} */
var $weakMapGet = callBound('WeakMap.prototype.get', true);
/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K, value: V) => void} */
var $weakMapSet = callBound('WeakMap.prototype.set', true);
/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K) => boolean} */
var $weakMapHas = callBound('WeakMap.prototype.has', true);
/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K) => boolean} */
var $weakMapDelete = callBound('WeakMap.prototype.delete', true);

/**
 * @template K, V
 * @returns {{ 'delete': (key: K) => boolean, get: (key: K) => V | undefined, has: (key: K) => boolean, set: (key: K, value: V) => void }}
 */
var createStorage = function getStorage() {
	/** @typedef {{ 'delete': (key: K) => boolean, get: (key: K) => V | undefined, has: (key: K) => boolean, set: (key: K, value: V) => void }} Channel */

	/** @type {WeakMap<K & object, V> | undefined} */ var $wm;
	/** @type {Channel | undefined} */ var $m;

	/** @type {Channel} */
	var channel = {
		'delete': function (key) {
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				if ($wm) {
					return $weakMapDelete($wm, key);
				}
			} else if (getSideChannelMap) {
				if ($m) {
					return $m['delete'](key);
				}
			}
			return false;
		},
		get: function (key) {
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				if ($wm) {
					return $weakMapGet($wm, key);
				}
			}
			return $m && $m.get(key);
		},
		has: function (key) {
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				if ($wm) {
					return $weakMapHas($wm, key);
				}
			}
			return !!$m && $m.has(key);
		},
		set: function (key, value) {
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				if (!$wm) {
					$wm = new $WeakMap();
				}
				$weakMapSet($wm, key, value);
			} else if (getSideChannelMap) {
				if (!$m) {
					$m = getSideChannelMap();
				}
				// eslint-disable-next-line no-extra-parens
				/** @type {NonNullable<typeof $m>} */ ($m).set(key, value);
			}
		}
	};

	// @ts-expect-error TODO: figure out why this is erroring
	return channel;
};

module.exports = $WeakMap ? createStorage : getSideChannelMap;
