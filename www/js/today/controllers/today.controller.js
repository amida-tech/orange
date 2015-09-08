(function () {
    'use strict';

    angular
        .module('orange')
        .controller('TodayCtrl', TodayCtrl);

    TodayCtrl.$inject = ['$q', '$scope', '$stateParams', '$ionicLoading', '$ionicPopup', '$ionicModal',
        'n2w', 'PatientService', 'MedicationService'];

    function TodayCtrl($q, $scope, $stateParams, $ionicLoading, $ionicPopup, $ionicModal,
                       n2w, PatientService, MedicationService) {
        var vm = this,
            doseModal = null,
            patient = null;

        vm.scheduleDate = $stateParams.date || moment().format('YYYY-MM-DD');
        vm.title = moment().format('YYYY-MM-DD') === vm.scheduleDate ? 'Today' : moment(vm.scheduleDate, 'YYYY-MM-DD').format('MMMM Do YYYY');
        vm.schedule = null;
        vm.medications = null;
        vm.habits = null;

        vm.event = null;
        vm.dose = null;

        vm.filters = [
            {
                title: '',
                name: '',
                f: function (elem) {
                    return elem.event &&
                        elem.event.type === 'event' &&
                        elem.event.when === 'after' &&
                        elem.event.event === 'sleep';
                },
                getTitle: function () {
                    return 'After Wake (' + vm.habits.wake + ')';
                },
                events: []
            },
            {
                title: 'Exact Time',
                name: '',
                f: function (elem) {
                    if ((elem.event && elem.event.type === 'exact') || (_.isUndefined(elem.notification))) {
                        var breakfast = moment(vm.habits.breakfast, $scope.settings.timeFormat);
                        var time = moment(elem.date);
                        return time <= breakfast;
                    }

                    return false;

                },
                events: []

            },
            {
                title: '',
                name: '',
                f: function (elem) {
                    return elem.event &&
                        elem.event.type === 'event' &&
                        elem.event.when === 'before' &&
                        elem.event.event === 'breakfast';
                },
                getTitle: function () {
                    return 'Before Breakfast (' + vm.habits.breakfast + ')';
                },
                events: []
            },
            {
                title: '',
                name: '',
                f: function (elem) {
                    return elem.event &&
                        elem.event.type === 'event' &&
                        elem.event.when === 'after' &&
                        elem.event.event === 'breakfast';
                },
                getTitle: function () {
                    return 'After Breakfast (' + vm.habits.breakfast + ')';
                },
                events: []
            },
            {
                title: 'Exact Time',
                name: '',
                f: function (elem) {
                    if ((elem.event && elem.event.type === 'exact') || (_.isUndefined(elem.notification))) {
                        var breakfast = moment(vm.habits.breakfast, $scope.settings.timeFormat);
                        var lunch = moment(vm.habits.lunch, $scope.settings.timeFormat);
                        var time = moment(elem.date);
                        return (time > breakfast) && (time <= lunch);
                    }

                    return false;

                },
                events: []

            },
            {
                title: '',
                name: '',
                f: function (elem) {
                    return elem.event &&
                        elem.event.type === 'event' &&
                        elem.event.when === 'before' &&
                        elem.event.event === 'lunch';
                },
                getTitle: function () {
                    return 'Before Lunch (' + vm.habits.lunch + ')';
                },
                events: []
            },
            {
                title: '',
                name: '',
                f: function (elem) {
                    return elem.event &&
                        elem.event.type === 'event' &&
                        elem.event.when === 'after' &&
                        elem.event.event === 'lunch';
                },
                getTitle: function () {
                    return 'After Lunch (' + vm.habits.lunch + ')';
                },
                events: []
            },
            {
                title: 'Exact Time',
                name: '',
                f: function (elem) {
                    if ((elem.event && elem.event.type === 'exact') || (_.isUndefined(elem.notification))) {
                        var lunch = moment(vm.habits.lunch, $scope.settings.timeFormat);
                        var dinner = moment(vm.habits.dinner, $scope.settings.timeFormat);
                        var time = moment(elem.date);
                        return (time > lunch) && (time <= dinner);
                    }

                    return false;

                },
                events: []

            },
            {
                title: '',
                name: '',
                f: function (elem) {
                    return elem.event &&
                        elem.event.type === 'event' &&
                        elem.event.when === 'before' &&
                        elem.event.event === 'dinner';
                },
                getTitle: function () {
                    return 'Before Dinner (' + vm.habits.dinner + ')';
                },
                events: []
            },
            {
                title: 'After Dinner',
                name: '',
                f: function (elem) {
                    return elem.event &&
                        elem.event.type === 'event' &&
                        elem.event.when === 'after' &&
                        elem.event.event === 'dinner';
                },
                getTitle: function () {
                    return 'After Dinner (' + vm.habits.dinner + ')';
                },
                events: []
            },
            {
                title: 'Exact Time',
                name: '',
                f: function (elem) {
                    if ((elem.event && elem.event.type === 'exact') || (_.isUndefined(elem.notification))) {
                        var dinner = moment(vm.habits.dinner, $scope.settings.timeFormat);
                        var time = moment(elem.date);
                        return (time > dinner);
                    }

                    return false;

                },
                events: []

            },
            {
                title: '',
                name: '',
                f: function (elem) {
                    return elem.event &&
                        elem.event.type === 'event' &&
                        elem.event.when === 'before' &&
                        elem.event.event === 'sleep';
                },
                getTitle: function () {
                    return 'Before Sleep (' + vm.habits.sleep + ')';
                },
                events: []
            }
        ];

        vm.refresh = refresh;
        vm.confirmDose = confirmDose;
        vm.openModal = showModal;
        vm.closeModal = hideModal;
        vm.createDose = createDose;
        vm.changeDate = changeDate;

        PatientService.getPatient().then(function (item) {
            patient = item;
            refresh();
        });

        $ionicModal.fromTemplateUrl('templates/today/dose.today.modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            doseModal = modal
        });

        function changeDate() {

            var options = {
                date: moment(vm.scheduleDate, 'YYYY-MM-DD').toDate(),
                mode: 'date',
                allowOldDates: true,
                allowFutureDates: true,
                androidTheme: $cordovaDatePicker.THEME_DEVICE_DEFAULT_DARK
            };

            $cordovaDatePicker.show(options).then(function (date) {

                if (date) {
                    vm.scheduleDate = moment(date).format('YYYY-MM-DD');
                    vm.title = moment().format('YYYY-MM-DD') === vm.scheduleDate ? 'Today' : moment(vm.scheduleDate, 'YYYY-MM-DD').format('MMMM Do YYYY');
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                    refresh();
                }
            });
        }


        function createDose(skipped) {
            skipped = skipped || false;
            vm.dose.taken = !skipped;

            $ionicPopup.confirm({
                title: vm.event.medication.name,
                template: '<p class="text-center">Mark this medication event as' + (skipped ? ' skipped' : ' taken') + '?</p>',
                okText: '<b>Yes</b>',
                okType: 'button-dark-orange'
            }).then(
                function (confirm) {
                    if (confirm) {
                        $ionicLoading.show({
                            template: 'Saving...'
                        });
                        patient.all('doses').post(vm.dose)
                            .then(
                            undefined,
                            function (data) {
                                var template = data.data.errors.indexOf('invalid_medication_id') > -1 ? 'Medication not found' : data.data.errors;
                                $ionicPopup.alert({
                                    title: 'Error',
                                    template: template,
                                    okType: 'button-dark-orange'
                                });
                            })
                            .finally(
                            function () {
                                refresh();
                                hideModal();
                            });
                    }
                });

        }

        function showModal(event) {
            vm.event = event;
            vm.event.text = getEventText(event);
            vm.showDetails = !!event.dose_id;

            vm.dose = {
                medication_id: event.medication_id,
                date: moment().format(),
                taken: true,
                scheduled: event.scheduled
            };
            doseModal.show();
        }

        function hideModal() {
            vm.event = null;
            vm.dose = null;
            doseModal.hide();
        }

        function confirmDose(event, skipped) {
            skipped = skipped || false;

            $ionicPopup.confirm({
                title: event.medication.name,
                template: '<p class="text-center">Mark this medication event as' + (skipped ? ' skipped' : ' taken') + '?</p>',
                okText: '<b>Yes</b>',
                okType: 'button-dark-orange'
            }).then(
                function (confirm) {
                    if (confirm) {
                        var dose = {
                            medication_id: event.medication_id,
                            date: moment().format(),
                            taken: !skipped,
                            scheduled: event.scheduled
                        };
                        $ionicLoading.show({
                            template: 'Saving...'
                        });
                        patient.all('doses').post(dose)
                            .then(
                            undefined,
                            function (data) {
                                $ionicLoading.hide();
                                var template = data.data.errors.indexOf('invalid_medication_id') > -1 ? 'Medication not found' : data.data.errors;
                                $ionicPopup.alert({
                                    title: 'Error',
                                    template: template,
                                    okType: 'button-dark-orange'
                                });
                            })
                            .finally(function () {
                                         refresh();
                                     })
                    }
                });
        }

        function getEventText(event) {
            var result = '';
            result += _.capitalize(n2w.toWords(event.medication.dose.quantity || 0));
            result += ' unit' + (event.medication.dose.quantity === 1 ? '' : 's');
            if (event.event.type == 'exact') {
                result += ' at ' + event.event.time;
            } else {
                result += ' ' + event.event.when + ' ' + event.event.event;
            }
            if (event.take_with_food !== null) {
                result += ', taken ' + (event.take_with_food ? 'with' : 'without') + ' food'
            }
            return result;
        }

        function getFilterName(events) {
            var result = '';
            if (events.length) {
                var first = moment(events[0].date);
                return first.fromNow();
            }
            return result;
        }

        function getEventStatus(event) {
            var status = 'active';
            if (!_.isUndefined(event.dose_id)) {
                status = event.took_medication ? 'taken' : 'skipped';
            }
            return status;
        }

        function refresh() {
            var filter = {
                start_date: vm.scheduleDate,
                end_date: vm.scheduleDate
            };
            $q.all([
                patient.all('schedule').getList(filter),
                MedicationService.getItems(true),
                PatientService.getHabits(patient),
                patient.all('doses').getList()
            ]).then(
                function (data) {
                    vm.schedule = data[0].plain();
                    vm.medications = data[1].plain();
                    vm.habits = data[2].plain();
                    vm.doses = data[3].plain();
                    vm.schedule.forEach(function (elem) {
                        elem.medication = _.find(vm.medications, {id: elem.medication_id});

                        if (!_.isUndefined(elem.scheduled)) {
                            elem.event = _.find(elem.medication.schedule.times, {id: elem.scheduled});
                        }

                        if (elem.dose_id) {
                            elem.dose = _.find(vm.doses, {id: elem.dose_id});
                        }
                        elem.status = getEventStatus(elem);
                    });

                    vm.filters.forEach(function (filter) {
                        filter.events = _.filter(vm.schedule, filter.f);
                        filter.name = getFilterName(filter.events);
                        if (filter.getTitle) {
                            filter.title = filter.getTitle();
                        }
                    })
                },
                function (error) {
                    console.log(error);
                }
            ).finally(
                function () {
                    $scope.$broadcast('scroll.refreshComplete');
                    $ionicLoading.hide();
                })
        }

        $scope.$on('today:click:notification', function (ev, notification) {
            var event = JSON.parse(notification.data).event;
            //Check notify date
            var notifyDate = moment(event.date);
            var currentDate = moment();
            if (notifyDate.date() != currentDate.date() || notifyDate.month() != currentDate.month()) {
                return;
            }

            MedicationService.getItems().then(function (medications) {
                event.medication = _.find(medications, {id: event.medication_id});
                event.event = _.find(event.medication.schedule.times, {id: event.scheduled});
                showModal(event);
            });
        });
    }
})();
