// Fixtures
var args = {
    asset_id: 123
};
var results = {
    'ok': 'It\'s done'
};

// Mock the Squiz Matrix API
var Squiz_Matrix_API = function() {}
Squiz_Matrix_API.prototype.batchRequest = function (options) {
    options.dataCallback(results);
};
Squiz_Matrix_API.prototype._cleanUrlParam = function (value) {
    if (typeof(value) !== 'undefined' && value !== null && value.constructor === String && value !== '') {
        return value.replace(/#/g , "%23").replace(/&/g , "%26").replace(/\?/g , "%3F").replace(/\+/g , "%2B");
    }// end if
    return value;
};

var api = new Squiz_Matrix_API();

test('The object is valid', function () {
    equal(typeof(JSAPI_Thread), 'function', 'The JS API Thread object exists');

    var thread = new JSAPI_Thread(api);

    ok(thread instanceof JSAPI_Thread, 'The object can be instantiated');
});

test('The thread can queue up function calls internally', function () {
    var thread = new JSAPI_Thread(api);

    thread.queue('getAttributes', args);
    equal(thread._queue.length, 1, 'The internal queue size is correct');
    equal(thread._queue[0].fn, 'getAttributes', 'The function name is set');
    deepEqual(thread._queue[0].args, args, 'The arguments match expected');

    thread.queue('setMetadata', args);
    equal(thread._queue.length, 2, 'The internal queue size is correct');
    equal(thread._queue[1].fn, 'setMetadata', 'The function name is set');
    deepEqual(thread._queue[1].args, args, 'The arguments match expected');
});

asyncTest('The execute() method invokes the JS API batch batchRequest', function () {
    expect(2);

    var thread = new JSAPI_Thread(api);
    sinon.spy(api, 'batchRequest');

    thread.queue('setMetadataAll', args);
    thread.execute(function (results){
        ok(api.batchRequest.called, 'batchRequest() was called');
        var call = api.batchRequest.getCall(0);
        equal(call.args[0].functions["0"].function, 'setMetadataAll', 'The arguments have the correct function name');
        api.batchRequest.restore();
        start();
    });
});

test('The thread can be chained and returns results', function() {
    var thread = new JSAPI_Thread(api);

    var callback = sinon.spy();

    thread
        .queue('setMetadataAll', args)
        .queue('setAttribute', args)
        .queue('getLinks')
        .execute(callback);

    ok(callback.called, 'The callback was called');
    var args = callback.getCall(0).args;
    equal(args.length, 1, 'The callback was called with 1 argument');
    deepEqual(args[0], results, 'The callback was passed with the correct results');

    thread.clear();
    equal(thread._queue.length, 0, 'The thread can be cleared');
});

test('The thread normalises arguments for problem batchRequest functions', function (){
    var thread = new JSAPI_Thread();

    thread.queue('getKeywordsReplacements', {
        keywords_array: ['%globals_asset_name%', '%globals_asset_contents%']
    });

    var normalised = thread.normalise();
    equal(normalised[0].args.keyword, '%globals_asset_name%\\,%globals_asset_contents%',
        'Arguments have been normalised including object property replacement and array flattening');

    // @todo - Need to add tests for each function that gets normalised with a different type of filter
});