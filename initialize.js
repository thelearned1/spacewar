// math
const pi = Math.PI;

// graphics and physics management
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const tickPerSecond = 30; 
const tickTime_ms = 1000 / tickPerSecond;
const maxTicksPerFrame = 300;

// colors
ctx.strokeStyle = 'white';

// missile parameters
const mInitV = 15;
const missileMass = 1;
const missileSize = 4;

// player ship parameters 
const playerSize = 15
const cp1 = [0, 0.6]            // Bezier curve control point 1
const cp2 = [0.28, 0.28]        // Bezier curve control point 2
const shipThetaOffset = -pi/4;  // offset Bezier curve angle to reflect front of ship

// sun parameters
const sunX = canvas.width/2     
const sunY = canvas.height/2
const sunSize = 25;
const gravConstant = 100;       // gravitational constant for accel

// physics objects
const phys = [];

/**
 * Represents an individual component of a Star's sprite.
 * @class
 */
class Trail {
    constructor () {
        this.deltaTheta = pi*((Math.random()/5)-0.1);
        this.rad = Math.floor(10*Math.random());
        this.theta = 0;
    }

    draw () {
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
        this.createTrail();
        this.createTrail();
        phys.push(this);
        this.count = 0;
    }

    draw () {
        this.trails.forEach(t => {
            t.draw();
        })
    }

    createTrail () {
        this.trails.push(new Trail());
    }

    update () {
        if ((this.count)%10===0) {
            if (this.trails.length===1) {
                this.createTrail();
            } else if (this.trails.length <= 6 && Math.floor(2*Math.random())===1) {
                this.createTrail()
            } else {
                this.trails.pop();
            }
        }
        this.count++
    } // update 
} // Star

class Player {
    constructor (x, y, color, size=25) {
        this.posX = x;
        this.posY = y;
        this.vel = [0, 0];
        this.theta = 0;
        this.color = color;
        this.size=size
        this.missiles=100;
        this.mass=1100;
        phys.push(this);
    }
    

    draw () {
        // const cosTheta = Math.cos(theta), sinTheta = Math.sin(Theta);
        let p = new Path2D();
        let x = this.posX, y=this.posY, size=this.size, color=this.color;
        

        // set rotation point 
        ctx.translate(x, y)
        ctx.rotate(this.theta+shipThetaOffset);
        ctx.translate(-x, -y)


        // draw the ship 
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

        // set canvas transformation to default
        ctx.setTransform(1,0,0,1,0,0);
    } // draw

    fire () {
        if (this.missiles > 0) {
            this.vel-=((missileMass*mInitV)/(--this.mass))  
            this.missiles--;
            return new Missile (this.posX+missileSize, this.posY+missileSize,  
                                [(this.vel)[0]+mInitV*Math.cos(this.theta),
                                 (this.vel)[1]+mInitV*Math.sin(this.theta)],
                                this.theta,
                                this.color, 4)
        }
    }

    update () {
        const xDiff = sunX-this.posX, yDiff = sunY-this.posY,
              sunDist = Math.sqrt(xDiff*xDiff+yDiff*yDiff),
              sunTheta = Math.atan2(yDiff, xDiff);
        this.posX+=(this.vel)[0]; this.posY+=(this.vel)[1];
        (this.vel)[0]+=(gravConstant/(sunDist*sunDist))*Math.cos(sunTheta);
        (this.vel)[1]+=(gravConstant/(sunDist*sunDist))*Math.sin(sunTheta);
    }
} // Player

class Missile {
    constructor (x, y, vel, theta, color, size=missileSize) {
        this.mass = missileMass; 
        this.x = x+50;
        this.y = y;
        this.vel = vel;
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
        ctx.closePath();
        ctx.stroke();
    }

    update () {
        const xDiff = sunX-this.x, yDiff = sunY-this.y,
              sunDist = Math.sqrt(xDiff*xDiff+yDiff*yDiff),
              sunTheta = Math.atan2(yDiff, xDiff);
        this.x+=(this.vel)[0]; this.y+=(this.vel)[1];
        (this.vel)[0]+=(gravConstant/(sunDist*sunDist))*Math.cos(sunTheta);
        (this.vel)[1]+=(gravConstant/(sunDist*sunDist))*Math.sin(sunTheta);
    }
} // Missile


const theSun = new Star ();
const player = new Player(50, 50, 'white', playerSize)

window.addEventListener('keydown', (k) => {
    if (k.key === 'w') {
        console.log('firing missiles!')
        const m = player.fire();
        console.log(m);
        // if (m) {
        //     phys.push(m)
        // }
    }
})

let lastFrameTime = performance.now(); 
let deltaT = 0;
function mainLoop (timestamp) {
    console.log("deltaT: "+deltaT.toFixed(2)+
                " time: "+timestamp.toFixed(2)+
                " last frame: "+lastFrameTime.toFixed(2));
    deltaT += (timestamp-lastFrameTime)
    lastFrameTime = timestamp;

    while (deltaT >= tickTime_ms) {
        phys.forEach(x => x.update());
        deltaT -= tickTime_ms;
    }

    ctx.clearRect(0, 0, 2*canvas.width, 2*canvas.height);
    phys.forEach(x => x.draw());
    requestAnimationFrame(mainLoop);
} // mainLoop

mainLoop (performance.now());