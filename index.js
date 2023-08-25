
'use strict';

const algoliasearch = require('algoliasearch');

const fs = require('fs');
const csv=require('csvtojson')
var _ = require('lodash');
require('dotenv').config(); 


const APPLICATION_ID = process.env.APPLICATION_ID;
const API_KEY_SETTINGS = process.env.API_KEY_SETTINGS;
const RESTAURANTS_INDEX = process.env.RESTAURANTS_INDEX;
const API_KEY_LOAD_DATA = process.env.API_KEY_LOAD_DATA;

const RESTAURANTS_JSON_FILE = process.env.RESTAURANTS_JSON_FILE;
const RESTAURANTS_CSV_FILE = process.env.RESTAURANTS_CSV_FILE;

async function initIndexSettings() {
    const client = algoliasearch(APPLICATION_ID, API_KEY_SETTINGS);
    const index = client.initIndex(RESTAURANTS_INDEX);
    
    return await index.setSettings({
        'searchableAttributes': ['name', 'area', 'neighborhood', 'food_type', '_geoloc'],
        'attributesForFaceting': ['searchable(food_types)', 'payment_options']
      }).then(() => {
        return true;
      });    
      // manually added the One-way Synonym Discover => Diners Club, Carte Blanche. Did not work :(
}

async function loadJson() {
    const client = algoliasearch(APPLICATION_ID, API_KEY_LOAD_DATA);
    const index = client.initIndex(RESTAURANTS_INDEX);
    let jsonData = fs.readFileSync(RESTAURANTS_JSON_FILE);
    let restaurants = JSON.parse(jsonData);
    // Cleanup the data before loading
    for (let r of restaurants) {
        // remove useless fields
        delete r.address; 
        delete r.postal_code; 
        delete r.dining_style; 
        // clean the payment options => 
        r.payment_options = _.without(r.payment_options, 'Cash Only', 'JCB', 'Pay with OpenTable');
        let curated = _.without(r.payment_options, 'Diners Club', 'Carte Blanche', 'Discover');
        if (curated.length < r.payment_options.length) {
            curated.push('Discover');
        }
        r.payment_options = curated;
    } 

    await index.saveObjects(restaurants, {
        autoGenerateObjectIDIfNotExist: false
        // Any other requestOptions
      }).then((res) => {
        console.log('Nb Saved: ', res.objectIDs.length);
    });

}

