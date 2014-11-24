var LSCControllers = angular.module('LSCControllers', []);

LSCControllers.controller('LSCCalendar', function ($scope, $http, $timeout, cfpLoadingBar, $sce) {
    $scope.calendar = null;


    $scope.displayDate = function (displaydate) {
        return displaydate.split(":")[1];
    }


    var init = function () {
        $http.get("calendar.ashx?format=json").
            success(function (data, status, headers, config) {
                $scope.calendar = data;

            }).
            error(function (data, status, headers, config) {
                // log error
            });
    }
    init();







});

LSCControllers.controller('LSCEvent', function ($scope, $http, $timeout, cfpLoadingBar, $sce, $routeParams) {

    $scope.eventid = $routeParams.eventid;
    $scope.event = null;
    $scope.comments = null;
    $scope.commentshow = false;
    $scope.commentcount = 0;


    $scope.htmlDecode = function (input) {
        if (input != null && input.length > 0) {
            var e = document.createElement('div');
            e.innerHTML = input;
            return $sce.trustAsHtml(e.childNodes[0].nodeValue);
        }
        else {
            return "";
        }
    }


    var init = function () {
        $http.get("calendar.ashx?eventid=" + $scope.eventid).
            success(function (data, status, headers, config) {
                $scope.event = data[0].data.children[0].data;
                $scope.comments = data[1].data.children;
                $scope.commentcount = data[1].data.children.length;


            }).
            error(function (data, status, headers, config) {
                // log error
            });
    }


    init();


});



LSCControllers.controller('LSCAbout', function ($scope, $http, $timeout, cfpLoadingBar, $sce, $routeParams) {


});
