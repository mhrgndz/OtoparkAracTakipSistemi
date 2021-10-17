angular.module("app",
[
    'ngRoute',
    'app.controller',
    'app.srv',
])
.config(function($routeProvider)
{       
    $routeProvider 
    .when("/",
    {
        templateUrl : "../view/homepage.html"
    })
    .when("/aracgiris",
    {
        templateUrl : "../view/aracgiris.html"
    })
    .when("/araccikis",
    {
        templateUrl : "../view/araccikis.html"
    })
    .when("/hareketraporlari",
    {
        templateUrl : "../view/hareketraporlari.html"
    })
});