(function () {
    "use strict";

    angular
        .module('orange')
        .controller('LogHabitsCtrl', LogHabitsCtrl);

    LogHabitsCtrl.$inject = ['$scope', '$ionicLoading', '$state', '$stateParams', 'habits', 'log'];

    /* @ngInject */
    function LogHabitsCtrl($scope, $ionicLoading, $state, $stateParams, habits, log) {

        $scope.habits = habits;
        $scope.log = log;
        $scope.submit = submit;


        function submit() {
            $ionicLoading.show({
                template: 'Saving...'
            });
            $scope.habits.tz = getTZName();
            $scope.habits.save().then(function(data) {
                $ionicLoading.hide();
                $state.go('onboarding-log.medications.list', $stateParams);
            });
        }

        function getTZName() {
            var tz = jstz.determine();
            return tz.name();
        }
    }
})();
