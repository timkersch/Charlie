/**
 * Created by Tim on 2016-09-29.
 */
"use strict";

module.exports =
    function($http) {

        // TODO better solution is to let backend decide on the owner
        let currentQuiz;

        return {
            isLoggedIn: function () {
                const user = sessionStorage.getItem('user');
                return (user !== undefined && user !== 'undefined');
            },

            isQuizOwner: function () {
                return currentQuiz.owner === sessionStorage.getItem('user');
            },

            getUser: function (callback) {
                const user = sessionStorage.getItem('user');
                if (user && user !== 'undefined') {
                    callback(user);
                } else {
                    $http({
                        method: 'GET',
                        url: '/api/getMe'
                    }).then(function successCallback(response) {
                        sessionStorage.setItem('user', response.data.userID);
                        callback(response.data.userID);
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