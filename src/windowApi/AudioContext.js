// Separate out window resource into separate module mainly
// for ease of unit testing

export const ctxt =
	window.AudioContext ||
	window.webkitAudioContext;
