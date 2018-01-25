var app = angular.module('app',[])

app.controller('MainController', function($scope, $http, $timeout) {
  $scope.appname = 'SwiftStack Client Search Integration Demo'
  $scope.validated = false;
  $scope.invalid = true;
  $scope.searchComplete = false;
  $scope.searchSimple = '';
  $scope.searchJSON = '';

  // On load, post a message to the parent telling it which GUID we'll listen to for messages.
  $scope.update = function() {
  }
  $scope.update();

  // Add some event listeners for comms from SwiftStack client (the parent window).

  /* 
   * Event Flow:
   *
   *  - SwiftStack Client sends 'init-data' with some setup info to us: the elasticsearch URI, and the existing search query (if any).
   *  - No response needed.
   *
   *  - (Optional) We send 'validation-request' to SwiftStack Client with search as JSON:
   *  - Wait for 'validation-response' message, check value of e.data.validated to determine success or failure
   *  
   *  - We send 'search-request' with search data as JSON:
   *  - (Optional) wait for 'search-response' to come back inidicating the search was accepted and is running.
   */

  // On load, expect a message telling us where the elasticsearch endpoint is.
  window.addEventListener('message', function(e) {
    var data = JSON.parse(e.data);
    // We use $timeout here to force the scope to apply any changes we make below;
    // otherwise our use of window.addEventListener won't rebind them
    $timeout(function() {
      if ('type' in data) {
        if ( data.type === 'init-data') {
          $scope.elasticURI = data.elasticSearchURI;
          $scope.searchJSON = JSON.parse(data.query);
          console.log("SwiftStack Client tells me our elasticsearch endpoint is " + $scope.elasticURI);
          if ( $scope.searchJSON ) {
            console.log("SwiftStack Client tells me our existing query, as JSON, is " + $scope.searchJSON);
          }
        } else if ( data.type === 'validation-response' ) {
            $scope.validated = true;
            if ( data.validated ) {
              console.log("SwiftStack Client tells me our search is valid.");
              $scope.invalid = false;
            } else {
              console.log("SwiftStack Client tells me our search is invalid.");
              $scope.invalid = true;
              $scope.error   = data.error;
            }
        } else if ( data.type === 'search-response' ) {
          $scope.searchComplete = true;
          console.log("SwiftStack Client tells me our search was dispatched ok.");
        }
      }
    });
  } , false);

  // Ask the client to validate our search data.
  $scope.validateSearch = function() {
    var searchData;
    try {
      searchData = JSON.parse($scope.searchJSON);
    } catch (e) {
      $scope.validated = true;
      $scope.invalid   = true;
      return;
    }
    var postData = {
      'elasticEndpoint': '',
      'query': JSON.parse($scope.searchJSON),
      'type': 'validation-request'
    }
    parent.postMessage(JSON.stringify(postData),'*');
  }

  // Post search data to SwiftStack Client.
  $scope.searchRequest = function() {
    var postData =  { 
      elasticEndpoint: '',
      query: JSON.parse($scope.searchJSON),
      type: 'search-request',
    };
    parent.postMessage(JSON.stringify(postData),'*');
  }

});
