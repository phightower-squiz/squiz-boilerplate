# Matrix JS API wrapper

[Bower]: http://bower.io/
[Squiz Boilerplate]: https://gitlab.squiz.net/boilerplate/squiz-boilerplate

> A wrapping object for the JS API that provides some abstraction of batchRequest. Based on EasyEditAPI.

## Usage

```javascript
// Api instance
var api = new Squiz_Matrix_API({
    key: '1234'
});

// Create a thread
var thread = new JSAPI_Thread(api);

// Add a request to the queue
thread.queue('getAttributes', {
    asset_id: '123'
});

// Execute the request
thread.execute(function(results) {
    // Each result is in the results array 
});

// Chain them if you like
thread
    .queue('setMetadataAll', { ... })
    .queue('setAttribute', { ... })
    .queue('getLinks')
    .execute(function(results) { ... });

// Clear the thread read for more functions, or
// create a new one
thread.clear();
```