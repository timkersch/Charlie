/**
 * This test will go through most of the methods and a few of the listen events.
 * To run this test, go to console at root, run "npm install" and then "karma start".
 * @note: Sometimes the tests will fail because of Spotify denying our requests. If a fail
 * 			occurs, first try to run this test once more.
 * @precon: There is a user in the database (will occur when login at application)
 */

describe('charlieProxyTest', function() {
	var service;
	var initialized = false;
	
	beforeEach(function(done){
		if (!initialized) {
			initialized = true;
			module('charlieService');
			inject(function (charlieProxy) {
				service = charlieProxy;
				service.onReady(function(){
					done();
				});
			});	
		}else
			done();
	});
	
	it('can get an instance of my factory', function() {
		expect(service).toBeDefined();
	});

	it('service is ready', function() {
		expect(service.isReady()).toEqual(true);
	});

	// Login as test user
	var currentUser;
	it('retrive user that is logged in', function(done) {
		service.call("loginForTest", {}, function(user) {
			currentUser = user;
			expect(user).toBeDefined();
			done();
		});
	});
	
	// Try to retrieve playlist from user (also fails when the user do not have any playlists)
	it('retrieve playlists from socket', function(done){
		service.getPlaylists(function(lists){
			expect(lists.length > 0).toBe(true);  
			done();
		});
	});
	
	// Get the login url
	it('retrieve login url from socket', function(done){
		
		service.getLoginUrl(function(url){
			expect(url.length > 0).toBe(true);
			done();
		});
	});
	
	// Get the online users (and because the test only logins one user this list should be of length 1)
	it('retrieve online users from socket', function(done){
		
		service.getUsers(function(users){
			expect(users.length === 1).toBe(true);
			done();
		});
	});
	
	// Create a test quiz to be used below.
	var currentQuiz;
	it('create quiz', function(done){
		var name = "Testing Quiz";
		var userIds = [];
		var nbrOfSongs = 5;
		var generated = true;
		
		service.getPlaylists(function(lists){
			var playlistId = lists[0].id;
			var playlistOwner = lists[0].owner;
		
			service.createQuiz(name, userIds, playlistId, playlistOwner, nbrOfSongs, generated, function(quiz){
				expect(quiz.questions.length === nbrOfSongs).toBe(true);
				currentQuiz = quiz;
				done(); 
			});
		});
	});
	
	// Try to answer a question in the quiz.
	it('answer question on quiz', function(done){
		var guess = currentQuiz.questions[0].artists[0];
		service.nextQuestion(function(question){
			service.answerQuestion(guess, function(correctArtist){
				service.getResults(function(results){
					if (guess === correctArtist)
						expect(results[0].points > 0).toBe(true); 
					else
						expect(results[0].points === 0).toBe(true);
					
					done();
				});
			});
		});
	});
	
	// Get the current question twice and see that they are equal
	it('get current question for quiz', function(done){
		service.getCurrentQuestion(function(question){
			service.getCurrentQuestion(function(questionAgain){
				expect(question.track_url == questionAgain.track_url).toBe(true); 
				
				done();
			});
		}); 
	});
	
	// Check so that this user is owner of the quiz
	it('check if this user is owner of quiz', function(done){
		service.isQuizStarted(function(started){
			expect(started).toBe(true);
			done();
		});
	});
	
	// Get the users that are participating in this quiz, which should only be this user
	it('get users in quiz', function(done){
		service.getUsersInQuiz(function(users){
			expect(users.length === 1).toBe(true);
			done();
		});
	});
	
	// Go to next question, which should be different from the last one
	it('goto next question in quiz', function(done){
		service.getCurrentQuestion(function(question){
			service.nextQuestion(function(newQuestion){
				expect(question.track_url == newQuestion.track_url).toBe(false); 
				
				done();
			});
		}); 
	});
	
	// Force a game over and see if the event triggers
	it('goto next question in quiz', function(done){
		service.listenTo("gameOver", function(data){
			expect(data.length > 0).toBe(true);
			done();
		});
		service.nextQuestion(function(newQuestion){
			service.nextQuestion(function(newQuestion){
				service.nextQuestion(function(newQuestion){
					service.nextQuestion(function(newQuestion){
						
					});
				});
			});
		});
	});

});
