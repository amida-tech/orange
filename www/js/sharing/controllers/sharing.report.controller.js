(function () {
    'use strict';

    angular
        .module('orange')
        .controller('SharingReportCtrl', SharingReportCtrl);

    SharingReportCtrl.$inject = ['$scope', '$stateParams', '$cordovaActionSheet', '$cordovaFile',
                                 'PDFViewerService', 'PatientService'];

    function SharingReportCtrl($scope, $stateParams, $cordovaActionSheet, $cordovaFile, pdf, PatientService) {
        var reportDir = cordova.file.externalCacheDirectory || cordova.file.cacheDirectory,
            fileName = $stateParams.id + '.pdf',
            printPdf = window.plugins.PrintPDF,
            pdfData,
            buttonLabels = ['Email'],
            deviceVersion = _.map(device.version.split('.'), Number),
            patient = null;

        // Only for iOS & Android 4.4+
        if (!(device.platform === 'Android' && (
                deviceVersion[0] < 4 || deviceVersion[0] === 4 && deviceVersion[1] < 4))) {
            buttonLabels.push('Print');
        }

        $scope.pdfURL = '';
        $scope.viewer = pdf.Instance('viewer');
        $scope.currentPage = 0;
        $scope.totalPages = 0;
        $scope.getReport = getReport;
        $scope.share = share;
        $scope.pdfHeight = window.innerHeight - 120;
        $scope.pdfWidth = window.innerWidth;

        $scope.pageLoaded = function(currentPage, totalPages) {
            $scope.currentPage = currentPage;
            $scope.totalPages = totalPages;
            $scope.loading = false;
        };

        $scope.loadProgress = function(loaded, total, state) {
            console.log('loaded =', loaded, 'total =', total, 'state =', state);
            $scope.loading = false;
        };

        PatientService.getItem($stateParams.id).then(function (item) {
            patient = item;
            var month = (Number($stateParams.month) + 1);
            fileName = patient.fullName.trim().replace(' ', '_') + '-' + $stateParams.year + '-' +
                (month < 10 ? '0' : '') + month;
            getReport();
        });

        function getReport() {
            setLoadingTrue();
            $scope.$broadcast('scroll.refreshComplete');
            $scope.totalPages = 0;
            $scope.pdfURL = '';
            PatientService.getReport($stateParams.id, $stateParams.month, $stateParams.year).then(
                function (data) {
                    pdfData = data;
                    $cordovaFile.writeFile(reportDir, fileName, data, true).then(
                        setPfdUrl,
                        function (error) {
                            $scope.loading = false;
                            console.log(error);
                        }
                    );
                }
            )
        }

        function setPfdUrl() {
            $scope.pdfURL = reportDir + fileName;
        }

        function share() {
            $cordovaActionSheet.show({
                title: 'Select service for share',
                buttonLabels: buttonLabels,
                addCancelButtonWithLabel: 'Cancel',
                androidEnableCancelButton: true
            }).then(function (index) {
                switch (index) {
                    case 1:
                        window.plugins.socialsharing.shareViaEmail('', 'Orange Report', null, null, null, $scope.pdfURL);
                        break;
                    case 2:
                        if (buttonLabels.length !== index) {
                            break;
                        }
                        printPdf.isPrintingAvailable(function (success) {
                            if (success) {
                                printPdf.print({
                                    data: _arrayBufferToBase64(pdfData),
                                    title: 'Report'
                                });
                            } else {
                                console.log('print is not available');
                            }
                        });
                        break;
                }
            });
        }

        function _arrayBufferToBase64( buffer ) {
            var binary = '';
            var bytes = new Uint8Array( buffer );
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode( bytes[ i ] );
            }
            return window.btoa( binary );
        }

        $scope.$on('pdfviewer.nextPage', setLoadingTrue);
        $scope.$on('pdfviewer.prevPage', setLoadingTrue);
        $scope.$on('pdfviewer.gotoPage', setLoadingTrue);

        function setLoadingTrue() {
            $scope.loading = true;
        }
    }
})();
