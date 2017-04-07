"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
// Get vendor-specific speech tech and create a low-level
// observable to monitor responses from speech recognition tech

var ctxt = exports.ctxt = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition || window.oSpeechRecognition;