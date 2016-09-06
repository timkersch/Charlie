# Charlie
A Spotify based music quiz application.

## About
The purpose of the application is to simplify the task of creating, distributing and playing music quizes.
The original project was carried out in April and March, 2016 as part of the course "DAT076 - Web Applications" at Chalmers University of Technology.

The project was forked from the original one in September, 2016 with the purpose of rebuilding the project using Node.js instead of a Java backend, improve the product and add new functionality.

## Contributors
The original project members during the course were
- [Erik Nordmark](https://github.com/hxmn)
- [Joakim Berntsson](https://github.com/jcberntsson)
- [Simon Takman](https://github.com/SimonTakman)
- [Tim Kerschbaumer](https://github.com/timkersch)

## Overview
The application is a Spotify based music quiz which lets users create a quiz from or based on a playlist.
Friends can then join the quiz and everyone can play together. After starting the quiz, each user turns to their screen
and selects one of four artist choices for the questions.

## Technical design
The application is built with AngularJS as the frontend application and Node.js as the backend solution.

### Setup and run (Updated guide with DB to come)
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

### Graphical interface (Updated pics to come)

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