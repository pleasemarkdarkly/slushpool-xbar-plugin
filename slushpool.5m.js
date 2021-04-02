#!/usr/bin/env /usr/local/bin/node

/*
# Slushpool Monitoring Xbar Plugin
#
# < xbar.title > Slushpool User Account Monitor Plugin </xbar.title >
# < xbar.version > v1.0</xbar.version >
# < xbar.author >Mark Phillips</xbar.author >
# < xbar.author.github >pleasemarkdarkly </xbar.author.github >
# < xbar.desc > Displays Slushpool Account/Worker Stats </xbar.desc >
# < xbar.image > https://github.com/pleasemarkdarkly/slushpool-xbar-plugin/images/plugin.jpg </xbar.image>
# < xbar.dependencies > bash </xbar.dependencies >
# < xbar.abouturl > https://github.com/pleasemarkdarkly/slushpool-xbar-plugin/Readme.md </xbar.abouturl>

# Variables become preferences in the app:
#
# < xbar.var > string(VAR_SLUSHPOOL_API_KEY=""): API key to get access to remote data from slushpool.</xbar.var >
# < xbar.var > boolean(VAR_VERBOSE = true): Whether to be verbose or not.</xbar.var >
# < xbar.var > list(VAR_STYLE = "normal"): Which style to use. [small, normal, big]</xbar.var >

To convert an image to use with this plugin, use the command `openssl base64 -A -in` with the file and replace with the constant below.
*/

const https = require('https');
const child_process = require('child_process');
const { once } = require('events');

const SLUSHPOOL_MINING_ICON = `⛏️`;
const BITCOIN_ICON = 'iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAQAAABLCVATAAAACXBIWXMAABYlAAAWJQFJUiTwAAABY0lEQVRIx2P4z0AdyEBzg1DAdIYfQJgCZHmCWdsYMAFRBs0BC2UAWT5g1p6hbZAggwIcrgALVQNZSWDWAQY24g3qwRtJ/xgeMqxkCGJgotQgGLzAoEUdg/4zvGQQIxzYLAyODF/gQv0MlgwWDK4MOQxbgV5DKG0nLtZ2wIUykII2EMmoU8QZtAWrQQwMB+HiDygzaDNc/CQlBskwfIKLN5JrkAxDFsMTuOh9BiFSDXoHDI2HDB9RlJ1kECc2r20hkI5OMXhQxyAQzCTNoDJgaAgAvaLLEMkwn+EbkuLvDBLkR78yUoD/Z0gn3yAGhnwk5V2UGBRGLYNmICkvIGzQLqwG8TA0oJQAVvgMymcoYehg+AUXWgoM0kygWC/DbpQ4+89wjYERt0FiRNeNX4GlFJ505EykMacZDPGn7HwCBnxiOMcwjcGJcOEvzqADh2vBQk1AVhaYdZCBc7TKpqJBA9ZiAwDMH49EXcmY2QAAAABJRU5ErkJggg=='
const VAR_SLUSHPOOL_API_KEY = 'Zm1oK8hGaDExOBaE'; // process.env.VAR_SLUSHPOOL_API_KEY;
let slushpool_api_token = VAR_SLUSHPOOL_API_KEY;

let BTC_BALANCE = 0.75; // Previous or additional balance to track
let BTC_REWARD_BALANCE = 0;
let BTC_TO_USD = 0;

let hash_rates = [];
let workers = [];

const getBTCToUSD = async (amount) => {
	let result;
	options = {
		hostname: 'rate.sx',
		port: 443,
		path: '/' + amount.toString() + 'BTC',
		method: 'GET',
	}

	req = await https.request(options, res => {
		res.on('data', d => {
			// console.log(d.toString());
			result = d.toString();
		});
	});
	req.on('error', error => { console.error(error); });
	req.end();
	await once(req, 'close')
	return result
};

const getSlushpoolProfile = async (apikey) => {
	let result;
	let pending_rewards;
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
		res.on('data', function (chunk) {
			json += chunk;
		});

		res.on('end', async () => {
			if (res.statusCode === 200) {
				try {
					let data = JSON.parse(json);
					result = data.btc;
				} catch (e) {
					console.log('Error parsing JSON!');
				}
			} else {
				console.log('Status:', res.statusCode);
			}
		});
	}).on('error', function (err) {
		console.log('Error:', err);
	});
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
		res.on('data', function (chunk) {
			json += chunk;
		});
		res.on('end', function () {
			if (res.statusCode === 200) {
				try {
					let data = JSON.parse(json);
					let worker_keys = Array.from(Object.keys(data.btc.workers));
					result = { worker_keys, ...data.btc, };
				} catch (e) {
					console.log('Error parsing JSON!');
				}
			} else {
				console.log('Status:', res.statusCode);
			}
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

const debugSlushpoolOutputAndFormat = async (bitbar) => {
	const { profile, stats, total_btc, total_btc_in_usd } = bitbar;
	const { estimated_reward, hash_rate_unit, hash_rate_5m, hash_rate_60m, hash_rate_24h, ok_workers } = profile;
	console.log(`${total_btc} BTC, \$${parseFloat(total_btc_in_usd).toFixed(2)} `);
	console.log(`${parseFloat(hash_rate_5m).toFixed(2)} (5m) ${hash_rate_unit}, ${parseFloat(hash_rate_60m).toFixed(2)} (60m) ${hash_rate_unit}, ${parseFloat(hash_rate_24h).toFixed(2)} (24 / h) ${hash_rate_unit}, OK WORKERS: ${ok_workers} `);
	const { worker_keys, workers } = stats;
	worker_keys.forEach(k => {
		if (workers[k].state == 'OK') {
			console.log(k);
			console.log(workers[k]);
		}
	});
}

const printBitbar = async (bitbar) => {
	console.log(`⛏️`);
}

(async () => {

	let boldColor = 'white';

	try {
		child_process.execSync('defaults read -g AppleInterfaceStyle', { stdio: 'ignore' });
	} catch (err) {
		// AppleInterfaceStyle not set, which means user has light menu bar style
		boldColor = 'black';
	}

	// verify key information is available
	const bitbar = await collectSlushpoolInfo();
	// debugSlushpoolOutputAndFormat(bitbar);
	printBitbar(bitbar);

})();
