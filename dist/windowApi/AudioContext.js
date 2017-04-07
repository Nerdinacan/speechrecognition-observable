"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
// Separate out window resource into separate module mainly
// for ease of unit testing

var ctxt = exports.ctxt = window.AudioContext || window.webkitAudioContext;