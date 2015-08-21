(function () {
    'use strict';

    angular
        .module('orange')
        .controller('SharingReportCtrl', SharingReportCtrl);

    SharingReportCtrl.$inject = ['$scope', '$stateParams', '$cordovaFile', 'PDFViewerService', 'Patient'];

    function SharingReportCtrl($scope, $stateParams, $cordovaFile, pdf, Patient) {
        var reportDir = cordova.file.dataDirectory,
            fileName = $stateParams.id + '.pdf';

        $scope.pdfURL = '';
        $scope.viewer = pdf.Instance('viewer');
        $scope.currentPage = 0;
        $scope.totalPages = 0;
        $scope.setReport = setReport;

        $scope.pageLoaded = function(currentPage, totalPages) {
            $scope.currentPage = currentPage;
            $scope.totalPages = totalPages;
        };

        $scope.loadProgress = function(loaded, total, state) {
            console.log('loaded =', loaded, 'total =', total, 'state =', state);
            $scope.loading = false;
        };

        setReport();

        function setReport(force) {
            force = force || false;
            $scope.loading = true;

            if (!force) {
                $cordovaFile.checkFile(reportDir, fileName).then(setPfdUrl, getReport);
            } else {
                $scope.$broadcast('scroll.refreshComplete');
                getReport();
            }
        }

        function getReport() {
            $scope.totalPages = 0;
            $scope.pdfURL = '';
            Patient.getReport($stateParams.id).then(
                function (data) {
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
    }
})();
