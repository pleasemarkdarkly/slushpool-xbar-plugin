# Slushpool [Xbar](https://github.com/matryer/xbar) Plugin
Xbar (formerly known as Bitbar) Plugin to monitor Slushpool mining account. The sample API key is read-only and likely may not work so be sure to create your own from your Slushpool account. This Plugin take advantage of the [Slushpool APIs](https://help.slushpool.com/en/support/solutions/articles/77000433512-api-configuration-guide) to provide information about Pool, User Profile, or Worker Stats. Instruction on how to generate your Access Key is provided in the aforementioned guide.

### ⛏️ Rough idea of output
  * Pending mining payments: (confirmed_reward + unconfirmed_reward)
  * Balance in USD: (Pending payments + any additional balance)
  * -separator-
  * hash_rate (5m): n (hash_rate_unit)
  * hash_rate (60m): n (hash_rate_unit)
  * hash_rate (24/h): n (hash_rate_unit)
  * -separator-
  * ok-workers
  * -separator-
  * dis-workers
  * -separator-
  * off-workers

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

### Worker Output

```json
{
  'markep.[auto]': {
    state: 'dis',
    last_share: 1616202341,
    hash_rate_unit: 'Gh/s',
    hash_rate_scoring: 0,
    hash_rate_5m: 0,
    hash_rate_60m: 0,
    hash_rate_24h: 0
  },
  'markep.antminder_t9': {
    state: 'OK',
    last_share: 1617184681,
    hash_rate_unit: 'Gh/s',
    hash_rate_scoring: 10500.4893,
    hash_rate_5m: 9640.3261,
    hash_rate_60m: 11132.968,
    hash_rate_24h: 5981.7406
  },
  'markep.antminer_s9i': {
    state: 'OK',
    last_share: 1617184678,
    hash_rate_unit: 'Gh/s',
    hash_rate_scoring: 12393.3512,
    hash_rate_5m: 11332.3428,
    hash_rate_60m: 13131.9758,
    hash_rate_24h: 13979.5378
  },
  'markep.antminer_s9i_1': {
    state: 'OK',
    last_share: 1617184679,
    hash_rate_unit: 'Gh/s',
    hash_rate_scoring: 4733.7485,
    hash_rate_5m: 5645.2621,
    hash_rate_60m: 4392.7959,
    hash_rate_24h: 4776.8809
  },
  'markep.nvidia-1080': {
    state: 'off',
    last_share: null,
    hash_rate_unit: 'Gh/s',
    hash_rate_scoring: 0,
    hash_rate_5m: 0,
    hash_rate_60m: 0,
    hash_rate_24h: 0
  }
}
```


