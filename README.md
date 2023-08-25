# How to Import your data
---
### Prerequisities:
- Install NodeJS latest
- Create your index on Algolia dashboard: [Index Management]()
- Create API keys for on Algolia dashboard with the name **restaurants_demo**: [API Key Management](https://dashboard.algolia.com/account/api-keys/restricted)
-- One API Key with ACL editSettings for index settings using the API
-- One API Key with ACL addObject for loading data in your index using the API

### How to run
1. Install npm dependencies
```console
npm install
```
2. Configure the module

Create the file `.env` at the root of the project, with this content
> Important: Please change values for **APPLICATION_ID**, **API_KEY_SETTINGS** & **API_KEY_LOAD_DATA**

`APPLICATION_ID,  = `**`YOUR APPLICATION ID`**

`API_KEY_SETTINGS = `**`YOUR API KEY FOR INDEX SETTINGS`**

`API_KEY_LOAD_DATA = `**`YOUR API KEY FOR LOADING DATA`**

`RESTAURANTS_INDEX = restaurants_demo`
`RESTAURANTS_JSON_FILE = ./dataset/restaurants_list.json`
`RESTAURANTS_CSV_FILE = ./dataset/restaurants_info.csv`

3. Process the data
- Initialize the index settings by issuing the command
```console
node index.js init
```
- Initialize the JSON file by issuing the command
```console
node index.js json
```
- Initialize the CSV file by issuing the command
```console
node index.js csv
```

## You are all Done!
---
