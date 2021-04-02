#!/usr/bin/env /usr/local/bin/node

const https = require('https');
const child_process = require('child_process');
const { once } = require('events');

const BITCOIN_ICON = 'iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAQAAABLCVATAAAACXBIWXMAABYlAAAWJQFJUiTwAAABY0lEQVRIx2P4z0AdyEBzg1DAdIYfQJgCZHmCWdsYMAFRBs0BC2UAWT5g1p6hbZAggwIcrgALVQNZSWDWAQY24g3qwRtJ/xgeMqxkCGJgotQgGLzAoEUdg/4zvGQQIxzYLAyODF/gQv0MlgwWDK4MOQxbgV5DKG0nLtZ2wIUykII2EMmoU8QZtAWrQQwMB+HiDygzaDNc/CQlBskwfIKLN5JrkAxDFsMTuOh9BiFSDXoHDI2HDB9RlJ1kECc2r20hkI5OMXhQxyAQzCTNoDJgaAgAvaLLEMkwn+EbkuLvDBLkR78yUoD/Z0gn3yAGhnwk5V2UGBRGLYNmICkvIGzQLqwG8TA0oJQAVvgMymcoYehg+AUXWgoM0kygWC/DbpQ4+89wjYERt0FiRNeNX4GlFJ505EykMacZDPGn7HwCBnxiOMcwjcGJcOEvzqADh2vBQk1AVhaYdZCBc7TKpqJBA9ZiAwDMH49EXcmY2QAAAABJRU5ErkJggg=='
const VAR_SLUSHPOOL_API_KEY = 'Zm1oK8hGaDExOBaE'; // process.env.VAR_SLUSHPOOL_API_KEY;
let slushpool_api_token = VAR_SLUSHPOOL_API_KEY;

let BTC_BALANCE = 0.78711908; 	// Example amount to track
let BTC_REWARD_BALANCE = 0;
let BTC_TO_USD = 0;

const getBTCToUSD = async (amount) => {
	let result;
	options = {
		hostname: 'rate.sx',
		port: 443,
		path: '/' + amount.toString() + 'BTC',
		method: 'GET',
	}

	req = await https.request(options, res => {
		res.on('data', d => { result = d.toString(); });
	});

	req.on('error', error => { console.error(error); });
	req.end();
	await once(req, 'close')
	return result
};

const getSlushpoolProfile = async (apikey) => {
	let result;
	const headers = { 'User-Agent': 'request', 'SlushPool-Auth-Token': apikey };
	let options = {
		hostname: 'slushpool.com',
		port: 443,
		path: '/accounts/profile/json/btc/',
		method: 'GET',
		headers: headers,
	};

	let req = await https.get(options, res => {
		let json = '';
		res.on('data', function (chunk) { json += chunk; });
		res.on('end', async () => {
			if (res.statusCode === 200) {
				try {
					let data = JSON.parse(json);
					result = data.btc;
				} catch (e) { console.log('Error parsing JSON!'); }
			} else { console.log('Status:', res.statusCode); }
		});
	}).on('error', function (err) { console.log('Error:', err); });
	await once(req, 'close')
	return result
};

const getSlushpoolStats = async (apikey) => {
	let result;
	const headers = { 'User-Agent': 'request', 'SlushPool-Auth-Token': apikey };
	let options = {
		hostname: 'slushpool.com',
		port: 443,
		path: '/accounts/workers/json/btc/',
		method: 'GET',
		headers: headers,
	};

	let req = await https.get(options, res => {
		let json = '';
		res.on('data', function (chunk) { json += chunk; });
		res.on('end', function () {
			if (res.statusCode === 200) {
				try {
					let data = JSON.parse(json);
					let worker_keys = Array.from(Object.keys(data.btc.workers));
					result = { worker_keys, ...data.btc, };
				} catch (e) { console.log('Error parsing JSON!'); }
			} else { console.log('Status:', res.statusCode); }
		});
	}).on('error', function (err) {
		console.log('Error:', err);
	});
	await once(req, 'close')
	return result
};

const collectSlushpoolInfo = async () => {
	try {
		const profile = await getSlushpoolProfile(slushpool_api_token);
		const stats = await getSlushpoolStats(slushpool_api_token);
		const { confirmed_reward, unconfirmed_reward, estimated_reward } = profile;
		const amount = (parseFloat(confirmed_reward) + parseFloat(unconfirmed_reward) + parseFloat(BTC_BALANCE));
		BTC_TO_USD = await getBTCToUSD(amount);
		return { profile, stats, total_btc: amount, total_btc_in_usd: BTC_TO_USD };
	} catch (error) {
		return error;
	}
}

(async () => {

	let boldColor = 'white';

	try {
		child_process.execSync('defaults read -g AppleInterfaceStyle', { stdio: 'ignore' });
	} catch (err) {
		// AppleInterfaceStyle not set, which means user has light menu bar style
		boldColor = 'black';
	}

	const bitbar = await collectSlushpoolInfo();
	const { profile, stats, total_btc, total_btc_in_usd } = bitbar;
	const { estimated_reward, hash_rate_unit, hash_rate_5m, hash_rate_60m, hash_rate_24h, ok_workers } = profile;
	console.log(`${total_btc} BTC, \$${parseFloat(total_btc_in_usd).toFixed(2)}`);
	console.log(`${parseFloat(hash_rate_5m).toFixed(2)}(5m) ${hash_rate_unit},${parseFloat(hash_rate_60m).toFixed(2)}(60m) ${hash_rate_unit},${parseFloat(hash_rate_24h).toFixed(2)}(24/h) ${hash_rate_unit}`);
	console.log(`OK WORKERS: ${ok_workers}`);
	const { worker_keys, workers } = stats;
	worker_keys.forEach(k => {
		if (workers[k].state == 'OK') { console.log(k); console.log(workers[k]); }
	})
})();
