(function() {
    'use strict';

    angular
        .module('orange')
        .controller('TodayCtrl', TodayCtrl);

    TodayCtrl.$inject = ['$scope', '$timeout', '$localstorage'];

    function TodayCtrl($scope, $timeout, $localstorage) {
        $scope.refresh = function() {
            $timeout(function() {
                console.log('Rerfreshed');
                $scope.$broadcast('scroll.refreshComplete');
            }, 2000);
        };

        console.log($localstorage.get('API_KEY', 'default'));

        $localstorage.set('API_KEY', 'my_api_key');
    }
})();
