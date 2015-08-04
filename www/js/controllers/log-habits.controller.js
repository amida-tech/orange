(function () {
    "use strict";

    angular
        .module('orange')
        .controller('LogHabitsCtrl', LogHabitsCtrl);

    LogHabitsCtrl.$inject = ['$scope', '$ionicLoading', 'habits'];

    /* @ngInject */
    function LogHabitsCtrl($scope, $ionicLoading, habits) {
        $scope.habits = habits;

        $scope.submit = submit;

        function submit() {
            $ionicLoading.show({
                template: 'Saving...'
            });
            $scope.habits.tz = getTZName();
            $scope.habits.save().then(function(data) {
                $ionicLoading.hide();
            });
        }

        function getTZName() {
            var tz = jstz.determine();
            return tz.name();
        }
    }
})();
