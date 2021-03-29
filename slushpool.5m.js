#!/usr/bin/env /usr/local/bin/node
const bitbar = require('bitbar');
/*
# Slushpool Monitoring Xbar Plugin
#
# < xbar.title > Slushpool User Account Monitor Plugin </xbar.title >
# < xbar.version > v1.0</xbar.version >
# < xbar.author > Mark Phillips</xbar.author >
# < xbar.author.github > pleasemarkdarkly </xbar.author.github >
# < xbar.desc > Displays Slushpool Account/Worker Stats </xbar.desc >
# < xbar.image > https://github.com/pleasemarkdarkly/slushpool-xbar-plugin/images/plugin.jpg </xbar.image>
# < xbar.dependencies > bash </xbar.dependencies >
# < xbar.abouturl > https://github.com/pleasemarkdarkly/slushpool-xbar-plugin/Readme.md </xbar.abouturl>

# Variables become preferences in the app:
#
# < xbar.var > string(VAR_SLUSHPOOL_API_KEY=""): API key to get access to remote data from slushpool.</xbar.var >
# < xbar.var > boolean(VAR_VERBOSE = true): Whether to be verbose or not.</xbar.var >
# < xbar.var > list(VAR_STYLE = "normal"): Which style to use. [small, normal, big]</xbar.var >

Use curl rate.sx/0.75BTC
*/

(async () => {

	const child_process = require('child_process');
	const https = require('https');

	const BITCOIN_ICON = 'iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAQAAABLCVATAAAACXBIWXMAABYlAAAWJQFJUiTwAAABY0lEQVRIx2P4z0AdyEBzg1DAdIYfQJgCZHmCWdsYMAFRBs0BC2UAWT5g1p6hbZAggwIcrgALVQNZSWDWAQY24g3qwRtJ/xgeMqxkCGJgotQgGLzAoEUdg/4zvGQQIxzYLAyODF/gQv0MlgwWDK4MOQxbgV5DKG0nLtZ2wIUykII2EMmoU8QZtAWrQQwMB+HiDygzaDNc/CQlBskwfIKLN5JrkAxDFsMTuOh9BiFSDXoHDI2HDB9RlJ1kECc2r20hkI5OMXhQxyAQzCTNoDJgaAgAvaLLEMkwn+EbkuLvDBLkR78yUoD/Z0gn3yAGhnwk5V2UGBRGLYNmICkvIGzQLqwG8TA0oJQAVvgMymcoYehg+AUXWgoM0kygWC/DbpQ4+89wjYERt0FiRNeNX4GlFJ505EykMacZDPGn7HwCBnxiOMcwjcGJcOEvzqADh2vBQk1AVhaYdZCBc7TKpqJBA9ZiAwDMH49EXcmY2QAAAABJRU5ErkJggg=='
	const VAR_SLUSHPOOL_API_KEY = 'Zm1oK8hGaDExOBaE'; // process.env.VAR_SLUSHPOOL_API_KEY;

	const CONVERT_BTC_TO_USD = 'rate.sx/'
	const BTC_BALANCE = 0.75;

	let slushpool_api_token = VAR_SLUSHPOOL_API_KEY;
	let btc_to_usd_balance = '';

	let boldColor = 'white';
	try {
		child_process.execSync('defaults read -g AppleInterfaceStyle', { stdio: 'ignore' });
	} catch (err) {
		// AppleInterfaceStyle not set, which means user has light menu bar style
		boldColor = 'black';
	}

	// Font, Color, and Emoji Settings
	const redText = '| color=red size=14';
	const normalText = '| size=14';
	const boldText = `| color=${boldColor} size=14`;
	const heartEmoji = '♥︎';
	const brokenHeartEmoji = `♡`;

	// Prototype without env first...
	// Makes sure user overrided default configs
	if (VAR_SLUSHPOOL_API_KEY === '<YOUR_SLUSHPOOL_API_KEY_HERE>') {
		console.log(brokenHeartEmoji, 'Slushpool user API_KEY not set!', brokenHeartEmoji);
		process.exit();
	}

	let options = {
		hostname: 'rate.sx',
		port: 443,
		path: '/' + BTC_BALANCE + 'BTC',
		method: 'GET'
	}

	let req = await https.request(options, res => {
		res.on('data', d => {
			console.log(d.toString());
			btc_to_usd_balance = d.toString();
		});
	});
	req.on('error', error => { console.error(error); });
	req.end();

	const headers = { 'SlushPool-Auth-Token': VAR_SLUSHPOOL_API_KEY };
	options = {
		hostname: 'slushpool.com',
		port: 443,
		path: '/accounts/workers/json/btc/',
		method: 'GET',
		headers: headers
	};

	let slushpool_response = '';

	req = await https.request(options, res => {
		res.on('data', d => {
			console.log(d.toString());
			slushpool_response = d.toString();
		});
	})

	req.on('error', error => { console.error(error); });
	req.end();




	bitbar([
		{
			text: 'Total BTC' + btc_to_usd_balance,
			color: bitbar.darkMode ? 'white' : 'red',
			dropdown: true
		},

		bitbar.separator,
		{
			text: 'Unicorns',
			color: '#ff79d7',
			submenu: [
				{
					text: ':tv: Video',
					href: 'https://www.youtube.com/watch?v=9auOCbH5Ns4'
				},
				{
					text: ':book: Wiki',
					href: 'https://en.wikipedia.org/wiki/Unicorn'
				}
			]
		},
	]);

})();