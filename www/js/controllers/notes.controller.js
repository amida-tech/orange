(function () {
    "use strict";

    angular
        .module('orange')
        .controller('NotesCtrl', NotesCtrl);

    NotesCtrl.$inject = ['$scope', 'OrangeApi', '$stateParams'];

    /* @ngInject */
    function NotesCtrl($scope, OrangeApi, $stateParams) {

    }
})();

