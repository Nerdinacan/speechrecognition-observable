'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _AudioContext = require('./AudioContext');

Object.defineProperty(exports, 'AudioContext', {
  enumerable: true,
  get: function get() {
    return _AudioContext.ctxt;
  }
});

var _SpeechRecognition = require('./SpeechRecognition');

Object.defineProperty(exports, 'SpeechRecognition', {
  enumerable: true,
  get: function get() {
    return _SpeechRecognition.ctxt;
  }
});