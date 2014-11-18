var LSCApp = angular.module('LSCApp', ['angular.filter', 'ngRoute', 'LSCControllers', 'chieffancypants.loadingBar'])
    .config(function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = true;
    }
    );
LSCApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/events', {
        templateUrl: 'lsccalendar.html',
        controller: 'LSCCalendar'
      }).
      when('/about', {
          templateUrl: 'lscabout.html',
          controller: 'LSCAbout'
      }).
      when('/events/:eventid', {
        templateUrl: 'lscevent.html',
        controller: 'LSCEvent'
      }).
      otherwise({
        redirectTo: '/events'
      });
  }]);
