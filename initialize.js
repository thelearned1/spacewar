// math
const pi = Math.PI;

// globals
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// canvas colors
ctx.strokeStyle = 'white';

// missile parameters
const mInitV = 15;
const missileMass = 1;
const missileSize = 4;

// player ship parameters 
const playerSize = 15
const cp1 = [0, 0.6]            // Bezier curve control point 1
const cp2 = [0.28, 0.28]        // Bezier curve control point 2

// sun parameters
const sunX = canvas.width/2     
const sunY = canvas.height/2
const sunSize = 25;
const gravConstant = 250;       // gravitational constant for accel

// physics objects
const phys = [];

/**
 * Represents an individual component of a Star's sprite.
 * @class
 */
class Trail {
    constructor () {
        this.deltaTheta = pi*((2*Math.random())-1);
        this.rad = Math.floor(10*Math.random());
        this.theta = 0;
    }

    update () {
        const cosTheta = Math.cos(this.theta)*this.rad, 
              sinTheta = Math.sin(this.theta)*this.rad;
        ctx.beginPath();
        ctx.moveTo(sunX-cosTheta, sunY-sinTheta);
        ctx.lineTo(sunX+cosTheta, sunY+sinTheta);
        ctx.stroke();
        ctx.closePath();
        this.theta+=this.deltaTheta;
    }
} // Trail

/**
 * Represents the star at the center of the <it>Spacewar!</it> system.
 * @class Star 
 */
class Star {
    constructor () {
        this.x = sunX
        this.y = sunY
        this.size = sunSize
        this.trails = [];
        phys.push(this);
    }

    draw () {
        this.trails.forEach(t => {
            t.update();
        })
    }

    createTrail () {
        this.trails.push(new Trail());
    }

    update () {
        if (this.trails.length===1) {
            this.createTrail();
        } else if (this.trails.length <= 6 && Math.floor(2*Math.random())===1) {
            this.createTrail()
        } else {
            this.trails.pop();
        }
        this.draw();
    } // update 
} // Star

class Player {
    constructor (x, y, color, size=25) {
        this.x = x;
        this.y = y;
        this.v = [0, 0];
        this.theta = -pi/4;
        this.color = color;
        this.size=size
        this.missiles=100;
        this.mass=1100;
        phys.push(this);
    }

    

    bezierDraw () {
        // const cosTheta = Math.cos(theta), sinTheta = Math.sin(Theta);
        let p = new Path2D();
        let x = this.x, y=this.y, size=this.size, color=this.color;

       // ctx.rotate(this.theta);
        // specify port half
        p.moveTo(x, y);
        p.bezierCurveTo(x+(size*cp1[0]), y+(size*cp1[1]),
                        x+(size*cp2[0]), y+(size*cp2[1]), 
                        x+size,          y+size)
        
        // specify starboard half
        p.moveTo(x, y);
        p.bezierCurveTo(x+(size*cp1[1]), y+(size*cp1[0]),
                        x+(size*cp2[1]), y+(size*cp2[0]), 
                        x+size,          y+size)


        p.closePath();
        this.sprite = p;

        // fill path
        ctx.fillStyle = color
        ctx.fill(p)
       // ctx.rotate(-this.theta);
    } // draw

    fire () {
        if (this.missiles > 0) {
            this.v-=((missileMass*mInitV)/(--this.mass))  
            this.missiles--;
            return new Missile (this.x+missileSize, this.y+missileSize,  
                                [this.v[0]+mInitV*Math.cos(this.theta),
                                 this.v[1]+mInitV*Math.sin(this.theta)],
                                this.theta,
                                this.color, 4)
        }
    }

    update () {
        const xDiff = sunX-this.x, yDiff = sunY-this.y,
              sunDist = Math.sqrt(xDiff*xDiff+yDiff*yDiff),
              sunTheta = Math.atan2(yDiff, xDiff);
        this.x+=this.v[0]; this.y+=this.v[1];
        this.v[0]+=(gravConstant/(sunDist*sunDist))*Math.cos(sunTheta);
        this.v[1]+=(gravConstant/(sunDist*sunDist))*Math.sin(sunTheta);
        this.draw();
    }
} // Player

class Missile {
    constructor (x, y, v, theta, color, size=missileSize) {
        this.mass = missileMass; 
        this.x = x+50;
        this.y = y;
        this.v = v;
        this.color = color;
        this.size = size;
        this.theta = theta;
        phys.push(this);
    }

    draw () {
        const cosTheta = this.size*Math.cos(this.theta),
              sinTheta = this.size*Math.sin(this.theta);
        ctx.beginPath();
        ctx.moveTo(this.x-cosTheta, this.y-sinTheta);
        ctx.lineTo(this.x+cosTheta, this.y+sinTheta);
        ctx.endPath();
        ctx.stroke();
    }

    update () {
        const xDiff = sunX-this.x, yDiff = sunY-this.y,
              sunDist = Math.sqrt(xDiff*xDiff+yDiff*yDiff),
              sunTheta = Math.atan2(yDiff, xDiff);
        this.x+=this.v[0]; this.y+=this.v[1];
        this.v[0]+=(gravConstant/(sunDist*sunDist))*Math.cos(sunTheta);
        this.v[1]+=(gravConstant/(sunDist*sunDist))*Math.sin(sunTheta);
        this.draw();
    }
} // Missile


const theSun = new Star ();
const player = new Player(50, 50, 'blue', playerSize)

window.addEventListener('keydown', (k) => {
    if (k.key === 'w') {
        console.log('firing missiles!')
        const m = player.fire();
        if (m) {
            phys.push(m)
        }
    }
})

setInterval(() => {
    ctx.clearRect(0, 0, 2*canvas.width, 2*canvas.height);
    phys.forEach(x => x.update());
}, 30)