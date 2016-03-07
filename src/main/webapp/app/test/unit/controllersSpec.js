describe('lobbyController', function(){

    beforeEach(module('charlieApp'));

    it('should have a lobby name exactly 3', inject(function($controller) {
        var scope = {},
            ctrl = $controller('lobbyController', {$scope:scope});

        expect(scope.lobbyName.length).toBe(3);
    }));

});