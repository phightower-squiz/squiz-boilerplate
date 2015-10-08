(function(angular, Squiz_Matrix_API) {
    'use strict';

    var module = angular.module('JSAPI', []);

    module.service('JSAPI_Service', function () {
        var api;

        return {
            init: function (key) {
                if (!api) {
                    api = new Squiz_Matrix_API({
                        key: key
                    });
                }//end if
                return this;
            },//end init()

            thread: function() {
                return new JSAPI_Thread(api);
            }
        };
    });
}(angular, Squiz_Matrix_API));