#!/usr/bin/env node

const xhr = require('./xhr').xhr;
const xhrAuth = require('./xhr').xhrAuth;


// main entrypoint
(async () => {

  // request json data  (https://jsonplaceholder.typicode.com/ fake endpoint)
  let result = await xhr('GET', "https://jsonplaceholder.typicode.com/todos/1", { 'Accept': 'application/json', 'Content-Type': 'application/json' } );
  console.log( result );

  // request a webpage
  //let result = await xhr('GET', "https://www.google.com", { 'Accept': 'text/html', 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36' } );
  //console.log( result );

})();  // <<-- call it right away


