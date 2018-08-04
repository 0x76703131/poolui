'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('poolui', [
	'pool.globals',
	'ngRoute',
	'ngMaterial',
	'md.data.table',
	'angularMoment',
	'ngStorage',
	'ngAudio',
	'utils.strings',
	'utils.services',
	'utils.xhr',
	'n3-line-chart',
	'angular-page-visibility'
	]).config(['$locationProvider', '$routeProvider', '$mdThemingProvider', function($locationProvider, $routeProvider, $mdThemingProvider) {
		$locationProvider.hashPrefix('')
		;	
		$mdThemingProvider.theme('default')
		.primaryPalette('grey')
		.accentPalette('light-blue');

		$routeProvider
		.when('/home', {
			templateUrl: 'user/home/home.html',
			controller: 'HomeCtrl',
			activetab: 'home'
		})
		.when('/dashboard', {
			templateUrl: 'user/dashboard/dashboard.html',
			controller: 'DashboardCtrl',
			activetab: 'dashboard'
		})
		.when('/blocks', {
			templateUrl: 'user/blocks/blocks.html',
			controller: 'BlocksCtrl',
			activetab: 'blocks'
		})
		.when('/payments', {
			templateUrl: 'user/payments/payments.html',
			controller: 'PaymentsCtrl',
			activetab: 'payments'
		})
		.when('/network', {
			templateUrl: 'user/network/network.html',
			controller: 'NetworkCtrl',
			activetab: 'network'
		})
		.when('/ports', {
			templateUrl: 'user/ports/ports.html',
			controller: 'PortsCtrl',
			activetab: 'ports'
		})
		.when('/help/chat', {
			templateUrl: 'user/help/chat.html',
			controller: 'ChatCtrl',
			activetab: 'support'
		})
		.when('/help/getting_started', {
			templateUrl: 'user/help/getting_started.html',
			controller: 'GettingStartedCtrl',
			activetab: 'help'
		})
		.when('/help/faq', {
			templateUrl: 'user/help/faq.html',
			controller: 'FAQCtrl',
			activetab: 'help'
		})
		.when('/help/config_generator', {
                        templateUrl: 'user/help/config_generator.html',
                        controller: 'ConfigGeneratorCtrl',
                        activetab: 'help'
                });

		$routeProvider.otherwise({redirectTo: '/home'});

	}]);

	app.controller('AppCtrl', function($scope, $rootScope, $location, $route, $routeParams, $anchorScroll, $window, $interval, $mdDialog, dataService, timerService, addressService, $mdSidenav, $mdMedia, $localStorage, ngAudio, GLOBALS, $http){
		
		$http.get("https://api.coinmarketcap.com/v1/ticker/aeon/?convert=BRL").then(function(response) {
                $scope.preco_brl = response.data[0].price_brl;
            });
		
		$scope.GLOBALS = GLOBALS;
		var appCache = window.applicationCache;
		$scope.$storage = $localStorage;

		$scope.poolList = ["pplns", "pps", "solo"];
		$scope.poolStats = {}; // All Pool stats
        $scope.poolHashrateChart = {}; // hashrate history
        $scope.poolMinersChart = {}; // miners history
		$scope.addrStats = {}; // All tracked addresses
		$scope.lastBlock = {};
		
		// for miner tracking
		$scope.yourTotalHashRate = 0;

		// Hashrate Alarm
		$scope.globalSiren = false;
		$scope.sirenAudio = ngAudio.load("assets/ding.wav");
		
		// Update global hashrate and set off alarm if any of the tracked addresses fall below the threshold
		var updateHashRate = function (addrStats){
			var totalHashRate = 0;
			var siren = false;
			
			_.each(addrStats, function(addr,index) {
				totalHashRate += addr.hash;
				if (addr.alarm && addr.hash < addr.alarmLimit) {
					siren=true;
				}
			});

			$scope.globalSiren=siren;
			$scope.yourTotalHashRate = totalHashRate;
		}

		var playSiren = function (){
			($scope.globalSiren) ? $scope.sirenAudio.play() : $scope.sirenAudio.stop();
		}

		// ------- UI HELPERS

		$scope.menuOpen = $mdMedia('gt-md');
		$scope.$watch(function() { return $mdMedia('gt-md'); }, function(big) {
			$scope.menuOpen = $mdMedia('gt-md');
		});

		$scope.toggleSidenav = function (){
			if (!$mdMedia('gt-md')) {
				$mdSidenav('left').toggle();
			} else {
				// toggle boolean
				$scope.menuOpen = !$scope.menuOpen;
			}
		}

		// ------- Miner Login and auth
		$scope.minerLogin = function (ev) {
			$mdDialog.show({
				controller: "LoginCtrl",
				templateUrl: 'user/home/login.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:true,
			  fullscreen: !$scope.menuOpen // Only for -xs, -sm breakpoints.
			})
			.then(function(answer) {
			  // success callback
			}, function(error) {
			  // error callback
			});
		}

		$scope.minerConsole = function (ev) {
			$mdDialog.show({
				locals: $scope.config,
				controller: "ConsoleCtrl",
				templateUrl: 'user/home/console.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:true,
			  fullscreen: !$scope.menuOpen // Only for -xs, -sm breakpoints.
			})
			.then(function(answer){
				if(answer=='logout'){
					dataService.logout();
				}
			}, function(reason){
				// console.log(reason);
			});
		}

		$scope.isLoggedIn = function() {
			return dataService.isLoggedIn();
		}

		// ------- App Update
		var update = function() {
			if (appCache.status == window.applicationCache.UPDATEREADY) {
				appCache.swapCache(); 
				$window.location.reload();
			}
		}

		appCache.addEventListener("updateready", function(event) {
			update();
		}, false);

		var updateCache = function () {
			appCache.update();
		}

		// API Requests
		var loadData = function () {
			dataService.getData("/pool/stats", function(data){
				$scope.poolList = data.pool_list;
				$scope.poolStats.global = data.pool_statistics;
			});

			dataService.getData("/network/stats", function(data){
				$scope.network = data;
				var dificuldade = $scope.network.difficulty / 240;
				var valorBloco = $scope.network.value / 1000000000000;
				var semanal = (((360 * valorBloco * 1) / dificuldade) * 0.94) * 7;
				$scope.oneHash = semanal;
			});
			
			dataService.getData("/pool/blocks/pplns?limit=50", function(data) {
				var blockCount = 0;
                var totalLuck = 0;
            $scope.pulledBlocks = data;
            for (var i = 0; i < $scope.pulledBlocks.length; i++) {
            	totalLuck += $scope.pulledBlocks[i].shares / $scope.pulledBlocks[i].diff;
            	blockCount += 1;
            }
				$scope.overallEffort = (totalLuck / blockCount) * 100;

			});
			
			//calcula quantos AEONs já foram pagos (menos taxas)
			/* dataService.getData("/pool/payments?limit=5000", function(data){
				var contadorPagamento = 0;
				var totalAEON = 0;
				
				$scope.pagobjeto = data;
				for (var x = 0; x < $scope.pagobjeto.length; x++) {
					totalAEON += ($scope.pagobjeto[x].value / 1000000000000) - 0.01;
					contadorPagamento += 1;
				}
					$scope.totAEON = totalAEON;
			}); */

		}

		var loadOnce = function () {
			dataService.getData("/config", function(data){
				$scope.config = data;
			});
			
			//conta o número de conexões em todas as portas
			dataService.getData("/pool/ports", function(data){
				var total = 0;
				_.each(data.global, function (port, index) {
					total +=  port.miners;
				})
				$scope.WorkersTotal = total;
		
			});	
		}

		// For FAQ
		$rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
			$location.hash($routeParams.scrollTo);
			$anchorScroll();  
		});

		// Start doing things
		loadOnce();
		loadData();
		update();
		
		// Start the timer and register global requests
		timerService.startTimer(GLOBALS.api_refresh_interval);
		timerService.register(loadData, 'global');
		$interval(updateCache, GLOBALS.app_update_interval); // check for app updates every 5 mins

		// Start address tracking servuce after starting timer, only one callback supported at a time
		addressService.start(function(addrStats) {
			$scope.addrStats = addrStats;
			updateHashRate(addrStats);
			playSiren();
		}
		);


		// Sponsor
		$scope.sponsor_open = false

	});
