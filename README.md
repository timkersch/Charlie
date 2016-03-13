# Charlie
Group #1's contribution to the web application project, 2016.

## About
This project was created in Mars, 2016. The purpose of the application is to simplify the task to create and distribute music quizes. 

## Contributors
| Name         		| SSN       | Email  						|
| ----------------- |:---------:| ----------------------------- |
| Erik Nordmark     | 870907 	| erinord@student.chalmers.se 	|
| Joakim Berntsson  | 940524    | joabern@student.chalmers.se 	|
| Simon Takman 		| 930321    | takman@student.chalmers.se 	|
| Tim Kerschbaumer  | 931022	| ktim@student.chalmers.se		|

## Overview
The application is a spotify based music quiz, which lets the user invite friends, choose a playlist and start a quiz based on that playlist. The creator will have control of the music but no other special permissions is given to the creator.

### Permissions
The application requires a spotify account, network connection and a modern web browser. 

### Use cases
These use cases includes name, goal, actors, precondition, main flow, alternative flow and postcondition. 

[use-cases.pdf](docs/use-cases.pdf)

### Graphical interface


## Technical design
The application is built with AngularJS as the frontend application and Java EE as the backend solution. 

### UML
![alt tag](docs/images/UML.png)

### Approach
The application is built with the service based approach pattern.

### Layers
Models
- Player.java
- Question.java
- Quiz.java
- User.java
- UserIdentity.java
- UserSession.java
	
Persistence
- UserIdentity.java
- User.java

Service
- charlieProxy.js
	
Controllers
- mainController.js
- homeController.js
- lobbyController.js
- createController.js
- questionController.js
- scoreboardController.js
- profileController.js
	
View
- create.html
- profile.html
- home.html
- lobby.html
- question.html
- scoreboard.html

### Libraries
Java Enterprise Edition
Michaelthelin Spotify API
Google Gson
Apache Derby
JUnit
Arquillian
Jasmine
Angular
Bootstrap
JQuery

## Setup
This section explains how to setup and run the project and its tests.

### Run project
To run this project follow the instructions below.
```
git clone https://github.com/jcberntsson/Charlie.git
```
Then open the project in Netbeans and add a database called "db" in the services tab. 

### Run Jasmine tests
To run the jasmine tests do the following.
```
git clone https://github.com/jcberntsson/Charlie.git
cd Charlie
npm install
karma start
```

## Run JUnit and Arquillian tests
To run the JUnit and Arquillian tests for this project do the following.
```
git clone https://github.com/jcberntsson/Charlie.git
```
Open in Netbeans and run test files: 
```
Charlie/src/test/java/TestUserPersistence.java
Charlie/src/main/test/core/PlayerTest.java
Charlie/src/main/test/core/QuestionTest.java
Charlie/src/main/test/core/QuizTest.java
Charlie/src/main/test/core/SpotifyServiceTest.java
```
