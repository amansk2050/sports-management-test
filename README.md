# SPORTS MANAGEMENT

## Question:

A backend application needs to be developed where coaches can store their team member
details like player name, matches played, how much they have won and how much they
have lost. Coaches can use this application to find the players based on their name
and the sport which they have played.Based on the statistics of matches they have
played, the most efficient player is shown on top in the search results.Admin can
also find the players across all the teams whereas coaches can search only among 
their teams which they coach for. 


## Approach :

This is a backend project made with NODE js application. I have followed here serveless architecture.

Made 4 lambda function function:

*  coach
*  playerDetails
*  sports
*  teams

Database table schema is provided inside :

* postgres/table.sql

### API details 

##### coach Lambda :

* POST - to add coach.
* PUT - to update coach.
* GET - to get all coach and their details.

##### playerDetails Lambda : 

Here, I have given my own logic to findout the most effecient player of any sport i.e:

1. every palying member for team will get 2 points if they win:
    *  1 for getting chance of playing
    *  1 for winning.
2. every playing member for team will get -0.5 points if loose.

There can be many ways to decide and yes we can improve this logic also.

* POST - to add player details
* PUT - to update player details
* GET - to get player details with respect to Admin and coach
* PATCH - to updated match deatils after completion of each (i.e won or lost, and updating player point)

##### sports :

* POST - to add different sports.
* PUT - to update all sports.
* GET- to get all sports.


##### teams:

* POST - to create teams and assign them with coach and sports they will play.
* PUT - to update team details.
* GEt - to get team details.


### Note :

* Database connection file is provided inside each lambda location is lambda/coach/lib/connection/postgress.js
  same for all lambda.

* Response.js file provided to maintain response location is lambda/coach/lib/response.js. SAme for all lambda.



