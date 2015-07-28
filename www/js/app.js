angular.module('orange', ['ionic'])

    .run(function ($ionicPlatform) {
             $ionicPlatform.ready(function () {
                 // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                 // for form inputs)
                 if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                     cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                     cordova.plugins.Keyboard.disableScroll(true);

                 }
                 if (window.StatusBar) {
                     // org.apache.cordova.statusbar required
                     StatusBar.styleLightContent();
                 }
             });
         })

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

                $ionicConfigProvider.backButton.previousTitleText('').text('').icon('ion-arrow-left-c');
                // Ionic uses AngularUI Router which uses the concept of states
                // Learn more here: https://github.com/angular-ui/ui-router
                // Set up the various states which the app can be in.
                // Each state's controller can be found in controllers.js
                $stateProvider
                    .state('app', {
                        url: '/app',
                        abstract: true,
                        templateUrl: 'templates/app.menu.html'
                    })
                    .state('app.today', {
                        url: '/today',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.today.html',
                                controller: 'TodayCtrl'
                            }
                        }
                    })
                    .state('app.components', {
                        url: '/components',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.components.html',
                                controller: 'ComponentsCtrl'
                            }
                        }
                    })
                    .state('app.notes', {
                        url: '/notes',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.notes.html'
                            }
                        }
                    })
                    .state('app.medications', {
                        url: '/medications',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.medications.html'
                            }
                        }
                    })
                    .state('app.doctors', {
                        url: '/doctors',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.doctors.html'
                            }
                        }
                    })
                    .state('app.pharmacies', {
                        url: '/pharmacies',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.pharmacies.html'
                            }
                        }
                    })
                    .state('app.logs', {
                        url: '/logs',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.logs.html'
                            }
                        }
                    })
                    .state('app.notifications', {
                        url: '/notifications',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.notifications.html'
                            }
                        }
                    })
                    .state('app.settings', {
                        url: '/settings',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/app.settings.html'
                            }
                        }
                    })
                    .state('logs', {
                        url: '/onboarding/logs',
                        templateUrl: 'templates/logs.html'
                    })
                    .state('logs-add', {
                        url: '/onboarding/logs/add',
                        templateUrl: 'templates/logs.add.html'
                    })
                    .state('logs-add-my', {
                        url: '/onboarding/logs/add/my',
                        templateUrl: 'templates/logs.add.my.html'
                    })
                    .state('logs-request', {
                        url: '/onboarding/logs/request',
                        templateUrl: 'templates/logs.request.html'
                    })
                    .state('logs-request-sent', {
                        url: '/onboarding/logs/request/sent',
                        templateUrl: 'templates/logs.request.sent.html'
                    })

                    .state('account-create', {
                        url: '/account-create',
                        templateUrl: 'templates/account_create.html'
                    })
                    .state('account-login', {
                        url: '/account-login',
                        templateUrl: 'templates/account_login.html'
                    })

                    .state('onboarding', {
                        url: '/onboarding',
                        templateUrl: 'templates/onboarding.html'
                    });

                // if none of the above states are matched, use this as the fallback
                $urlRouterProvider.otherwise('/onboarding');

            });
