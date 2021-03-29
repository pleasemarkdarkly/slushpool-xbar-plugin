var request = require('request');

var headers = {
    'SlushPool-Auth-Token': 'Zm1oK8hGaDExOBaE'
};

var options = {
    url: 'https://slushpool.com/accounts/workers/json/btc/',
    headers: headers
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
}

request(options, callback);
