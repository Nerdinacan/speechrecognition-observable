/**
 * Creates on observable from the SpeechRecognition API
 */

import { Observable } from 'rxjs/Observable';
import { SpeechRecognition } from './windowApi';
import hash from 'object-hash';


// Store rawSpeech observables, index by hash created from
// requested parameters
let storage = {};


export function RawSpeech(options = {}) {

	// cache emiter by requested options
	let key = hash(options);
	if (key in storage) {
		return storage[key];
	}

	return Observable.create((observer) => {

		let instance = null;

		if (!SpeechRecognition) {
			observer.error("Speech recognition unsupported.");
			observer.complete();
		} else {
			instance = buildInstance(observer, options);
			instance.start();
			storage[key] = instance;
		}

		// Unsubscription
		return function() {
			if (instance) {
				instance.userStop = true;
				instance.stop();
			}
			delete storage[key];
		};

	});
}


export function buildInstance(observer, {
	lang = "en",
	maxAlternatives = 1,
	continuous = true,
	interimResults = false,
	autoRestart = true
} = {}) {

	// generic handlers

	let passThru = (evt) => {
		// console.log('passThru', evt);
		observer.next(evt)
	};

	let passError = (err) => {
		// console.log('passError', err);
		observer.error(err)
	};


	let recognition = new SpeechRecognition();
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
	recognition.onaudioend = (evt) => {
		// console.log('RawSpeech onaudioend');
		passThru(evt);
		// recognition.stop();
	}

	// when speech recog service has disconnected.
	// Possibly restart if this event was not user- initiated
	recognition.onend = (evt) => {
		// console.log('RawSpeech onend', autoRestart, recognition.userStop);
		passThru(evt);
		if (autoRestart && !recognition.userStop) {
			recognition.start();
		} else {
			observer.complete();
		}
	}



	// Engine results

	// speech has been detected and engine has results
	recognition.onresult = passThru;

	// speech has been detected, but little confidence in results
	recognition.onnomatch = passError; // passError;

	// exceptions
	recognition.onerror = (evt) => {

		// console.log('recognition.onerror', evt);

		switch (evt.error) {

			// Stop capture in these scenarios but don't
			// consider it to be an error
			case 'aborted': // somebody shut it down
				recognition.userStop = true;
				observer.complete();
				break;

			case 'no-speech': // it can just time out
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
