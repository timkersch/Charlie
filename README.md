# Charlie
Group #1's contribution to the web application project, 2016.

## About
This project was created in Mars, 2016. The purpose of the application is to simplify the task to create and distribute music quizes. 

## Members
Erik Nordmark		870907		erinord@student.chalmers.se
Joakim Berntsson	940524		joabern@student.chalmers.se
Simon Takman		930321		takman@student.chalmers.se
Tim Kerschbaumer	931022		ktim@student.chalmers.se

## Overview
The application is a spotify based music quiz, which lets the user invite friends, choose a playlist and start a quiz based on that playlist. The creator will have control of the music but no other special permissions is given to the creator.

### Permissions
The application requires a spotify account, network connection and a modern web browser. 

### Use cases

### Graphical interface

## Technical design
The application is built with AngularJS as the frontend application and Java EE as the backend solution. 

### UML

### Approach
The application is built with the service based approach pattern.

### Layers
Model
	Player
	Question
	Quiz
	User
	UserIdentity
	UserSession
	
Persistence
	UserIdentity
	User

Service
	charlieProxy
	
Control
	mainController
	homeController
	lobbyController
	createController
	questionController
	scoreboardController
	profileController
	
View
	create
	profile
	home
	lobby
	question
	scoreboard

- Group name
- Group members (Name, SSnumber, Mail)
- General overview of the system
    - What is it?
    - What should it do?
    - Roles of the user
    - Permissions
    - List of fully functional use-cases (One scentence)
- Technical design of the system
    - Object oriented model as UML
    - Selected approach
    - Physical setup
    - Participating software components (Libs, osv)
    - The modules of each component and the responsibilites for each module
    - A layered view of the application (model, percistance, service, control & view)

