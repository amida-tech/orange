(function () {
    'use strict';

    angular
        .module('orange')
        .controller('DoctorsCtrl', DoctorsCtrl);

    DoctorsCtrl.$inject = ['$scope', '$ionicLoading', 'doctors'];

    /* @ngInject */
    function DoctorsCtrl($scope, $ionicLoading, doctors) {
        var vm = this;

        vm.doctors = doctors;
        vm.doctor = {};
        vm.remove = remove;
        vm.refresh = refresh;

        function remove(doctor) {
            $ionicLoading.show({
                template: 'Deleting...'
            });
            doctor.remove().then(function() {
                _.remove(vm.doctors, function(elem) {
                    return elem.id == doctor.id;
                });
                $ionicLoading.hide();
            });
        }

        function refresh() {
            vm.doctors.getList().then(
                function(doctors) {
                    $scope.$broadcast('scroll.refreshComplete');
                    vm.doctors = doctors;
                }
            )
        }
    }
})();
