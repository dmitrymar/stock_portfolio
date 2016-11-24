var myApp = angular.module('portfolio',[])

myApp.controller('SymbolCtrl', function($scope, $http, $interval) {
    'use strict';

    $scope.portfolio = [];
    $scope.folioSymbols = [];
    $scope.foundSymbol = "";

    $scope.searchSymbol = function() {
        var symbol = $scope.symbol ? $scope.symbol.toUpperCase() : "";
        $scope.symbol = "";
        // prevent request for an already found symbol
        if (symbol && $scope.foundSymbol !== symbol) {
            $scope.symbolAjax(symbol);
            $scope.foundSymbol = symbol;
        }
    }

    $scope.url = function(symbol) {
        return "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quote%20where%20symbol%20in%20(%22" + symbol + "%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
    }

    $scope.symbolAjax = function(symbol) {
        $http.get($scope.url(symbol))
            .then(function(response) {
                $scope.quote = response.data.query.results.quote;
                $scope.quote.timestamp = response.data.query.created;
                // clear shares input value
                $scope.shares = "";
            });
    }

    $scope.addToPortfolio = function() {
        var symbolInPortfolio = $scope.folioSymbols.indexOf($scope.quote.Symbol);
        var shares = $scope.shares || 0;
        $scope.quote.shares = shares;
        if ($scope.portfolio.length <= 5) {
            if (symbolInPortfolio > -1) {
                $scope.folioSymbols.splice(symbolInPortfolio, 1, $scope.quote.Symbol);
                $scope.portfolio.splice(symbolInPortfolio, 1, $scope.quote);
            } else if ($scope.portfolio.length < 5) {
                $scope.folioSymbols.push($scope.quote.Symbol);
                $scope.portfolio.push($scope.quote);
            }
        }
    }

    $scope.removeFromPortfolio = function(index) {
        $scope.folioSymbols.splice(index, 1);
        $scope.portfolio.splice(index, 1);
    }

    $scope.refreshPortfolio = function() {
        if ($scope.portfolio.length) {
            angular.forEach($scope.portfolio, function(value, key) {
                $http.get($scope.url(value.Symbol))
                    .then(function(response) {
                        var query = response.data.query;
                        value.timestamp = query.created;
                        value.LastTradePriceOnly = query.results.quote.LastTradePriceOnly;
                    });
            });
        }
    }

    $interval($scope.refreshPortfolio, 5000);

});
 
myApp.controller('HelloWorldController', ['$scope', function($scope) {
	  $scope.greeting = 'Hello World!';
}]);
