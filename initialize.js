// math
const pi = Math.PI;

// canvas context
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// canvas colors
ctx.strokeStyle = 'white';

// missile parameters
const mInitV = 15;
const missileMass = 1;
const missileSize = 4;

// player ship parameters 
const playerSize = 25
const cp1 = [0, 0.6]        // Bezier curve control point 1
const cp2 = [0.28, 0.28]    // Bezier curve control point 2

// sun parameters
const sunX = canvas.width/2
const sunY = canvas.height/2
const sunSize = 25;

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
}

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
        if (this.trails.length===0) {
            this.createTrail();
            console.log("Creating first trail")
        } else if (this.trails.length <= 4 && Math.floor(2*Math.random())===1) {
            this.createTrail()
            console.log("Creating multiple trails")
        } else {
            this.trails.pop();
            console.log("Deleting trail");
        }
        console.log("Sun updated");
        this.draw();
    }
}

// physics objects
const phys = [];
const theSun = new Star ();
theSun.update();


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

    draw () {
        let p = new Path2D();
        let x = this.x, y=this.y, size=this.size, color=this.color;
        // specify port half
        p.moveTo(this.x, this.y);
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
    }

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
        this.x+=this.v[0]; this.y+=this.v[1];
    }
}

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
        // this.pre = ctx.save();
        // ctx.translate(this.x, this.y)
        // ctx.rotate(this.theta)
        // ctx.moveTo(this.x, this.y);
        // ctx.lineTo(this.x+this.size, this.y);
        // ctx.rotate(0-this.theta);
        // ctx.translate(0, 0)
        // ctx.stroke();
    }

    update () {

    }
}




const player = new Player(200, 200, 'blue', playerSize)
player.draw();

const m = new Missile(200, 200, 0, pi/2, 'blue', missileSize);
m.draw();

const star = new Star();
star.draw();


window.addEventListener('keydown', (k) => {
    if (k.key === 'w') {
        console.log('firing missiles!')
        const m = player.fire();
        m?.draw()
    }
})

setInterval(() => {
    ctx.clearRect(0, 0, 2*canvas.width, 2*canvas.height);
    phys.forEach(x => x.update());
}, 30)