(function () {
    "use strict";

    angular
        .module('orange')
        .controller('DoctorDetailsCtrl', DoctorDetailsCtrl);

    DoctorDetailsCtrl.$inject = ['$scope', '$state', '$stateParams', '$rootScope'];

    /* @ngInject */
    function DoctorDetailsCtrl($scope, $state, $stateParams, $rootScope) {
        var vm = this;

        vm.title = 'Doctor Details';
        vm.doctorsPromise = $scope.doctors;
        vm.doctor = {};

        $scope.doctors.then(function(doctors) {
            vm.doctor = _.find(doctors, function(doctor) {
                return doctor.id == $stateParams.id
            })
        });

        vm.callDoctor = function(phone) {
            document.location.href = 'tel:+1' + phone;
        };
        function saveError(error) {
            alert(error);
            $ionicLoading.hide();
        }
    }
})();
