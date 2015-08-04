(function () {
    "use strict";

    angular
        .module('orange')
        .controller('LogHabitsCtrl', LogHabitsCtrl);

    LogHabitsCtrl.$inject = ['$scope', '$ionicLoading', '$state', '$stateParams', 'habits'];

    /* @ngInject */
    function LogHabitsCtrl($scope, $ionicLoading, $state, $stateParams, habits) {

        $scope.habits = habits;
        $scope.submit = submit;

        function submit() {
            $ionicLoading.show({
                template: 'Saving...'
            });
            $scope.habits.tz = getTZName();
            $scope.habits.save().then(function(data) {
                $ionicLoading.hide();
                $state.go('logs-setup-medications', $stateParams);
            });
        }

        function getTZName() {
            var tz = jstz.determine();
            return tz.name();
        }
    }
})();
