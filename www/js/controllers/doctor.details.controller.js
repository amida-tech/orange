(function () {
    "use strict";

    angular
        .module('orange')
        .controller('DoctorDetailsCtrl', DoctorDetailsCtrl);

    DoctorDetailsCtrl.$inject = ['$scope', 'DoctorService'];

    /* @ngInject */
    function DoctorDetailsCtrl($scope, DoctorService) {
        var vm = this;

        vm.title = 'Doctor Details';
        vm.doctorsPromise = DoctorService.getItems();
        vm.doctor = DoctorService.getItem();

        vm.callDoctor = function(phone) {
            document.location.href = 'tel:+1' + phone;
        };
    }
})();
