app.factory('services', ['appconf', '$http', 'jwtHelper', function(appconf, $http, jwtHelper) {
    var label_c = 0;
    function get_class() {
        switch(label_c++ % 5) {
        case 0: return "label-primary"; break;
        case 1: return "label-success"; break;
        case 2: return "label-info"; break;
        case 3: return "label-warning"; break;
        case 4: return "label-danger"; break;
        }
    }

    return $http.get(appconf.api+'/services')
    .then(function(res) {
        //assign label_classes
        for(var lsid in res.data.lss) {
            res.data.lss[lsid].label_class = get_class();
        };

        //set old flag on hosts that haven't been updated lately
        var now = new Date();
        var old = new Date(now.getTime() - 1000*3600); //1 hour old enough?
        for(var type in res.data.recs) {
            res.data.recs[type].forEach(function(service) {
                if(Date.parse(service.updatedAt) < old) service.old = true;
            });
        }
        return res.data;
    });
}]);

app.directive('mcAdmins', function() {
    return {
        scope: { admins: '=', },
        templateUrl: 't/admins.html',
    } 
});

app.directive('mcSpecs', function() {
    return {
        scope: { specs: '=', },
        templateUrl: 't/specs.html',
    } 
});

app.directive('mcTests', function() {
    return {
        scope: { tests: '=', servicetypes: '=', /*testspecs: '=', hostgroups: '='*/},
        templateUrl: 't/tests.html',
        controller: function($scope, services) {
            services.then(function(_services) { 

                //find the service specified via uuid        
                $scope.get_service = function(uuid) {
                    for(var type in _services.recs) {
                        var recs = _services.recs[type];
                        for(var i = 0;i < recs.length;i++) {
                            if(recs[i].uuid == uuid) return recs[i];
                        };
                    }
                    return null;
                }
            }); 
        }
    } 
});

app.directive('mcHosts', ['services', function(services) {
    return {
        scope: { hosts: '=', serviceid: '='},
        templateUrl: 't/hosts.html',
        link: function(scope, element, attrs) {
            //link only gets executed once. I need to watch hosts list myself in case it changes
            function update() {
                scope._hosts = [];
                services.then(function(_services) {
                    scope.services = _services;
                    //convert list of host ids to service record
                    scope.hosts.forEach(function(id) {
                        //look for the serviceid
                        _services.recs[scope.serviceid].forEach(function(rec) {
                            if(rec.uuid == id) scope._hosts.push(rec);
                        });
                    });
                });
            }
            scope.$watch('hosts', function(nv, ov) {
                update();
            });
        }
    } 
}]);

app.controller('HeaderController', ['$scope', 'appconf', '$route', 'toaster', '$http', 'jwtHelper', 'serverconf', 'menu',
function($scope, appconf, $route, toaster, $http, jwtHelper, serverconf, menu) {
    $scope.title = appconf.title;
    serverconf.then(function(_c) { $scope.serverconf = _c; });
    menu.then(function(_menu) { $scope.menu = _menu; });
}]);

app.controller('AboutController', ['$scope', 'appconf', 'menu', 'serverconf', 'scaMessage', 'toaster',
function($scope, appconf, menu, serverconf, scaMessage, toaster) {
    scaMessage.show(toaster);
    menu.then(function(_menu) { $scope.menu = _menu; });
    serverconf.then(function(_c) { $scope.serverconf = _c; });
}]);

/*
app.controller('HomeController', ['$scope', 'appconf', '$route', 'toaster', '$http', 'jwtHelper', 'menu', 'serverconf',
function($scope, appconf, $route, toaster, $http, jwtHelper, menu, serverconf) {
    menu.then(function(_menu) { $scope.menu = _menu; });
    serverconf.then(function(_c) { $scope.serverconf = _c; });
}]);
*/

