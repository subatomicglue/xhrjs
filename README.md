# xhrjs

Examples:

```
xhr( PUT | GET | POST | DELETE, url, headers = {}, data = undefined, progressCB = (amt_loaded, error_body, AbortFunc) => {}, options = {} )
```

Make a webpage request
```
// request a webpage
let result = await xhr('GET', "https://www.google.com", { 'Accept': 'text/html' } );
console.log( result );
```


Make a GET data request (sending json, expecing json back)
```
let result = await xhr('GET', "https://jsonplaceholder.typicode.com/todos/1", { 'Accept': 'application/json', 'Content-Type': 'application/json' } );
console.log( result );
```

Make a POST data request (sending json, expecing json back)
```
let data = { somedata: "this is some data" }
let result = await xhr('POST', "https://some.data.endpoint", { 'Accept': 'application/json', 'Content-Type': 'application/json' }, data );
console.log( result );
```

Make a PUT data request (similar to uploading a file to amazon S3 bucket)
Upload a large file, with progress status
```
let data = /* <fetch some file blob here...> */
let result = await xhr('PUT', "https://some.data.endpoint", { 'Content-Type': 'application/octet-stream' }, data, (progress,error,Abort) => {
  console.log( `progress: ${progress}` )
});
console.log( result );
```


