/**
 * Processes raw speech recognition results, caches speech
 * observable instances by options hash
 */

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/mergeMap'; // flatMap
import 'rxjs/add/operator/do';

import { RawSpeech } from 'RawSpeech';

export function Speech(options = {}) {

	return RawSpeech(options)
			.filter(e => e.type == 'result')
			.map(e => e.results[e.resultIndex])
			.filter(srr => srr.isFinal)
			.flatMap(srr => srr)
			.filter(sra => sra.confidence > 0.5)
			.map(sra => sra.transcript)
			.share();
}