async function loadCSV() {
    const client = algoliasearch(APPLICATION_ID, API_KEY_LOAD_DATA);
    const index = client.initIndex(RESTAURANTS_INDEX);

    let restaurants = await csv({
        delimiter: ';'
    }).fromFile(RESTAURANTS_CSV_FILE);

    // Cleanup the data before loading
    for (let r of restaurants) {
        r.stars_count = parseFloat(r.stars_count);
        r.reviews_count = parseInt(r.reviews_count);
        r.phone = r.phone_number; // use this as the phone number
        delete r.phone_number;
        // Clean a bit the food_type as an array of types
        switch (r.food_type) {
            case 'Contemporary American':
                r.food_types = ['American'];
                //r._tags = ['Contemporary'];
                break;
            case 'Contemporary French':
                r.food_types = ['French'];
                //r._tags = ['Contemporary'];
                break;
            case 'Contemporary Italian':
                r.food_types = ['Italian'];
                //r._tags = ['Contemporary'];
                break;    
            case 'Sicilian':
                r.food_types = ['Italian'];
                //r._tags = ['Sicilian'];
                break;    
    
            case 'Contemporary European':
                r.food_types = ['European'];
                //r._tags = ['Contemporary'];
                break;    
            case 'Modern European':
                r.food_types = ['European'];
                //r._tags = ['Modern'];
                break;        
            case 'Contemporary French / American':
                r.food_types = ['French', 'American'];
                //r._tags = ['Contemporary'];
                break;    
            case 'Contemporary Asian':
                r.food_types = ['Asian'];
                //r._tags = ['Contemporary'];
                break;    
            case 'Pan-Asian':
                r.food_types = ['Asian'];
                //r._tags = ['Pan'];
                break;    
            case 'Contemporary Southern':
                r.food_types = ['American'];
                //r._tags = ['Contemporary', 'Southern'];
                break;            
            case 'Contemporary Mexican':
                r.food_types = ['Mexican'];
                //r._tags = ['Contemporary'];
                break;                    
            case 'Traditional Mexican':
                r.food_types = ['Mexican'];
                //r._tags = ['Traditional'];
                break;                    
            case 'Regional Mexican':
                r.food_types = ['Mexican'];
                //r._tags = ['Regional'];
                break;                    
            case 'Tex-Mex Mexican':
                r.food_types = ['Mexican'];
                //r._tags = ['Tex-Mex'];
                break;                            
            case 'Mexican / Southwestern':
                r.food_types = ['Mexican', 'American'];
                break;        
            case 'Contemporary Indian':
                r.food_types = ['Indian'];
                //r._tags = ['Contemporary'];
                break;            
            case 'French American':
                r.food_types = ['French', 'American'];
                break;            
            case 'Brazilian Steakhouse':
                r.food_types = ['Brazilian'];
                //r._tags = ['Steakhouse'];
                break;            
            case 'Steakhouse':
                r.food_types = ['American'];
                break;
            case 'Steakhouse':
                r.food_types = ['American'];
                //r._tags = ['Steakhouse'];
                break;
            case 'Steak':
                r.food_types = ['American'];
                //r._tags = ['Steak'];
                break;
            case 'Barbecue':
                r.food_types = ['American'];
                //r._tags = ['Barbecue'];
                break;
            case 'Burgers':
                r.food_types = ['American'];
                //r._tags = ['Burgers'];
                break;
            case 'Prime Rib':
                r.food_types = ['American'];
                //r._tags = ['Prime Rib'];
                break;
    
            case 'Northwest':
                r.food_types = ['American'];
                //r._tags = ['Northwest'];
                break;
            case 'Southern':
                r.food_types = ['American'];
                //r._tags = ['Southern'];
                break;
            case 'Southwest':
                r.food_types = ['American'];
                //r._tags = ['Southwest'];
                break;    
            case 'Contemporary Southern':
                r.food_types = ['American'];
                //r._tags = ['Contemporary', 'Southern'];
                break;        
            case 'South American':
                r.food_types = ['American'];
                //r._tags = ['South']
                break;            
            case 'South Indian':
                r.food_types = ['Indian'];
                //r._tags = ['South'];
                break;                
            case 'Southeast Asian':
                r.food_types = ['Asian'];
                //r._tags = ['Southeast'];
                break;                
            case 'Gastro Pub':
                r.food_types = ['French'];
                //r._tags = ['Gastro Pub'];
                break;
            case 'Tapas / Small Plates':
                r.food_types = ['Spanish'];
                //r._tags = ['Tapas / Small Plates'];
                break;
            case 'Sushi':
                r.food_types = ['Japanese'];
                //r._tags = ['Sushi'];
                break;         
            case 'Global, International':
                r.food_types = ['International'];
                //r._tags = ['Global'];
                break;
            case 'Latin / Spanish':
                r.food_types = ['Latin American', 'Spanish'];
                break;
            case 'Basque':
                r.food_types = ['French'];
                //r._tags = ['Basque'];
                break;
            case 'Provencal':
                r.food_types = ['French'];
                //r._tags = ['Provencal'];
                break;
            case 'Fondue':
                r.food_types = ['French'];
                //r._tags = ['Fondue'];
                break;
        }
        if (!r.food_types) {
           r.food_types = [r.food_type];
        }
    } 
    await index.partialUpdateObjects(restaurants, {
        createIfNotExists: false
      }).then((res) => {
        console.log('Nb partial Updates: ', res.objectIDs.length);
      });
}



if (process.argv.length === 2) {
    console.error('Expected at least one argument: init, json, csv');
    process.exit(1);
  }
const arg = process.argv[2];

switch (arg) {
    case 'init':
        console.log('Start Initializing the Index');
        initIndexSettings();
        console.log('Index has Initialized');
        break;
    case 'json':
        console.log('Start loading Json file');
        loadJson();
        console.log('Json file has loaded');
        break;
    case 'csv':
        console.log('Start loading CSV file');
        loadCSV();
        console.log('CSV file has loaded');
        break;
    default:
        console.error('Expected argument: init, json, csv');
        process.exit(1);       

}


