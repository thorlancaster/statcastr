# statcastr
A web application to manipulate and display live stats feeds from a variety of sports.

## Usage
 - Clone the git repository to your computer
 - Start a web server at localhost and point your computer to index.html
 - Start the [yet-to-be-released] synchronizer server. The client will connect and show a blank list of events
 - For now, to get admin, you'll have to change isAdmin to true in the global SC variable, and then reload the page
 - __TL;DR__ Statcastr is currently not ready for public use. If you want to try a public feed try accessing redhawksports.net:1234 (change main.js)
 
## Upcoming Features
 - Integration with the LoFi Wireless Radio project for doing stats 10+ miles away from the nearest WiFi or mobile data source
 -- Yes, I live in that hole you see on all the coverage maps. Northeast Montana.
 -- The LoFi project is yet to be released and the pro version requires an amateur radio liccense
 - More views for the stats
 -- Goal: Support all commonly used Statbroadcast features (this may take a few releases)

## Features
- Scoreboard view that looks like a standard scoreboard, with a play-by-play displaying stats of players currently on the court
- Team- and Opponent- stats view that displays the box score (and more to come)
- Play-By-Play view that displays each play, along with the time and score when the play happened
- Minimal CPU and network usage (for the minified version)
  - Unlike competing solutions, Statcastr DOESN'T reload most of the page / download a megabyte of JSON when plays happen.
  - Entire JS / CSS bundle is under 80 kilobytes for an instant, network-light stats experience
  - Progressive web app and service worker makes subsequent loads take only a few kilobytes
- Ergonomically designed admin panel
  - All actions can be performed by tapping, holding, or dragging buttons
  - Most common actions can be performed with touch gestures. With practice, this can be performed without even looking at the screen

## Design principles
This project (when finished) is intended as an open-source alternative to StatBroadcast.
It is built using inheritance and other good OO principles and is heavily based
off the MVC design principle.

The MVC architecture is realized with one Model (<class extends GameModel>), one Controller (TBD, will keep GameModel in sync with live feed), and several
Views (class extends <sport>GameView extends GameView). The User is able to select between Views with a tab control on the top of the screen, similar to StatBroadcast.

Updating the Views is done VIA a tree structure of UIPanel objects. When Update is called on a UIPanel, it updates itself and its children, similar to how Java Swing works. Resizing of the browser window is also handled this way, with different methods for calculating and updating styles to avoid layout thrashing.

CSS-in-JS is used quite a bit to prevent the CSS file from becoming an "append-only stylesheet". The only Classes that rely on CSS are UIPanel and other top-level classes. Custom CSS "skins" will also be easy to support due to inheritance; each class adds its name to the DOM element's classList.

The app is designed as a progressive web app; Once loaded it can work 100% offline, even without LoFi. Once a network or LoFi connection is established, scores are automatically synced to the server in real time, using a minimum of data.
