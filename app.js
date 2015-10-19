var app = angular.module('myApp', ['ngAnimate', 'ngSanitize', 'mgcrea.ngStrap']);

app.controller('MainCtrl', function($scope) {
});

'use strict';

app.factory('GitHub',function GitHub($http){
    return {
      searchUsers:function (query) {
      return $http.get("https://api.github.com/search/users?q="+query);
      },
      getUserDetails:function(name) {
      return $http.get("https://api.github.com/users/"+name);
      },
      getUserRepos:function(name) {
      return $http.get("https://api.github.com/search/repositories?q=user:"+name);
      }
}

});

angular.module('myApp')

    .controller('GitHubUsersCtrl', function($scope, GitHub,$sce,$aside,$timeout,$templateCache) {

      $scope.panels=[];
      $scope.user_repos=[];
      $scope.panels.activePanel = 1;

      $scope.multiplePanels = {
        activePanels: [0,1]
      };

      //----------------------
      $scope.users_name='andrey';
      $scope.userTitleClick=function(i) {
       console.log( $scope.panels[i].user_name);
       if ($scope.panels[i].user_email =="") {
          GitHub.getUserDetails($scope.panels[i].user_name)
          .then(function(data) {
                console.log("getUserDetails=",data.data);
                $scope.panels[i].user_email    = data.data.email;
                $scope.panels[i].user_location = data.data.location;
                $scope.panels[i].public_repos  = data.data.public_repos;
          })
          .error(function(err){
                $scope.panels[i].user_email = '???';
          });
       }
      };
      $scope.fillUsers =function(items) {
        $scope.panels=[];
        for (item in items) {
          var profile_detail=$sce.trustAsHtml('user avatar<br> <img class="avatar" width="100px" height="100px" src="'+items[item].avatar_url+'" /> <span ng-model="panel.user_email"></span>');
          $scope.panels.push(
          {title: items[item].login,
           body:"" ,
           avatar_url:items[item].avatar_url,
           user_name: items[item].login,
           user_email:"",
           user_location:"",
           public_repos:""
           }
           );
        }
      };
      $scope.selectUsers = function() {
      GitHub.searchUsers($scope.users_name)
        .then(function(data){
          console.log(data.data.items)
          $scope.fillUsers(data.data.items);

          }
        )
        .error(function(data, status){alert(data)});
      };
      $scope.fillReposList = function(items) {
        console.log('fillRepos',items);
        $scope.user_repos=[];
        for (item in items.items) {
            $scope.user_repos.push({name:items.items[item].name,created_at:items.items[item].created_at})
        }
        console.log($scope.user_repos);

      };
      $scope.userReposList = function(i) {
          //var content_html=$sce.trustAsHtml('<repo-list></repo-list>');
          GitHub.getUserRepos($scope.panels[i].user_name)
          .then(function(data) {

            $scope.fillReposList(data.data);
            $timeout(function() {
                var    content_html = angular.element(document.getElementById('repo-list')).html();
                var repoList     = $aside({title: $scope.panels[i].user_name+' repos',html:true, content:content_html, show: true});
                repoList.show();
            },1200);


          })
          .error(function(data, status) {
          console.error(data);
          })
      };
    });