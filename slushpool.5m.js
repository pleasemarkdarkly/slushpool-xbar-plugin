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

* I understand the view key is provided, this is to show the plugin works and the permissions for this key example are read-only.
* Removed the dependancy to bitbar node module to avoid node related issues.

*/

const https = require('https');
const child_process = require('child_process');
const { once } = require('events');

const SLUSHPOOL_MINING_ICON = `⛏️`;
const BITCOIN_ICON = 'iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAQAAABLCVATAAAACXBIWXMAABYlAAAWJQFJUiTwAAABY0lEQVRIx2P4z0AdyEBzg1DAdIYfQJgCZHmCWdsYMAFRBs0BC2UAWT5g1p6hbZAggwIcrgALVQNZSWDWAQY24g3qwRtJ/xgeMqxkCGJgotQgGLzAoEUdg/4zvGQQIxzYLAyODF/gQv0MlgwWDK4MOQxbgV5DKG0nLtZ2wIUykII2EMmoU8QZtAWrQQwMB+HiDygzaDNc/CQlBskwfIKLN5JrkAxDFsMTuOh9BiFSDXoHDI2HDB9RlJ1kECc2r20hkI5OMXhQxyAQzCTNoDJgaAgAvaLLEMkwn+EbkuLvDBLkR78yUoD/Z0gn3yAGhnwk5V2UGBRGLYNmICkvIGzQLqwG8TA0oJQAVvgMymcoYehg+AUXWgoM0kygWC/DbpQ4+89wjYERt0FiRNeNX4GlFJ505EykMacZDPGn7HwCBnxiOMcwjcGJcOEvzqADh2vBQk1AVhaYdZCBc7TKpqJBA9ZiAwDMH49EXcmY2QAAAABJRU5ErkJggg=='

// due to the error prone nature of the above path, dependancies, etc, edit script directly vs. .env
const VAR_SLUSHPOOL_API_KEY = 'Zm1oK8hGaDExOBaE';
let slushpool_api_token = VAR_SLUSHPOOL_API_KEY;

let BTC_EXISTING_BALANCE = 0.78711908;
let USD_EXISTING_BTC_BALANCE = 0;

const numberWithCommas = (x) => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

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

/*
	Compute ongoing mining balances/estimates, existing balances.
*/
const collectSlushpoolInfo = async () => {
	try {
		const profile = await getSlushpoolProfile(slushpool_api_token);
		const stats = await getSlushpoolStats(slushpool_api_token);
		const { confirmed_reward, unconfirmed_reward, estimated_reward } = profile;
		let reward = {};
		reward.usd_confirmed_reward = await getBTCToUSD(parseFloat(confirmed_reward));
		reward.usd_unconfirmed_reward = await getBTCToUSD(parseFloat(unconfirmed_reward));
		reward.usd_estimated_reward = await getBTCToUSD(parseFloat(estimated_reward));
		// include any permuation of confirmed, unconfirmed, estimate, existing BTC or USD here
		USD_EXISTING_BTC_BALANCE = await getBTCToUSD(parseFloat(BTC_EXISTING_BALANCE));
		return { profile, stats, reward, total_btc_in_usd: USD_EXISTING_BTC_BALANCE };
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

const SLUSHPOOL_URL = 'href=https://slushpool.com/dashboard/?c=btc';
const REFRESH_FALSE = 'refresh=false';
const SEPARATOR = '---';

const printBitbar = async (bitbar) => {
	const { profile, stats, reward, total_btc_in_usd } = bitbar;
	const { confirmed_reward, unconfirmed_reward, estimated_reward, hash_rate_unit, hash_rate_5m, hash_rate_60m, hash_rate_24h, ok_workers } = profile;
	const { worker_keys, workers } = stats;

	// Show in the menu if a worker is off 
	worker_keys.forEach(k => {
		if (workers[k].state == 'off') {
			const worker_name = k.split('.')[1];
			console.log(`${worker_name.toLowerCase()}`);
		};
	});
	console.log(`${SLUSHPOOL_MINING_ICON} ${numberWithCommas(parseFloat(hash_rate_5m).toFixed(2))} ${hash_rate_unit} (5m)`);
	console.log(`${SLUSHPOOL_MINING_ICON} ${numberWithCommas(parseFloat(hash_rate_60m).toFixed(2))} ${hash_rate_unit} (60m)`);
	console.log(`${SLUSHPOOL_MINING_ICON} ${numberWithCommas(parseFloat(hash_rate_24h).toFixed(2))} ${hash_rate_unit} (24h)`)
	console.log(SEPARATOR);
	console.log(`${confirmed_reward}/\$${parseFloat(reward.usd_confirmed_reward).toFixed(2)} (confirmed reward) | templateImage=${BITCOIN_ICON}`);
	console.log(`${unconfirmed_reward}/\$${parseFloat(reward.usd_unconfirmed_reward).toFixed(2)} (unconfirmed reward) | templateImage=${BITCOIN_ICON}`);
	console.log(`${estimated_reward}/\$${parseFloat(reward.usd_estimated_reward).toFixed(2)} (estimated reward) | templateImage=${BITCOIN_ICON}`);
	console.log(SEPARATOR);
	console.log(`OK workers (${ok_workers}) | ${SLUSHPOOL_URL}`)
	worker_keys.forEach(k => {
		if (workers[k].state == 'OK') {
			const worker_name = k.split('.')[1];
			console.log(SEPARATOR);
			console.log(`${worker_name.toLowerCase()}`);
			console.log(`${numberWithCommas(parseFloat(workers[k].last_share))} (last share)`)
			console.log(`${numberWithCommas(parseFloat(workers[k].hash_rate_5m))} ${workers[k].hash_rate_unit} (5m)`);
			console.log(`${numberWithCommas(parseFloat(workers[k].hash_rate_60m))} ${workers[k].hash_rate_unit} (60m)`);
			console.log(`${numberWithCommas(parseFloat(workers[k].hash_rate_24h))} ${workers[k].hash_rate_unit} (24h)`);
		}
	});
	console.log(SEPARATOR); // existing balance 
	console.log(`${BTC_EXISTING_BALANCE} \$${numberWithCommas(parseFloat(USD_EXISTING_BTC_BALANCE).toFixed(2))} | ${REFRESH_FALSE} templateImage=${BITCOIN_ICON}`);
};

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
