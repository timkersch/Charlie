/**
 * Created by Tim on 2016-09-29.
 */

module.exports =
    function($http) {
        "use strict";

        let currentQuiz;

        return {
            isLoggedIn: function () {
                const user = sessionStorage.getItem('user');
                return (user && user !== undefined && user !== 'undefined');
            },

            isQuizOwner: function () {
                return currentQuiz.owner === sessionStorage.getItem('user');
            },

            getUser: function (callback) {
                const user = sessionStorage.getItem('user');
                if (user && user !== 'undefined') {
                    const json = {
                        userID: user,
                        name: sessionStorage.getItem('name')
                    };
                    callback(json);
                } else {
                    $http({
                        method: 'GET',
                        url: '/api/getMe'
                    }).then(function successCallback(response) {
                        sessionStorage.setItem('name', response.data.name);
                        sessionStorage.setItem('user', response.data.userID);
                        const json = {
                            userID: response.data.userID,
                            name: response.data.name
                        };
                        callback(json);
                    }, function errorCallback() {
                        callback();
                    });
                }
            },

            logout: function () {
                sessionStorage.clear();
            },

            getPlaylists: function (callback) {
                $http({
                    method: 'GET',
                    url: '/api/getPlaylists'
                }).then(function successCallback(response) {
                    callback(response.data);
                }, function errorCallback() {
                    callback();
                });
            },

            getCurrentQuestion: function (callback) {
                $http({
                    method: 'GET',
                    url: '/api/getCurrentQuestion'
                }).then(function successCallback(response) {
                    callback(response.data);
                }, function errorCallback() {
                    callback();
                });
            },

            getResults: function (callback) {
                $http({
                    method: 'GET',
                    url: '/api/getResults'
                }).then(function successCallback(response) {
                    callback(response.data);
                }, function errorCallback() {
                    callback();
                });
            },

            getQuiz: function (callback) {
                $http({
                    method: 'GET',
                    url: '/api/getCurrentQuiz'
                }).then(function successCallback(response) {
                    currentQuiz = response.data;
                    callback(response.data);
                }, function errorCallback() {
                    callback();
                });
            },

            savePlaylist: function () {
                $http({
                    method: 'POST',
                    url: '/api/savePlaylist'
                }).then(function successCallback() {
                }, function errorCallback() {
                });
            },

        };
    };