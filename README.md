# statcastr
A web application to display live stats feeds from a variety of sports.

## Usage
Clone the git repository and load index.html in your browser.

## Design principles
This project (when finished) is intended as an alternative to StatBroadcast.
It is built using inheritance and other good OO principles and is heavily based
off the MVC design principle.

The MVC architecture is realized with one Model (<class extends GameModel>), one Controller (TBD, will keep GameModel in sync with live feed), and several
Views (class extends <sport>GameView extends GameView). The User is able to select between Views with a tab control on the top of the screen, similar to StatBroadcast.

Updating the Views is done VIA a tree structure of UIPanel objects. When Update is called on a UIPanel, it updates itself and its children, similar to how Java Swing works. Resizing of the browser window is also handled this way, with different methods for calculating and updating styles to avoid layout thrashing.

CSS-in-JS is used quite a bit to prevent the CSS file from becoming an "append-only stylesheet". The only Classes that rely on CSS are UIPanel and other top-level classes. Custom CSS "skins" will also be easy to support due to inheritance; each class adds its name to the DOM element's classList.
