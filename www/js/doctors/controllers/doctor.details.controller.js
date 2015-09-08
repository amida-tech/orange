(function () {
    "use strict";

    angular
        .module('orange')
        .controller('DoctorDetailsCtrl', DoctorDetailsCtrl);

    DoctorDetailsCtrl.$inject = ['$stateParams', 'DoctorService'];

    /* @ngInject */
    function DoctorDetailsCtrl($stateParams, DoctorService) {
        var vm = this;

        vm.title = 'Doctor Details';
        vm.doctorsPromise = DoctorService.getItems();
        DoctorService.getItem($stateParams['id']).then(function (doctor) {
            vm.doctor = doctor;
        });

        vm.callDoctor = function(phone) {
            document.location.href = 'tel:+1' + phone;
        };
    }
})();
