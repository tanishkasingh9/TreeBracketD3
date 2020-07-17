# Australian Open Tournament Proceedings (2010-2014) using JavaScript and D3

## Demo 
<p align= "center">
<img src="https://raw.githubusercontent.com/tanishkasingh9/TreeBracketD3/master/treebracdemo.gif">
</p>


The idea for my application was to allow user to view the Bracket Tree of every year (2010-2014). This will particularly help users know the following aspects:
1.	Players that won or lost in each round, for every AUS open.
2.	What players did the winner beat to win AUS open for each year.
3.	What are best performing players of each year, across year.
<br>

I used HTML, CSS, D3, and JavaScript for this Assignment, few notable elements used:
1.	D3.tree
2.	D3.hierarchy
3.	Path and text SVG components
4.	D3.transitions, mouse events
5.	Z-index
<br>

Moreover, the path lines for the bracket tree are color coded red and green in addition to showing which player won a round, making it easier to follow a branch (starting any round) to the first round match for the year. Some improvements that can be made is having interactions showing match performance variables for everyone on hover. Size of final winner is increased to be more intuitive.
For running the application, open viz.html; no path required for data as the file is enough to run visualizations standalone. Click on year to view the bracket tree for that year.

