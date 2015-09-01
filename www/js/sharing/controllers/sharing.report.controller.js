(function () {
    'use strict';

    angular
        .module('orange')
        .controller('SharingReportCtrl', SharingReportCtrl);

    SharingReportCtrl.$inject = ['$scope', '$stateParams', '$ionicPopup', '$cordovaActionSheet', '$cordovaFile',
                                 'PDFViewerService', 'Patient'];

    function SharingReportCtrl($scope, $stateParams, $ionicPopup, $cordovaActionSheet, $cordovaFile, pdf, Patient) {
        var reportDir = cordova.file.externalCacheDirectory || cordova.file.cacheDirectory,
            fileName = $stateParams.id + '.pdf',
            printPdf = window.plugins.PrintPDF,
            pdfData;

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
        };

        $scope.loadProgress = function(loaded, total, state) {
            console.log('loaded =', loaded, 'total =', total, 'state =', state);
            $scope.loading = false;
        };

        getReport();

        function getReport() {
            $scope.loading = true;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.totalPages = 0;
            $scope.pdfURL = '';
            Patient.getReport($stateParams.id, $stateParams.month).then(
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
                buttonLabels: ['by Email', 'Print'],
                addCancelButtonWithLabel: 'Cancel',
                androidEnableCancelButton: true
            }).then(function (index) {
                switch (index) {
                    case 1:
                        window.plugins.socialsharing.shareViaEmail('', 'Orange Report', null, null, null, $scope.pdfURL);
                        break;
                    case 2:
                        printPdf.isPrintingAvailable(function (success) {
                            if (success) {
                                printPdf.print({
                                    data: _arrayBufferToBase64(pdfData),
                                    title: 'Report',
                                    success: function () {
                                        $ionicPopup.alert({
                                            title: 'Report',
                                            template: 'Your report sent to printer'
                                        });
                                    }
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
    }
})();
