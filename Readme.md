# Slushpool Xbar Plugin
Xbar (formerly known as Bitbar) Plugin to monitor Slushpool mining account. The sample API key is read-only and likely may not work so be sure to create your own from your Slushpool account. This Plugin take advantage of the [Slushpool APIs](https://help.slushpool.com/en/support/solutions/articles/77000433512-api-configuration-guide) to provide information about Pool, User Profile, or Worker Stats. Instruction on how to generate your Access Key is provided in the aforementioned guide.

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

```
curl https://slushpool.com/accounts/profile/json/btc/ -H "SlushPool-Auth-Token: Zm1oK8hGaDExOBaE"
curl https://slushpool.com/accounts/workers/json/btc/ -H "SlushPool-Auth-Token: Zm1oK8hGaDExOBaE"

```


