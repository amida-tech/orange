(function () {
    'use strict';

    angular
        .module('orange')
        .controller('TodayCtrl', TodayCtrl);

    TodayCtrl.$inject = ['$q', '$scope', '$stateParams', '$ionicLoading', '$ionicModal', '$cordovaDatePicker',
        'n2w', 'PatientService', 'MedicationService', 'DoseService', 'GlobalService', 'notifications'];

    function TodayCtrl($q, $scope, $stateParams, $ionicLoading, $ionicModal,$cordovaDatePicker, n2w,
                       PatientService, MedicationService, DoseService, GlobalService, notify) {
        var vm = this,
            doseModal = null,
            patient = null;

        vm.hideButtons = false;

        window.addEventListener('native.keyboardshow', function() {
            vm.hideButtons = true;
        });

        window.addEventListener('native.keyboardhide', function() {
            vm.hideButtons = false;
        });

        var dateFormat = $scope.settings.dateFormat;
        var fullDateFormat = $scope.settings.fullDateFormat;
        var timeFormat = $scope.settings.timeFormat;

        vm.scheduleDate = $stateParams.date || moment().format(dateFormat);
        vm.title = moment().format(dateFormat) === vm.scheduleDate ? 'Today' : moment(vm.scheduleDate, dateFormat).format(fullDateFormat);
        vm.schedule = null;
        vm.medications = null;
        vm.habits = null;

        vm.event = null;
        vm.dose = null;
        vm.withAsNeeded = false;

        vm.filters = [];

        vm.refresh = refresh;
        vm.confirmDose = confirmDose;
        vm.openModal = showModal;
        vm.closeModal = hideModal;
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
                date: moment(vm.scheduleDate, dateFormat).toDate(),
                mode: 'date',
                allowOldDates: true,
                allowFutureDates: true,
                androidTheme: $cordovaDatePicker.THEME_DEVICE_DEFAULT_DARK
            };

            $cordovaDatePicker.show(options).then(function (date) {

                if (date) {
                    vm.scheduleDate = moment(date).format(dateFormat);
                    vm.title = moment().format(dateFormat) === vm.scheduleDate ? 'Today' : moment(vm.scheduleDate, dateFormat).format(fullDateFormat);
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                    refresh();
                }
            });
        }


        function showModal(event, $event) {
            if ($event.target.tagName == 'SPAN') {
                return;
            }

            vm.event = event;
            vm.event.text = getEventText(event);
            vm.showDetails = !!event.dose_id || vm.title.toLowerCase() !== 'today';
            vm.isToday = moment().format(dateFormat) === vm.scheduleDate;
            if (!vm.showDetails) {
                vm.notes = '';
            }

            vm.dose = {
                medication_id: event.medication_id,
                date: moment().format(),
                taken: true,
                scheduled: event.scheduled,
                notes: event.dose && event.dose.notes
            };
            doseModal.show();
        }

        function hideModal(force) {
            force = force || false;
            if (vm.notes && !force) {
                GlobalService.showConfirm('All changes will discard. Continue?').then(
                    function (confirm) {
                        if (confirm) {
                            vm.event = null;
                            vm.dose = null;
                            doseModal.hide();
                        }
                    }
                );
            } else {
                vm.event = null;
                vm.dose = null;
                doseModal.hide();
            }
        }

        function confirmDose(event, skipped) {
            skipped = skipped || false;
            vm.quantity = event.medication.dose.quantity;
            var template = '<p class="text-center">Mark this medication event as' + (skipped ? ' skipped' : ' taken') + '?</p>';
            if (!skipped) {
                template = '<p>Modify this dose?</p><button-spinner model="today.quantity" min-value=1 subscribe="'+event.medication.dose.unit+'"></button-spinner>' + template;
            }

            GlobalService.showConfirm(template, event.medication.brand, $scope).then(
                function (confirm) {
                    if (!confirm) {
                        return;
                    }

                    var dose = {
                        medication_id: event.medication_id,
                        date: moment().format(),
                        taken: !skipped,
                        scheduled: event.scheduled,
                        dose: {
                            unit: event.medication.dose.unit,
                            quantity: vm.quantity
                        },
                        notes: vm.notes || ''
                    };

                    $ionicLoading.show({
                        template: 'Saving...'
                    });
                    DoseService.saveItem(dose).then(
                        undefined,
                        function (data) {
                            $ionicLoading.hide();
                            var template = data.data.errors.indexOf('invalid_medication_id') > -1
                                           ? 'Medication not found'
                                           : _.map(data.data.errors, _.startCase);
                            GlobalService.showError(template);
                        }
                    ).finally(function () {
                                     refresh();
                                     hideModal(true);
                                 })
                });
        }

        function getEventText(event) {
            var result = '';
            result += _.capitalize(n2w.toWords(event.doseModel.quantity || 0));
            result += ' ' + event.doseModel.unit;
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

        function getHabitsTime(event) {
            if (event.event === 'sleep') {
                return (event.when === 'before' ? vm.habits['sleep'] : vm.habits['wake']);
            } else {
                return vm.habits[event.event];
            }
        }

        function getFilterTitle(event) {
            var result = '';
            if (event.event.type == 'exact') {
                if (!_.isUndefined(event.scheduled)) {
                    result += moment(event.date).format(timeFormat);
                } else {
                    result += 'As Needed (' + moment(event.date).format(timeFormat) + ')';
                }

            } else {
                if (event.event.event === 'sleep') {
                    result += (event.event.when === 'after' ? 'After Wake' : 'Before Sleep');
                } else {
                    result += event.event.when + ' ' + event.event.event;
                }
                result = _.startCase(result);
                result += ' (' + moment(event.date).format(timeFormat) + ')';
            }


            return result;
        }

        function getFilterName(events) {
            var result = '';
            var event = events[0];
            var now = moment();

            if (event.dose_id) {
                if (event.took_medication) {
                    result = 'Taken ' + moment(event.dose.date).fromNow();
                } else {
                    result = 'Skipped';
                }
            } else {
                var eventDate = moment(event.date);
                if (eventDate >= now) {
                    result = eventDate.fromNow();
                } else {
                    result = moment.duration(now - eventDate).humanize() + ' overdue';
                }
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
                MedicationService.getAllItems(true),
                PatientService.getHabits(patient),
                DoseService.getAllItems(true)
            ]).then(
                function (data) {
                    // Update notify, on refresh scheduling
                    if (vm.schedule !== null && data[1].plain().length != vm.medications.length) {
                        notify.updateNotify();
                    }

                    vm.schedule = data[0].plain();
                    vm.medications = data[1].plain();
                    vm.habits = data[2].plain();
                    vm.doses = data[3].plain();
                    vm.schedule.forEach(function (elem) {
                        elem.medication = _.find(vm.medications, {id: elem.medication_id});
                        elem.doseModel = elem.medication.dose;

                        elem.event = _.find(elem.medication.schedule.times, {id: elem.scheduled});

                        //As Needed medication event
                        if (_.isUndefined(elem.event)) {
                            elem.event = {
                                type: 'exact',
                                time: moment(elem.date).format($scope.settings.timeFormat)
                            }
                        }

                        if (elem.dose_id) {
                            elem.dose = _.find(vm.doses, {id: elem.dose_id});
                            elem.doseModel = elem.dose.dose;
                        }
                        elem.status = getEventStatus(elem);
                    });

                    var groups = _.groupBy(vm.schedule, function (elem) {
                        var f = '';
                        var whens = {
                            'before': '1',
                            'during': '2',
                            'after': '3'
                        };
                        f += moment(elem.date).format('YYYY-MM-DD-HH-mm-');
                        if (elem.event.type === 'exact') {
                            f += '0-' + moment(elem.event.time, $scope.settings.timeFormat).format('HH:mm');
                        } else {
                            f += whens[elem.event.when] + '-' +  moment(getHabitsTime(elem.event), $scope.settings.timeFormat).format('HH:mm');
                        }
                        f += '-';
                        if (elem.dose_id) {
                            f += moment(elem.dose.date).format('HH:mm-');
                            f += (elem.took_medication ? '0' : '1')
                        } else {
                            f += '00:00-0';
                        }

                        return f;
                    });

                    //console.log(groups);
                    vm.filters = [];
                    var keys = _.keysIn(groups).sort();
                    _.forEach(keys, function(key) {
                        var events = groups[key];
                        var title = getFilterTitle(events[0]);
                        var name = getFilterName(events);
                        vm.filters.push({
                            title: title,
                            name: name,
                            events: events
                        })
                    });

                    vm.withAsNeeded = _.some(vm.medications, function (item) {
                        return item.schedule.as_needed === true;
                    });
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
                event.doseModel = event.medication.dose;

                // Simulate event object
                var $event = { target: {} };
                showModal(event, $event);
            });
        });
    }
})();
