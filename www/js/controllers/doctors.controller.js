(function () {
    'use strict';

    angular
        .module('orange')
        .controller('DoctorsCtrl', DoctorsCtrl);

    DoctorsCtrl.$inject = ['$scope', '$ionicLoading'];

    /* @ngInject */
    function DoctorsCtrl($scope, $ionicLoading) {
        var vm = this;

        vm.doctors = $scope.doctors.$object;
        vm.doctorsPromise = $scope.doctors;
        vm.doctor = {};
        vm.remove = remove;
        vm.refresh = refresh;
        vm.title = "Doctors";

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
