
'use strict';
const algoliasearch = require('algoliasearch');
const algoliasearchHelper = require('algoliasearch-helper');

const fs = require('fs');
const csv=require('csvtojson')

require('dotenv').config(); 


const APPLICATION_ID = process.env.APPLICATION_ID;
const API_KEY_SETTINGS = process.env.API_KEY_SETTINGS;
const API_KEY_SEARCH = process.env.API_KEY_SEARCH;
const RESTAURANTS_INDEX = process.env.RESTAURANTS_INDEX;
const API_KEY_LOAD_DATA = process.env.API_KEY_LOAD_DATA;

const RESTAURANTS_JSON_FILE = process.env.RESTAURANTS_JSON_FILE;
const RESTAURANTS_CSV_FILE = process.env.RESTAURANTS_CSV_FILE;

var searchHelper = null;

async function initIndexSettings() {
    const client = algoliasearch(APPLICATION_ID, API_KEY_SETTINGS);
    const index = client.initIndex(RESTAURANTS_INDEX);
    
    return index.setSettings({
        'searchableAttributes': ['name', 'area', '_geoloc'],
        'attributesForFaceting': ['searchable(food_type)', 'payment_options']
      }).then(() => {
        console.log('all good');
        return true;
      });    
      // manually added the One-way Synonym Discover => Diners Club, Carte Blanche. Did not work :(
}

async function loadJson() {
    const client = algoliasearch(APPLICATION_ID, API_KEY_LOAD_DATA);
    const index = client.initIndex(RESTAURANTS_INDEX);
    let jsonData = fs.readFileSync(RESTAURANTS_JSON_FILE);
    let restaurants = JSON.parse(jsonData);
    console.log('Nb Restaurants Loaded', restaurants.length);
    console.log('res', restaurants[0]);
    // Cleanup the data before loading
    for (let r of restaurants) {
        // delete r.price; // useless
        // clean the payment options => 
        // --- remove Cash Only / JBC / Pay with OpenTable
        // --- replace Diners Club / Carte Blanche => Discover
        let options = r.payment_options;
        let curated = [];
        let addDiscover = false
        for (let o of options) {
            if (o === 'Cash Only' || o === 'JCB' || o === 'Pay with OpenTable') {
                continue;
            } 
            if (o === 'Diners Club' || o === 'Carte Blanche' || o === 'Discover') {
                addDiscover = true;
            }
            else {
                curated.push(o);
            }
        }
        if (addDiscover) {
            curated.push('Discover');
        }
        r.payment_options = curated;

    } 
    index.saveObjects(restaurants, {
        autoGenerateObjectIDIfNotExist: false
        // Any other requestOptions
      }).then(({ objectIDs }) => {
        console.log(objectIDs);
      });

}

async function loadCSV() {
    const client = algoliasearch(APPLICATION_ID, API_KEY_LOAD_DATA);
    const index = client.initIndex(RESTAURANTS_INDEX);

    let restaurants = await csv({
        delimiter: ';'
    }).fromFile(RESTAURANTS_CSV_FILE);
    console.log('Nb Restaurants Loaded', restaurants.length);
    console.log('res', restaurants[0]);
    // Cleanup the data before loading
    for (let r of restaurants) {
        r.stars_count = parseFloat(r.stars_count);
        //r.stars_count_facet = Math.floor(r.stars_count);
        r.reviews_count = parseInt(r.reviews_count);
        r.phone = r.phone_number; // use this as the phone number
        delete r.phone_number;
    } 
    index.partialUpdateObjects(restaurants, {
        createIfNotExists: false
      }).then(({ objectIDs }) => {
        console.log(objectIDs);
      });

}


function renderHits(content) {
    console.log('renderHits');
//    $('#container').html(JSON.stringify(content, null, 2));
}

function initHelper() {
    const client = algoliasearch(APPLICATION_ID, API_KEY_SEARCH);
    searchHelper = algoliasearchHelper(client, RESTAURANTS_INDEX, {
        disjunctiveFacets: ['payment_options', 'food_type'],
        hitsPerPage: 3,
        maxValuesPerFacet: 7
    });

    searchHelper.on('result', function (event) {
        renderHits(event.results);
      });
}

  async function searchRestaurants(search, food_types, stars_min, payment_options) {
      
    searchHelper.clearRefinements();
    for (const ft of food_types) {
        searchHelper.addDisjunctiveFacetRefinement('food_type', ft);
    }
    for (const po of payment_options) {
        searchHelper.addDisjunctiveFacetRefinement('payment_options', po);
    }
    if (search) {
        searchHelper.setQuery(search);
    }
    if (stars_min) {
        searchHelper.addNumericRefinement ('stars_count', '>=', stars_min);
    }
    searchHelper.search();


    // let numericFilters = [];
    // let filters 
    // if (stars_min) numericFilters.push(`stars_count > ${stars_min}`);
    // index.search(search, {
    //     numericFilters,
    //     hitsPerPage: 3
    // }).then((result) => {
    //     console.log(result.hits);
    //   });

}
const search = 'Grill';
const food_types = ['American', 'French', 'Italian'];
const stars_min = 4;
const payment_options = ['AMEX'];

//initIndexSettings();
//loadJson();
//loadCSV();
initHelper();
searchRestaurants(search, food_types, stars_min, payment_options);
