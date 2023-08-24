'use strict';

const algoliasearch = require('algoliasearch');

const algoliasearchHelper = require('algoliasearch-helper');
var _ = require('lodash');
require('dotenv').config(); 

const API_KEY_SEARCH = process.env.API_KEY_SEARCH;

var searchHelper = null;
function renderHits(content) {
    console.log('renderHits');
//    $('#container').html(JSON.stringify(content, null, 2));
}

function initHelper() {
    const client = algoliasearch(APPLICATION_ID, API_KEY_SEARCH);
    searchHelper = algoliasearchHelper(client, RESTAURANTS_INDEX, {
        disjunctiveFacets: ['payment_options', 'food_types'],
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

// initHelper();
// searchRestaurants(search, food_types, stars_min, payment_options);
