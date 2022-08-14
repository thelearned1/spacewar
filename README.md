# README

_Spacewar!_ (1961) is a simulation of a dogfight between two spaceships, widely
regarded as the world's first video game.  This is a redesign and reimplement-
ation of the original game in JavaScript, intended for publication on my Web
site.  

# INSTALLATION

The current repository is intended for publication on my Web site; it contains
all of the files needed to operate as a standalone Web page.  Thus, the intended
mechanism for using the software is by accessing it at 
	
	https://www.moschata.net/spacewar

To host a version on your own site, you can simply clone this repo and ensure
that your page indexes `spacewar.html`.

Ensure that you have support for the latest version of HTML5's `canvas`. This
is the case with the latest version of all modern browsers. 

# OPERATION

In the present version, there is a single ship controlled via the following 
schema:
* `W` fires a missile from the ship. 
* `A` rotates the ship to port. 
* `S` rotates the ship to starboard.
* `D` activates the ship's thrusters.

In later versions of the game, `Esc` is planned to pause the simulation of 
physics, and `IJKL` will fulfill the functions of `WASD` for a second ship. 
These are not implemented at the time of writing (August 13, 2022), but that may
become the case before I have a chance to revise this README.

# MANIFEST 

The current version of the software contains the following files:

```
+ spacewar/
|
+--+ sprites/
|  | 
|  +-- ship1.png
|
+--+ styles
|  |
|  +-- game.css
|
+-- .gitignore
|
+-- LICENSE
|
+-- README.md
|
+-- initialize.js
|
+-- spacewar.html
```

# COPYRIGHT 

_Spacewar!_ is in the public domain.  See the **LICENSE** for details.

# WEB SITE

# GIT 

You can download the latest version of this software from Github via the
command line:
```
git clone https://github.com/thelearned1/spacewar
```

# BUGS

* When the player ship pulls an Icarus and flies to close to the sun, the
  gravitational force is sufficient to send it very far off the screen.  This
  is not avoidable without either collision detection or a bounded map, neither
  of which presently exist.
