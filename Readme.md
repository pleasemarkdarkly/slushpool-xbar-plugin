# Slushpool Xbar Plugin
Xbar (formerly known as Bitbar) Plugin to monitor Slushpool mining account. The sample API key is read-only and likely may not work so be sure to create your own from your Slushpool account. This Plugin take advantage of the [Slushpool APIs](https://help.slushpool.com/en/support/solutions/articles/77000433512-api-configuration-guide) to provide information about Pool, User Profile, or Worker Stats. Instruction on how to generate your Access Key is provided in the aforementioned guide.

### MenuBar Graphic
 ![Mining Graphic](./images/placeholder.jpg)

 ```base64
 ABC
 ```

* username
* hash_rate_5m (hash_rate_unit)
* hash_rate_60m (hash_rate_unit)
* hash_rate_24h (hash_rate_unit)
* confirmed_reward (bitcoin_logo)
* ok_workers
* off_workers
* low_workers

### Example API Key
The plugin requires an environment variable VAR_SLUSHPOOL_API_KEY, the example read-only key `Zm1oK8hGaDExOBaE` is provided as an example, however as previously mentioned likely has been disabled.

### Pool Stats API
`https://slushpool.com/stats/json/[coin]/`

### User Profile API
`https://slushpool.com/accounts/profile/json/[coin]/`

### Worker API
`https://slushpool.com/accounts/workers/json/[coin]/`

### Example
`https://slushpool.com/accounts/workers/json/btc/`

```bash
curl https://slushpool.com/accounts/profile/json/btc/ -H "SlushPool-Auth-Token: Zm1oK8hGaDExOBaE"
curl https://slushpool.com/accounts/workers/json/btc/ -H "SlushPool-Auth-Token: Zm1oK8hGaDExOBaE"

```
### User Profile Output

```json
{
    "username": "markep",
    "btc": {
        "confirmed_reward": "0.00144336",
        "unconfirmed_reward": "0.00019718",
        "estimated_reward": "0.00004134",
        "send_threshold": "0.00500000",
        "hash_rate_unit": "Gh/s",
        "hash_rate_5m": 28203.7617,
        "hash_rate_60m": 28974.6332,
        "hash_rate_24h": 29377.1755,
        "hash_rate_scoring": 29272.1846,
        "hash_rate_yesterday": 29633.6409,
        "low_workers": 0,
        "off_workers": 1,
        "ok_workers": 3,
        "dis_workers": 1
    }
}
```



