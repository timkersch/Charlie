describe('charlieProxy', function () {
  // Load your module.
  beforeEach(module('charlieService'));

  it('can get an instance of my factory', inject(function(charlieProxy) {
    expect(charlieProxy).toBeDefined();
  }));
  
  
  // Test if is ready returns the correct value
  it('can get variable of my factory', inject(function(charlieProxy) {
    var isReady = charlieProxy.isReady();
    console.log(isReady);
      
    if(isReady) {
            expect(charlieProxy.isReady()).toEqual(true);
    } else {
            expect(charlieProxy.isReady()).toEqual(false);
    }
    
  }));
  
  // Test method isLoggedIn
  it('retrive user that is logged in', inject(function(charlieProxy) {
      
        var socket = new WebSocket("ws://localhost:8080/SpotHoot/api");
        console.log("Socket: " + socket);
        
        var listenCallbacks = {};
        var user = {};
      
        socket.onmessage = function(event){
        console.log("Event: " + event);
        var response = angular.fromJson(event.data);
        if (angular.isDefined(callbacks[response.request_id])) {
            var callback = callbacks[response.request_id];
            delete callbacks[response.request_id];
            callback.resolve(response);
        } else {
            console.log("ListenEvent(%o)", response.action);
            var action = response.action;
            var data = response.data;
            try {
                data = JSON.parse(data);
            } catch(error) {}
            if (Array.isArray(listenCallbacks[action])) {
                for (var i = 0; i < listenCallbacks[action].length; i++) {
                    listenCallbacks[action][i](data);
                }
            }
           }
        };
        
        var data = {
                    id: user.id
                };
       
      //Retrive user from db
      charlieProxy.invoke("setUser", data).then(function(success){
          console.log(success);
      });
      //Set user

      
      var user = charlieProxy.isLoggedIn();
      console.log(user);
      
      expect(charlieProxy.isLoggedIn()).toBeDefined();
  }));
   

  
  
});
