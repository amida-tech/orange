(function () {
    "use strict";

    angular
        .module('orange')
        .controller('DoctorCtrl', DoctorCtrl);

    DoctorCtrl.$inject = ['$state', '$ionicLoading', '$stateParams', 'DoctorService'];

    /* @ngInject */
    function DoctorCtrl($state, $ionicLoading, $stateParams, DoctorService) {
        /* jshint validthis: true */
        var vm = this,
            is_edit = 'id' in $stateParams;

        vm.title = is_edit ? 'Edit Doctor': 'Add Doctor';
        vm.backState = is_edit ? 'app.doctors.details({id:'+$stateParams.id+'})' : 'app.doctors.search';
        DoctorService.getItem($stateParams['id']).then(function (doctor) {
            vm.doctor = doctor;
            if (vm.doctor == null) {
                $state.go('app.doctors.search')
            }
        });
        vm.doctorsPromise = DoctorService.getItems();

        vm.save = function() {
            $ionicLoading.show({
                template: 'Saving...'
            });
            DoctorService.saveItem(vm.doctor).then(saveSuccess, saveError);
        };

        function saveSuccess(doctor) {
            $ionicLoading.hide();
            $state.go('app.doctors.list');
        }

        function saveError(error) {
            alert(error);
            $ionicLoading.hide();
        }
    }
})();
