var app = angular.module('myApp', ['ngRoute', 'ngCookies']);

app.constant('cfg', {
    serviceurl_base : 'https://localhost:8443/library',
    casurl_base : 'https://localhost:8443/cas',
    username: 'user1',
    password: 'password1'
})

app.controller('RESTController', function (cfg, $scope, $http, $window) {

    $scope.tgt = "";
    $scope.btn_disabled = true;
    
    $scope.login = function () {
        doCasAuthenticate();
        $scope.btn_disabled = false;
    }

    $scope.logout = function () {
        doCasDeauthenticate();
        $scope.btn_disabled = true;
    }
    
    $scope.casAuthenticate = function () {
        doCasAuthenticate();
    }

    $scope.casDeauthenticate = function () {
        doCasDeauthenticate();
    }

    
    $scope.getBooks = function () {
        doGet(cfg.serviceurl_base + "/api/book/GetBooks");
    }
    
    $scope.addBook = function () {
        doPost(cfg.serviceurl_base + "/api/book/AddBook", '{"BookId":"10001","BookName":"Who moved my cheese?","Description":""}');
    }
    
    var doCasAuthenticate = function () {
        console.log("Getting TGT...");
        print("Logging in..");
        
        $http({
            method: 'POST',
            url: cfg.casurl_base + "/v1/tickets",
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            data: {username: cfg.username, password: cfg.password}
        }).success(function (data, status, headers, config) {
            
            if(status === 201){
                var location_val = headers('Location');
                console.log(location_val);            
                $scope.tgt = location_val.substring(location_val.lastIndexOf("/")+1);
                console.log("TGT is: " + $scope.tgt);
                print("Login successful");
            }
            else{
                console.log("We did not get redirection response. Instead we got: " + status);
            }
        });
        
    }
    
    var doCasDeauthenticate = function () {

        $http({
            method : 'DELETE',
            url : cfg.casurl_base + "/v1/tickets/" + $scope.tgt
        }).success(function (data, status, headers, config) {

            if (status === 200) {
                console.log("Logged out from CAS");
                print("Logged out from CAS");
            }
        });
    }

    var doGet = function (url_service) {

        console.log("Request: " + url_service);
        
        var tgt = $scope.tgt;
        var url_val = cfg.casurl_base + "/v1/tickets/" + tgt;
        
        $http({
                method: 'POST',
                url: url_val,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: {service: url_service}
            }).success(function (data, status, headers, config) {
                
                if(status === 200){
                    console.log("Service Ticket: " + data);    
                    var serviceurl = url_service + ((url_service.indexOf("?")>-1)?'&':'?') + 'ticket='+data;
                    console.log("Service URL : " + serviceurl);    
                    
                    // --- Perform actual GET with the service ticket
                    $http({
                        method: 'GET',
                        url: serviceurl
                    }).success(function (data, status, headers, config) {
                        console.log(data);    
                        print(data);
                    }).error(function (data, status, headers, config) {
                        console.log("error");
                        console.log(data);
                        print(data);
                    });
                    //End of GET
                }
                
            }); // End of ST
    }

    var doPost = function (url_service, payload) {

        console.log("Request: " + url_service);
        
        var tgt = $scope.tgt;
        var url_val = cfg.casurl_base + "/v1/tickets/" + tgt;
        
        $http({
                method: 'POST',
                url: url_val,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: {service: url_service}
            }).success(function (data, status, headers, config) {
                
                if(status === 200){
                    console.log("Service Ticket: " + data);    
                    var serviceurl = url_service + ((url_service.indexOf("?")>-1)?'&':'?') + 'ticket='+data;
                    console.log("Service URL : " + serviceurl);    
                    
                    // --- Perform actual POST with the service ticket
                    $http({
                        method : 'POST',
                        url : serviceurl,
                        headers : {
                            'Content-Type' : 'application/json'
                        },
                        data : payload
                    }).success(function (data, status, headers, config) {
                        console.log(data);
                        print(data);
                    }).error(function (data, status, headers, config) {
                        console.log("error");
                        console.log(data);
                        print(data);
                    });
                    //End of POST
                }
                
            }); // End of ST
    }

    var print = function (data) {
        document.getElementById("json").innerHTML = syntaxHighlight(JSON.stringify(data, undefined, 2));
    }

});