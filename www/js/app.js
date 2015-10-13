angular.module('orange', ['ionic', 'restangular', 'ngMessages', 'ngCordova', 'ngPDFViewer', 'dibari.angular-ellipsis', 'ngIOS9UIWebViewPatch'])

    .run(function ($timeout, $ionicPlatform, Auth, $ionicHistory, $rootScope, $state, PatientService,
                   notifications, settings, errorList) {

             // Initializing app
             $rootScope.initialized = false;
             $rootScope.appOpen = true;
             $rootScope.settings = settings;
             $rootScope.ERROR_LIST = errorList;

             Auth.init().then(function (status) {
                 $rootScope.initialized = true;
                 $ionicHistory.nextViewOptions({
                     disableBack: true,
                     historyRoot: true
                 });
                 if (status === true) {
                     // User authorized
                     if ($rootScope.cachedState) {
                         PatientService.getPatient().then(function () {
                             $state.go($rootScope.cachedState.toState.name, $rootScope.cachedState.toParams);
                         });
                         return status;
                     }

                     PatientService.changeStateByPatient().then(notifications.updateNotify);
                 } else {
                     // Not authorized
                     $state.go('onboarding');
                 }
             });

             $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                 if (!$rootScope.initialized && toState.name !== 'loading' && toState.name !== 'onboarding') {
                     $rootScope.cachedState = {
                         toState: toState,
                         toParams: toParams
                     };
                     event.preventDefault();
                     $state.go('loading');
                 } else if ($rootScope.initialized && toState.name === 'loading') {
                     event.preventDefault();
                 }
             });

             ////////////////////////////////////

             $ionicPlatform.ready(function () {
                 // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                 // for form inputs)
                 $rootScope.isAndroid = ionic.Platform.isAndroid();
                 $rootScope.isIOS = ionic.Platform.isIOS();
                 if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                     //    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                     cordova.plugins.Keyboard.disableScroll(true);
                     //
                 }

                 _listeners();
                 //if (window.StatusBar) {
                 //    // org.apache.cordova.statusbar required
                 //    StatusBar.styleLightContent();
                 //}
             });

             function _listeners() {
                 //Resume/Pause
                 document.addEventListener('resume', function () {
                     $rootScope.$broadcast('onResume');
                 }, false);
                 document.addEventListener('pause', function () {
                     $rootScope.$broadcast('onPause');
                 }, false);

                 //Fix for Android back button
                 if (ionic.Platform.isAndroid()) {
                     $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                         var menuMap = [
                             'app.today.schedule',
                             'app.notes.list',
                             'app.medications',
                             'app.doctors.list',
                             'app.pharmacies.list',
                             'app.logs.list',
                             'app.sharing',
                             'app.settings'
                         ];

                         var rootStates = ['onboarding', 'app.today.schedule', 'logs'];

                         $ionicHistory.nextViewOptions({
                             historyRoot: false,
                             disableBack: false
                         });

                         $timeout(function () {
                             var currentView = $ionicHistory.currentView();
                             var currentHistoryId = $ionicHistory.currentHistoryId();
                             var history = $ionicHistory.viewHistory();

                             //Save today view
                             if (toState.name === 'app.today.schedule') {
                                 $rootScope.todayHistoryId = currentView.viewId;
                                 $rootScope.todayHistoryView = currentView;
                             }

                             if (rootStates.indexOf(toState.name) !== -1) {
                                 $ionicHistory.nextViewOptions({
                                     historyRoot: true
                                 });

                                 history.backView = null;
                             }

                             //Set history
                             if (toState.name != 'app.today.schedule' && _.indexOf(menuMap, toState.name) != -1 && !_.isUndefined($rootScope.todayHistoryId)) {
                                 currentView.backViewId = $rootScope.todayHistoryId;
                                 history.backView = $rootScope.todayHistoryView;
                                 currentView.index = 1;
                                 history.histories[currentHistoryId].stack = [$rootScope.todayHistoryView, currentView];
                             }
                         }, 300)
                     });
                 }

             }

         })

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, OrangeApiProvider, settings) {

                // Config Orange API
                OrangeApiProvider.setBaseUrl(settings.orangeApiUrl);
                OrangeApiProvider.setClientSecret(settings.clientSecret);


                $ionicConfigProvider.backButton.previousTitleText('').text('').icon('ion-arrow-left-c');
                // disable swipe back
                $ionicConfigProvider.views.swipeBackEnabled(false);
                // Native scrolling on Android
                // $ionicConfigProvider.platform.android.scrolling.jsScrolling(false);

                // Ionic uses AngularUI Router which uses the concept of states
                // Learn more here: https://github.com/angular-ui/ui-router
                // Set up the various states which the app can be in.
                // Each state's controller can be found in controllers.js
                $stateProvider
                    .state('loading', {
                        url: '/loading',
                        templateUrl: 'templates/core/loading.html'
                    })
                    .state('retry', {
                        url: '/retry',
                        templateUrl: 'templates/core/app.retry.html',
                        controller: 'RetryCtrl as retry'
                    })
                    .state('app', {
                        url: '/app',
                        abstract: true,
                        templateUrl: 'templates/core/app.menu.html',
                        controller: 'MenuCtrl',
                        cache: false
                    })
                    .state('app.today', {
                        url: '/today',
                        abstract: true,
                        views: {
                            'menuContent': {
                                template: '<ion-nav-view></ion-nav-view>'
                            }
                        }
                    })
                    .state('app.today.schedule', {
                        url: '?date',
                        templateUrl: 'templates/today/app.today.html',
                        controller: 'TodayCtrl as today',
                        cache: false
                    })
                    .state('app.today.as_needed', {
                        url: '/as_needed',
                        templateUrl: 'templates/today/app.today.as_needed.html',
                        controller: 'TodayAsNeededCtrl as asNeeded',
                        cache: false
                    })
                    .state('app.today.as_needed_add', {
                        url: '/as_needed/:id/add',
                        templateUrl: 'templates/today/app.today.as_needed_add.html',
                        controller: 'TodayAsNeededAddCtrl as asNeededAdd',
                        cache: false
                    })
                    .state('app.notes', {
                        url: '/notes',
                        abstract: true,
                        params: {
                            service: 'NoteService',
                            detailsState: 'app.notes.details'
                        },
                        views: {
                            menuContent: {
                                template: '<ion-nav-view/>'
                            }
                        }
                    })
                    .state('app.notes.list', {
                        url: '',
                        templateUrl: 'templates/notes/app.notes.html',
                        controller: 'NotesListController as notes_list',
                        cache: false
                    })

                    .state('app.notes.details', {
                        url: '/:id/details',
                        templateUrl: 'templates/notes/app.notes.details.html',
                        controller: 'NoteDetailsCtrl as note_details',
                        cache: false
                    })
                    .state('app.notes.add', {
                        url: '/add',
                        templateUrl: 'templates/notes/app.notes.add.html',
                        controller: 'NoteAddCtrl as notes_add',
                        cache: false
                    })
                    .state('app.notes.update', {
                        url: '/:id/update',
                        templateUrl: 'templates/notes/app.notes.add.html',
                        controller: 'NoteAddCtrl as notes_add'
                    })
                    .state('app.medications', {
                        url: '/medications',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/medications/app.medications.html',
                                controller: 'MedicationsCtrl as medications'
                            }
                        }
                    })
                    .state('app.medications_import', {
                        url: '/medications/import',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/medications/app.medications.import.html',
                                controller: 'LogMedicationsCtrl as medication'
                            }
                        }
                    })
                    .state('app.medication_add', {
                        url: '/medications/add',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/medications/app.medication.add.html',
                                controller: 'MedicationAddCtrl as medications_add'
                            }
                        },
                        params: {
                            backState: 'app.medications',
                            nextState: 'app.medication.schedule'
                        }
                    })
                    .state('app.medication', {
                        url: '/medication/{id}',
                        cache: false,
                        params: {
                            id: {value: null, squash: true}
                        },
                        views: {
                            'menuContent': {
                                template: '<ion-nav-view></ion-nav-view>',
                                controller: 'MedicationCtrl as medication'
                            }
                        }
                    })
                    .state('app.medication.details', {
                        url: '/details',
                        cache: false,
                        templateUrl: 'templates/medications/app.medications.details.html'
                    })
                    .state('app.medication.schedule', {
                        url: '/schedule',
                        cache: false,
                        templateUrl: 'templates/medications/app.medications.schedule.html',
                        controller: 'MedicationScheduleCtrl as schedule',
                        params: {
                            backState: 'app.medications'
                        }
                    })

                    .state('app.medication.events', {
                        url: '/events',
                        cache: false,
                        templateUrl: 'templates/medications/app.medications.events.html',
                        controller: 'MedicationEventsCtrl as events'
                    })

                    .state('app.doctors', {
                        url: '/doctors',
                        abstract: true,
                        params: {
                            service: 'DoctorService',
                            detailsState: 'app.doctors.details'
                        },
                        views: {
                            'menuContent': {
                                template: '<ion-nav-view></ion-nav-view>'
                            }
                        }

                    })
                    .state('app.doctors.list', {
                        url: '',
                        templateUrl: 'templates/doctors/app.doctors.html',
                        controller: 'BaseListController as doctors'
                    })
                    .state('app.doctors.search', {
                        url: '/search',
                        templateUrl: 'templates/doctors/app.doctors.search.html',
                        controller: 'DoctorSearchCtrl as doctorSearch',
                        cache: false
                    })
                    .state('app.doctors.details', {
                        url: '/:id/details',
                        templateUrl: 'templates/doctors/app.doctors.details.html',
                        controller: 'DoctorDetailsCtrl as doctorDetails'
                    })
                    .state('app.doctors.add', {
                        url: '/add',
                        templateUrl: 'templates/doctors/app.doctors.add.html',
                        controller: 'DoctorCtrl as doctor',
                        cache: false
                    })
                    .state('app.doctors.edit', {
                        url: '/:id/edit',
                        templateUrl: 'templates/doctors/app.doctors.add.html',
                        controller: 'DoctorCtrl as doctor'
                    })
                    .state('app.pharmacies', {
                        url: '/pharmacies',
                        abstract: true,
                        params: {
                            service: 'PharmacyService',
                            detailsState: 'app.pharmacies.details'
                        },
                        views: {
                            'menuContent': {
                                template: '<ion-nav-view></ion-nav-view>'
                            }
                        }
                    })
                    .state('app.pharmacies.list', {
                        url: '',
                        templateUrl: 'templates/pharmacies/app.pharmacies.html',
                        controller: 'BaseListController as pharmacies'
                    })
                    .state('app.pharmacies.add', {
                        url: '/add',
                        templateUrl: 'templates/pharmacies/app.pharmacies.add.html',
                        controller: 'PharmacyAddCtrl as pharmacies_add'
                    })
                    .state('app.pharmacies.edit', {
                        url: '/edit/:id',
                        templateUrl: 'templates/pharmacies/app.pharmacies.add.html',
                        controller: 'PharmacyAddCtrl as pharmacies_add'
                    })
                    .state('app.pharmacies.details', {
                        url: '/details/:id',
                        templateUrl: 'templates/pharmacies/app.pharmacies.details.html',
                        controller: 'PharmacyDetailsCtrl as pharmacy_details'
                    })
                    .state('app.logs', {
                        url: '/logs',
                        abstract: true,
                        views: {
                            'menuContent': {
                                template: '<ion-nav-view />'
                            }
                        }
                    })
                    .state('app.logs.list', {
                        url: '',
                        templateUrl: 'templates/logs/app.logs.html',
                        controller: 'LogsCtrl as menu_logs'
                    })
                    .state('app.logs.add', {
                        url: '/add',
                        templateUrl: 'templates/logs/logs.add.html',
                        controller: 'AddLogCtrl',
                        cache: false,
                        params: {
                            nextState: 'app.logs.list',
                            backState: 'app.logs.list'
                        }
                    })
                    .state('app.logs.add_my', {
                        url: '/my',
                        templateUrl: 'templates/logs/logs.add.html',
                        controller: 'AddLogCtrl',
                        params: {
                            nextState: 'app.logs.list',
                            backState: 'app.logs.list'
                        }
                    })
                    .state('app.logs.details', {
                        url: '/details/:id',
                        templateUrl: 'templates/logs/logs.details.html',
                        controller: 'LogDetailsCtrl as log_details',
                        cache: false
                    })
                    .state('app.logs.edit', {
                        url: '/edit/:id',
                        templateUrl: 'templates/logs/logs.add.html',
                        controller: 'AddLogCtrl',
                        params: {
                            nextState: 'app.logs.list',
                            backState: 'app.logs.details',
                            editMode: true,
                            fromMedication: false
                        }
                    })
                    .state('app.logs.request', {
                        url: '/request',
                        templateUrl: 'templates/logs/logs.request.html',
                        controller: 'RequestLogsCtrl',
                        cache: false,
                        params: {
                            nextState: 'app.logs.list'
                        }
                    })
                    .state('app.sharing', {
                        url: '/sharing',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/sharing/app.sharing.html',
                                controller: 'SharingCtrl as sharing',
                                cache: false
                            }
                        }
                    })
                    .state('app.sharing-accept', {
                        url: '/sharing/accept',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/sharing/app.sharing.accept.html',
                                controller: 'SharingAcceptCtrl as sharing_accept'
                            }
                        }
                    })
                    .state('app.sharing-report', {
                        url: '/sharing/report/:id?month&year',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/sharing/app.sharing.report.html',
                                cache: false,
                                controller: 'SharingReportCtrl as sharing_report'
                            }
                        }
                    })
                    .state('app.settings', {
                        url: '/settings',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/settings/app.settings.html',
                                controller: 'SettingsCtrl as settings'
                            }
                        }
                    })
                    .state('logs', {
                        url: '/onboarding/logs',
                        templateUrl: 'templates/logs/logs.html',
                        controller: 'LogsCtrl as logsCtrl'
                    })
                    .state('logs-add', {
                        url: '/onboarding/logs/add',
                        templateUrl: 'templates/logs/logs.add.html',
                        controller: 'AddLogCtrl',
                        cache: false,
                        params: {
                            nextState: 'logs',
                            backState: 'logs'
                        }
                    })
                    .state('logs-add-my', {
                        url: '/onboarding/logs/add/my',
                        templateUrl: 'templates/logs/logs.add.html',
                        controller: 'AddLogCtrl',
                        params: {
                            nextState: 'logs',
                            backState: 'logs'
                        }
                    })
                    .state('logs-edit', {
                        url: '/onboarding/logs/edit/:id',
                        templateUrl: 'templates/logs/logs.add.html',
                        controller: 'AddLogCtrl',
                        params: {
                            nextState: 'logs',
                            backState: 'logs',
                            editMode: true,
                            fromMedication: false
                        }
                    })
                    .state('logs-request', {
                        url: '/onboarding/logs/request',
                        templateUrl: 'templates/logs/logs.request.html',
                        cache: false,
                        controller: 'RequestLogsCtrl',
                        params: {
                            nextState: 'logs'
                        }
                    })
                    .state('logs-setup', {
                        url: '/onboarding/logs/setup',
                        templateUrl: 'templates/logs/logs.setup.html',
                        controller: 'LogsCtrl as setup',
                        params: {
                            from_medication: false,
                            log_id: null
                        }
                    })

                    .state('onboarding-log', {
                        url: '/onboarding/log/:patient_id',
                        abstract: true,
                        template: '<ion-nav-view></ion-nav-view>'
                    })
                    .state('onboarding-log.habits', {
                        url: '/habits/',
                        templateUrl: 'templates/logs/logs.setup.habits.html',
                        controller: 'LogHabitsCtrl as habits'
                    })
                    .state('onboarding-log.medications', {
                        url: '/medications',
                        abstract: true,
                        template: '<ion-nav-view></ion-nav-view>',
                        templateUrl: 'templates/logs/logs.setup.medications.html',
                        controller: 'LogMedicationsCtrl as medication',
                        cache: false
                    })

                    .state('onboarding-log.medications.list', {
                        url: '',
                        templateUrl: 'templates/logs/logs.setup.medications.html',
                        cache: false
                    })

                    .state('onboarding-log.medications.search', {
                        url: '/search',
                        templateUrl: 'templates/logs/logs.setup.medications.search.html',
                        controller: 'MedicationSearchCtrl as search',
                        cache: false
                    })
                    .state('onboarding-log.medications.add', {
                        url: '/search',
                        templateUrl: 'templates/medications/app.medication.add.html',
                        controller: 'MedicationAddCtrl as medications_add',
                        cache: false,
                        params: {
                            backState: 'onboarding-log.medications.search',
                            nextState: 'onboarding-log.medications.schedule'
                        }
                    })
                    .state('onboarding-log.medications.schedule', {
                        url: '/schedule',
                        templateUrl: 'templates/medications/app.medications.schedule.html',
                        controller: 'MedicationScheduleCtrl as schedule',
                        params: {
                            backState: 'onboarding-log.medications.search'
                        }
                    })
                    .state('onboarding-log.medications.events', {
                        url: '/events',
                        templateUrl: 'templates/medications/app.medications.events.html',
                        controller: 'MedicationEventsCtrl as events'
                    })
                    .state('account-create', {
                        url: '/onboarding/signup',
                        templateUrl: 'templates/logs/account_create.html',
                        controller: 'AccountCtrl',
                        cache: false
                    })
                    .state('account-login', {
                        url: '/login',
                        templateUrl: 'templates/logs/account_login.html',
                        controller: 'AccountCtrl'
                    })
                    .state('account-reset', {
                        url: '/reset',
                        templateUrl: 'templates/logs/logs.request.html',
                        controller: 'RequestLogsCtrl',
                        cache: false,
                        params: {
                            nextState: 'account-login'
                        }
                    })
                    .state('onboarding', {
                        url: '/onboarding',
                        templateUrl: 'templates/core/onboarding.html'
                    });

                // if none of the above states are matched, use this as the fallback
                $urlRouterProvider.otherwise('/loading');
            });
