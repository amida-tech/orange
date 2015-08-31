(function () {
    "use strict";

    angular
        .module('orange')
        .controller('DoctorSearchCtrl', DoctorSearchCtrl);

    DoctorSearchCtrl.$inject = ['$scope', '$state', '$ionicLoading', 'OrangeApi', '$ionicModal', '$ionicPopup',
                                'DoctorService'];

    /* @ngInject */
    function DoctorSearchCtrl($scope, $state, $ionicLoading, OrangeApi, $ionicModal, $ionicPopup, DoctorService) {
        var vm = this;

        vm.title = 'Find Doctor';
        vm.name = {};
        vm.address = {};
        vm.doctors = [];

        DoctorService.setItem(null);

        vm.search = function (form) {
            form.$submitted = true;
            if (!_.isEmpty(form.$error)) {
                return;
            }

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

        function searchSuccess(doctors) {
            $ionicLoading.hide();

            vm.doctors = [];

            _.each(doctors['providers'], function (provider) {
                var doctor = {};

                doctor['name'] = _.startCase(
                    [
                        provider.name_prefix,
                        provider.first_name,
                        provider.middle_name,
                        provider.last_name,
                    ].join(' ').toLowerCase()
                );

                if (!_.isUndefined(provider.name_suffix)) {
                    doctor['name'] += ' ' + provider.name_suffix;
                }

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

        vm.addGo = function(doctor) {
            DoctorService.setItem(doctor);
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
