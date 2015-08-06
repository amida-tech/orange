(function () {
    "use strict";

    angular
        .module('orange')
        .controller('DoctorCtrl', DoctorCtrl);

    DoctorCtrl.$inject = ['$state', '$ionicLoading', 'doctor', 'log'];

    /* @ngInject */
    function DoctorCtrl($state, $ionicLoading, doctor, log) {
        /* jshint validthis: true */
        var vm = this;

        vm.title = doctor.restangularized ? 'Edit Doctor': 'Add Doctor';
        vm.doctor = doctor;

        vm.save = save;

        function save() {
            $ionicLoading.show({
                template: 'Saving...'
            });
            if (vm.doctor.restangularized) {
                vm.doctor.save().then(saveSuccess, saveError);
            } else {
                log.all('doctors').post(vm.doctor).then(saveSuccess, saveError);
            }
        }

        function saveSuccess(doctor) {
            vm.doctor = doctor;
            $ionicLoading.hide();
            $state.go('app.doctors.list');
        }

        function saveError(error) {
            alert(error);
            $ionicLoading.hide();
        }
    }
})();
