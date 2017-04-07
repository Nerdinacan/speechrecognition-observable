// Get vendor-specific speech tech and create a low-level
// observable to monitor responses from speech recognition tech

export const ctxt =
	window.SpeechRecognition ||
	window.webkitSpeechRecognition ||
	window.mozSpeechRecognition ||
	window.msSpeechRecognition ||
	window.oSpeechRecognition;