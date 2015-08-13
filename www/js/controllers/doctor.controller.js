(function () {
    "use strict";

    angular
        .module('orange')
        .controller('DoctorCtrl', DoctorCtrl);

    DoctorCtrl.$inject = ['$scope', '$state', '$ionicLoading', 'log', '$stateParams'];

    /* @ngInject */
    function DoctorCtrl($scope, $state, $ionicLoading, log, $stateParams) {
        /* jshint validthis: true */
        var vm = this;
        var is_edit = 'id' in $stateParams;

        vm.title = is_edit ? 'Edit Doctor': 'Add Doctor';
        vm.doctor =  is_edit ? {} : $scope.$parent.doctorToAdd;
        vm.doctorsPromise = $scope.doctors;

        if (vm.doctor == null) {
            $state.go('app.doctors.search')
        }

        $scope.doctors.then(function(doctors) {
            if (is_edit) {
                vm.doctor = _.find(doctors, function(doctor) {
                    return doctor.id == $stateParams.id
                })
            }
        });


        vm.save = function() {
            $ionicLoading.show({
                template: 'Saving...'
            });
            if (is_edit) {
                vm.doctor.save().then(updateSuccess, saveError);
            } else {
                log.all('doctors').post(vm.doctor).then(saveSuccess, saveError);
            }
        };

        function saveSuccess(doctor) {
            $ionicLoading.hide();
            $scope.doctors.$object.push(doctor);
            $state.go('app.doctors.list');
        }

        function updateSuccess(doctor) {
            $ionicLoading.hide();
            _.each($scope.doctors.$object, function(dr, i) {
                if (dr.id != doctor.id) {
                    return;
                }

                $scope.doctors.$object[i] = doctor;
            });
            $state.go('app.doctors.list');
        }

        function saveError(error) {
            alert(error);
            $ionicLoading.hide();
        }
    }
})();
