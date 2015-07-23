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

                $ionicConfigProvider.backButton.text('').icon('ion-arrow-left-c');
                // Ionic uses AngularUI Router which uses the concept of states
                // Learn more here: https://github.com/angular-ui/ui-router
                // Set up the various states which the app can be in.
                // Each state's controller can be found in controllers.js
                $stateProvider
                    .state('app', {
                        url: '/app',
                        abstract: true,
                        templateUrl: 'templates/menu.html'
                    })
                    .state('app.today', {
                        url: '/today',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/today.html',
                                controller: 'TodayCtrl'
                            }
                        }
                    })
                    .state('app.components', {
                        url: '/components',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/orange-components.html',
                                controller: 'ComponentsCtrl'
                            }
                        }
                    })
                    // setup an abstract state for the tabs directive
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
