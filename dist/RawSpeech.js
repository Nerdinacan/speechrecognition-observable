'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.RawSpeech = RawSpeech;
exports.buildInstance = buildInstance;

var _Observable = require('rxjs/Observable');

var _windowApi = require('./windowApi');

var _objectHash = require('object-hash');

var _objectHash2 = _interopRequireDefault(_objectHash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Store rawSpeech observables, index by hash created from
// requested parameters
var storage = {}; /**
                   * Creates on observable from the SpeechRecognition API
                   */

function RawSpeech() {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


	// cache emiter by requested options
	var key = (0, _objectHash2.default)(options);
	if (key in storage) {
		return storage[key];
	}

	return _Observable.Observable.create(function (observer) {

		var instance = null;

		if (!_windowApi.SpeechRecognition) {
			observer.error("Speech recognition unsupported.");
			observer.complete();
		} else {
			instance = buildInstance(observer, options);
			instance.start();
			storage[key] = instance;
		}

		// Unsubscription
		return function () {
			if (instance) {
				instance.userStop = true;
				instance.stop();
			}
			delete storage[key];
		};
	});
}

function buildInstance(observer) {
	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$lang = _ref.lang,
	    lang = _ref$lang === undefined ? "en" : _ref$lang,
	    _ref$maxAlternatives = _ref.maxAlternatives,
	    maxAlternatives = _ref$maxAlternatives === undefined ? 1 : _ref$maxAlternatives,
	    _ref$continuous = _ref.continuous,
	    continuous = _ref$continuous === undefined ? true : _ref$continuous,
	    _ref$interimResults = _ref.interimResults,
	    interimResults = _ref$interimResults === undefined ? false : _ref$interimResults,
	    _ref$autoRestart = _ref.autoRestart,
	    autoRestart = _ref$autoRestart === undefined ? true : _ref$autoRestart;

	// generic handlers

	var passThru = function passThru(evt) {
		// console.log('passThru', evt);
		observer.next(evt);
	};

	var passError = function passError(err) {
		// console.log('passError', err);
		observer.error(err);
	};

	var recognition = new _windowApi.SpeechRecognition();
	recognition.lang = lang;
	recognition.continuous = continuous;
	recognition.interimResults = interimResults;
	recognition.maxAlternatives = maxAlternatives;

	// Custom Flags
	recognition.userStop = false;

	// when start method is called
	recognition.onstart = passThru;

	// when browser begins capturing audio input
	recognition.onaudiostart = passThru;

	// when any noise has been detected
	recognition.onsoundstart = passThru;

	// fired when speech has been detected
	recognition.onspeechstart = passThru;

	// when speech is no longer detected
	recognition.onspeechend = passThru;

	// when sound is no longer detected
	recognition.onsoundend = passThru;

	// browser is no longer capturing audio from the mic
	recognition.onaudioend = function (evt) {
		// console.log('RawSpeech onaudioend');
		passThru(evt);
		// recognition.stop();
	};

	// when speech recog service has disconnected.
	// Possibly restart if this event was not user- initiated
	recognition.onend = function (evt) {
		// console.log('RawSpeech onend', autoRestart, recognition.userStop);
		passThru(evt);
		if (autoRestart && !recognition.userStop) {
			recognition.start();
		} else {
			observer.complete();
		}
	};

	// Engine results

	// speech has been detected and engine has results
	recognition.onresult = passThru;

	// speech has been detected, but little confidence in results
	recognition.onnomatch = passError; // passError;

	// exceptions
	recognition.onerror = function (evt) {

		// console.log('recognition.onerror', evt);

		switch (evt.error) {

			// Stop capture in these scenarios but don't
			// consider it to be an error
			case 'aborted':
				// somebody shut it down
				recognition.userStop = true;
				observer.complete();
				break;

			case 'no-speech':
				// it can just time out
				recognition.userStop = false;
				observer.next(evt);
				break;

			case 'network': // can't talk to network
			case 'not-allowed': // user denies
			case 'service-not-allowed': // user privacy settings blocked it
			case 'bad-grammar': // no grammer supported yet
			case 'language-not-supported':
				autoRestart = false;
				evt.fatal = true;
				observer.error(evt);
				break;

			default:
				observer.error(evt);
				break;
		}
	};

	return recognition;
}