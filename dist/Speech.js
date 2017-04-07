'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Speech = Speech;

var _Observable = require('rxjs/Observable');

require('rxjs/add/operator/filter');

require('rxjs/add/operator/map');

require('rxjs/add/operator/share');

require('rxjs/add/operator/mergeMap');

require('rxjs/add/operator/do');

var _RawSpeech = require('./RawSpeech');

// flatMap
function Speech() {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


	return (0, _RawSpeech.RawSpeech)(options).filter(function (e) {
		return e.type == 'result';
	}).map(function (e) {
		return e.results[e.resultIndex];
	}).filter(function (srr) {
		return srr.isFinal;
	}).flatMap(function (srr) {
		return srr;
	}).filter(function (sra) {
		return sra.confidence > 0.5;
	}).map(function (sra) {
		return sra.transcript;
	}).share();
} /**
   * Processes raw speech recognition results
   */