#!/usr/bin/env node

const xhr = require('./xhr').init( require("xmlhttprequest").XMLHttpRequest ).xhr;
const xhrAuth = require('./xhr').init( require("xmlhttprequest").XMLHttpRequest ).xhrAuth;


// main entrypoint
(async () => {
  let result

  // request json data  (https://jsonplaceholder.typicode.com/ fake endpoint)
  result = await xhr('GET', "https://jsonplaceholder.typicode.com/todos/1", { 'Accept': 'application/json', 'Content-Type': 'application/json' } );
  console.log( result );

  // request a webpage
  result = await xhr('GET', "https://www.google.com", { 'Accept': 'text/html' } );
  console.log( result );

})();  // <<-- call it right away


