(function () {
    'use strict';

    angular
        .module('orange')
        .controller('DoctorsCtrl', DoctorsCtrl);

    DoctorsCtrl.$inject = ['$scope', '$state', '$ionicLoading', 'DoctorService'];

    /* @ngInject */
    function DoctorsCtrl($scope, $state, $ionicLoading, DoctorService) {
        var vm = this;

        vm.doctors = null;
        vm.doctor = {};
        vm.details = doctorDetails;
        vm.remove = remove;
        vm.refresh = refresh;
        vm.loadMore = loadMore;
        vm.hasMore = DoctorService.hasMore;
        vm.title = "Doctors";

        refresh();

        function remove(doctor) {
            $ionicLoading.show({
                template: 'Deleting...'
            });
            DoctorService.removeItem(doctor).then(function (items) {
                $ionicLoading.hide();
                vm.doctors = items;
            });
        }

        function refresh() {
            vm.doctorsPromise = DoctorService.getItems(true);
            vm.doctorsPromise.then(
                function (doctors) {
                    $scope.$broadcast('scroll.refreshComplete');
                    vm.doctors = doctors;
                },
                function (error) {
                    $ionicLoading.hide();
                    $cordovaDialogs.alert(error.statusText, 'Error', 'OK');
                }
            )
        }

        function loadMore() {
            var morePromise = DoctorService.moreItems();
            if (vm.doctors !== null && morePromise) {
                morePromise.then(function (items) {
                    vm.doctors = items;
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        }

        function doctorDetails(doctor) {
            DoctorService.setItem(doctor);
            $state.go('app.doctors.details', {id: doctor.id});
        }
    }
})();
