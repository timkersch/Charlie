# Charlie
A Spotify based music quiz application.

## About
The purpose of the application is to simplify the task to create, distribute and play music quizes.
The original project was created in Mars, 2016 as part of the course "DAT076 - Web Applications" at Chalmers University of Technology.

The project was forked from the original one in September, 2016 with the purpose of rebuilding the project using Node.js instead of a Java backend, improve the product and implement new functionality.

## Contributors
The original project members during the course are listed below.

| Erik Nordmark     |
| Joakim Berntsson  |
| Simon Takman 		|
| Tim Kerschbaumer  |

## Overview
The application is a Spotify based music quiz which lets users create a quiz from or based on a playlist.
Friends can then join the quiz and everyone can play together. After starting the quiz, each user turns to their screen
and selects one of four artist choices for the questions.

### Graphical interface

#### Home
![Home](docs/images/home.png)
![Invited](docs/images/invited.png)

#### Create Quiz
![Created](docs/images/create-quiz.png)

#### Lobby
![Lobby](docs/images/lobby.png)

#### Questions
![Question](docs/images/question.png)
![Answered](docs/images/answered.png)
![Score](docs/images/score.png)

#### Scoreboard
![Scoreboard](docs/images/scoreboard.png)

## Technical design
The application is built with AngularJS as the frontend application and Node.js as the backend solution.

### Libraries
Backend
-
-
-

Frontend
- Angular
- Angular Material Design
- Bootstrap
- JQuery

## Setup
This section explains how to setup and run the project

### Run project
To run this project follow the instructions below.
```
git clone https://github.com/timkersch/Charlie.git
```
Then in the Charlie directory install the dependencies with npm
```
npm install
```
Fire up the server locally with
```
npm start
```

You must also create a file for connecting with the Spotify API.
```
Charlie/.env
```
The credentials can be obtained from Spotifys website.
The structure of the file should be the following:
```
CLIENT_ID=123id123
CLIENT_SECRET=123secret123
COOKIE_SECRET=321secret321
CALLBACK=http://localhost:8080/callback.html
```