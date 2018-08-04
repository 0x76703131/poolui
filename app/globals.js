'use strict';

angular.module('pool.globals', [])

.factory('GLOBALS', function() {
	return {
		pool_name: "PoolTupi.com",
		api_url : 'https://pooltupi.com/api',
		api_refresh_interval: 10000,
		app_update_interval: 5*120000
	};
});
