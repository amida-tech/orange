(function () {
    "use strict";

    angular
        .module('orange')
        .controller('DoctorSearchCtrl', DoctorSearchCtrl);

    DoctorSearchCtrl.$inject = ['$scope', '$state', '$ionicLoading', 'OrangeApi', '$ionicModal', '$ionicPopup'];

    /* @ngInject */
    function DoctorSearchCtrl($scope, $state, $ionicLoading, OrangeApi, $ionicModal, $ionicPopup) {
        var vm = this;

        vm.title = 'Find Doctor';
        vm.name = {};
        vm.address = {};
        vm.doctors = [];


        vm.search = function () {
            $ionicLoading.show({
                template: 'Search...'
            });

            var query = { search: {
                    name: [vm.name],
                    address: [vm.address]
                }
            };

            OrangeApi.npi.post(query).then(searchSuccess);
        };

        function NamePartFormatter(part){
            if (_.isUndefined(part))
                return part;

            part = part.toLowerCase();
            part = part.charAt(0).toUpperCase() + part.slice(1);
            return part;
        }

        function searchSuccess(doctors) {
            $ionicLoading.hide();

            vm.doctors = [];

            _.each(doctors.providers, function(provider) {
                var doctor = {};

                doctor['name'] = _.startCase(
                    [
                        provider.name_prefix,
                        provider.first_name,
                        provider.middle_name,
                        provider.last_name,
                        provider.name_suffix
                    ].join(' ').toLowerCase()
                );

                doctor['phone'] = provider.practice_address.phone;
                var address = (provider.practice_address.address_line + ' dividerf '
                    + provider.practice_address.city + ' dividers '
                    + provider.practice_address.state + ' dividert '
                    + provider.practice_address.zip).toLowerCase();

                doctor['address'] = _.startCase(address).replace(' Dividerf ', ',\n')
                    .replace(' Dividers ', ' ').replace(' Dividert ', ', ');

                doctor['title'] = provider.credential;

                vm.doctors.push(doctor)
            });
            if (!vm.doctors.length) {
                $ionicPopup.alert({ title: 'Doctors not found.' });
                return;
            }

            vm.modal.show();
        }

        function saveError(error) {
            alert(error);
            $ionicLoading.hide();
        }

        vm.addGo = function(doctor) {
            $scope.$parent.doctorToAdd = doctor;
            $state.go('app.doctors.add');
            vm.modal.hide();
        };

        $ionicModal.fromTemplateUrl('templates/partial/doctors.search_list.modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            vm.modal = modal;
        });

    }
})();
