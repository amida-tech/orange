(function () {
    "use strict";

    angular
        .module('orange')
        .constant('settings', {
            'orangeApiUrl': 'https://orange-secure.amida-demo.com/api/v1',
            'clientSecret': 'testsecret',
            // 'orangeApiUrl': 'http://localhost:5000/v1/',
            // 'clientSecret': 'arewedoneyetquestionmark',
            'avatars': [
                {path: 'img/avatars/Option1.png', path2x: 'img/avatars/Option1@2x.png'},
                {path: 'img/avatars/Option2.png', path2x: 'img/avatars/Option2@2x.png'},
                {path: 'img/avatars/Option3.png', path2x: 'img/avatars/Option3@2x.png'},
                {path: 'img/avatars/Option4.png', path2x: 'img/avatars/Option4@2x.png'},
                {path: 'img/avatars/Option5.png', path2x: 'img/avatars/Option5@2x.png'},
                {path: 'img/avatars/Option6.png', path2x: 'img/avatars/Option6@2x.png'}
            ],
            'defaultLimit': 25,
            'defaultScrollDistance': '5%',  // for ion-infinite-scroll
            timeFormat: 'hh:mm a',
            dateFormat: 'YYYY-MM-DD',
            fullDateFormat: 'MMM Do YYYY'
        });
})();
