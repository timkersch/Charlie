describe('charlieProxy', function() {
	beforeEach(module('charlieService'));
	
	var service;
	
	beforeEach(inject(function (charlieProxy) {
        service = charlieProxy;
    }));
	
	beforeEach(function(done) {
		service.onReady(function(){
			done();
		});
	});
	
	// Load your module.
	/*beforeEach(function(){
		angular.module('charlieService');
	});*/
	
	it('can get an instance of my factory', function() {
		expect(service).toBeDefined();
	});


	// Test if is ready returns the correct value
	it('service is ready', function() {
		expect(service.isReady()).toEqual(true);
	});

	// Test method isLoggedIn
	it('retrive user that is logged in', function(done) {
		var data = {
			id: 33
		};

		//Retrive user from db
		service.call("setUser", data, function(success) {
			expect(success).toBe(true);
			done();
		});
	});




});
