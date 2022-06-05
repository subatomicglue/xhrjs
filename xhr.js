//let is_node = typeof process === 'object';
if (/*is_node && */typeof XMLHttpRequest === 'undefined') {
  XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
}
let util = require( "util" );
let XHR_VERBOSE = false;

// Make an HTTP request
// headers is typically: {'Content-Type': 'application/json; charset=utf-8', 'Accept': 'application/json' }
// - To auto-stringify the data Javascript Object into a string:  pass {'Content-Type': 'application/json; charset=utf-8' } into the headers param
// - To auto-parse the response body JSON into a JavaScript Object:  pass {'Accept': 'application/json'} into the headers param
// success result is returned with { body: Object, headers: [] }
module.exports.xhr = function xhr(type /* PUT, GET, POST, DELETE */, url, headers = {}, data = undefined, progressCB = (o, body, AbortFunc) => {}, options = {}) {
  data = (type === 'POST' || type === 'post') && data === undefined ? {} : data;
  let abort_called = false;
  function needToStringifyInputData( headers ) {
    // content-type may come from the call to xhr()
    let content_type = headers !== undefined && (headers['Content-Type'] || headers['content-type'])
    return content_type !== undefined && content_type.split(';').includes('application/json');
  }
  function needToParseRecvBody( headers ) {
    // accept may come from the call to xhr(), and content-type may some back from server... handle both.
    let accept = headers !== undefined && (headers['Accept'] || headers['accept'] || headers['Content-Type'] || headers['content-type'])
    return accept !== undefined && accept.split(';').indexOf('application/json') !== -1;
  }

  // verbose debugging (how was xhr() called?)
  XHR_VERBOSE && console.log( `xhr( type: ${type}, url: ${url}, headers, data, progress, options ): -->
${headers ? "headers: " + util.inspect( headers )  : ''}
${"data: " + util.inspect( data ) }
${"options: " + util.inspect( options )}
  `);

  return new Promise((rs, rj) => {
    let _options = {}; // default opts go here
    for (let op in options) _options[op] = options[op];

    let xhr = new XMLHttpRequest();

    //need to tell xhr to include cookies
    xhr.withCredentials = true;

    let Abort = () => {
      abort_called = true;
      xhr.abort();
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        let body = xhr.response || xhr.responseText || xhr.responseXML;

        // parse headers string into a hash
        let res_headers = {};
        let h_str = xhr.getAllResponseHeaders();
        let h_array = h_str.match(/[^\u000D\u000A].*/gi);
        if (h_array) {
          for (let h of h_array) {
            let key_value = h.split(":");
            res_headers[key_value[0]] = key_value[1].substr(1).replace(/["']/g, "");
          }
        }

        // decode known types:
        //XHR_VERBOSE && console.log( "xhr(): auto parsing the body1: ", body );
        if (body !== undefined && body != "" && (needToParseRecvBody(headers) || needToParseRecvBody(res_headers))) {
          XHR_VERBOSE && console.log( "xhr(): auto parsing the body2: ", body );
          try {
            body = JSON.parse( body );
          } catch (err) {
            util.inspect( err );
            util.inspect( body );
          }
        }

        // handle good status
        if (xhr.status >= 200 && xhr.status < 400) {
          let result = { status: xhr.status, body: body, headers: res_headers };
          XHR_VERBOSE && console.log( "xhr( "+type+", "+url+" ): <-- SUCCESS:\nresult:\n" + util.inspect( result ) );
          return rs( result );
        }

        // handle bad status
        else {
          if (xhr.status == 0/*|| xhr.status == 429*/ /* too many requests */ ) {
            let result = { body: body, headers: res_headers, status: xhr.status, message: 'aborted'};
            return rs(result);
          } else {
            // error >= 400, let the app deal with it
            XHR_VERBOSE && console.error( "xhr( "+type+", "+url+" ): <-- ERROR: response status(" + xhr.status + "):\n\n" + util.inspect( body ) );
            if (progressCB) {
              progressCB( undefined, body /* xhr.response */, Abort );
            }
            let result = { body: body, headers: res_headers, status: xhr.status };
            // never reject() on >=400 error codes,
            // they're not exceptions, servers return them all the time, we need to deal with it either globally, or case by case...
            // so let's figure it out, but it's not an exception. shouldn't crash the app when unhandled.
            return rs( result );
          }
        }
      }
    }; // xhr.onreadystatechange => () {}
    if (progressCB) {
      xhr.onprogress = (event) => {
        if((!event.lengthComputable && event.loaded === 0 && event.total === 0)) {   // This is to prevent progress from going back down to zero
          return;
        }
        progressCB( event.loaded, undefined, Abort );
      };
    }
    // some browsers (chrome for some reason) doesn't update with onprogress alone...
    if (xhr.upload) xhr.upload.addEventListener( "progress", xhr.onprogress ); // chrome
    xhr.addEventListener( "progress", xhr.onprogress ); // firefox

    // based on the header, transform the data as needed
    let dataToSend = data; // dont change any of the input data, this lets us resubmit the xhr() using the original inputs again...
    if (needToStringifyInputData( headers )) {
      dataToSend = JSON.stringify( data );
      XHR_VERBOSE && console.log( "xhr(): Auto stringifying the data: ", dataToSend );
    }

    xhr.open( type, url, true );
    for (let key in headers)
      xhr.setRequestHeader( key, headers[key] );
    if(progressCB) {
      progressCB( 0, undefined, Abort);
    }
    xhr.send( dataToSend );
  });
}

// Make an authorized HTTP request to the oauth2 protected backend.  (or use xhr() directly with your own Authorization header.)
// WARNING: user must be logged in (e.g. retrieved a valid access_token) before making this call.
//
// NOTE:
// To auto-parse the response body JSON into a JavaScript Object:  pass {'Accept': 'application/json'} into the headers param
// headers is typically: {'Content-Type': 'application/json; charset=utf-8', 'Accept': 'application/json' }
module.exports.xhrAuth = async function xhrAuth(access_token, type, url, headers, data, progressCB ) {
  if (access_token == undefined || access_token == '') {
    return { status: 401, body: {}, error: "no access token" };
  }

  //if we have an access token, then use that by setting the authorization header
  headers['Authorization'] = 'Bearer ' + encodeURIComponent( access_token );
  return await module.exports.xhr( type, url, headers, data, progressCB );
}

