(function () {
    'use strict';

    angular
        .module('orange')
        .factory('$localstorage', $localstorage);

    $localstorage.$inject = ['$window'];

    /* @ngInject */
    function $localstorage($window) {

        return {
            get: get,
            set: set,
            remove: remove,
            getObject: getObject,
            setObject: setObject
        };

        ////////////////

        function get(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        }

        function set(key, value) {
            $window.localStorage[key] = value;
        }

        function remove(key) {
            $window.localStorage.removeItem(key);
        }

        function getObject(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }

        function setObject(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        }
    }

})();

