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
*/

USER_ACCOUNT_URL = 'https://slushpool.com/accounts/profile/json/btc/ -H "SlushPool-Auth-Token: ';

bitbar([
	{
		text: '🚀',
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
	bitbar.separator,
	'Ponies'
]);
