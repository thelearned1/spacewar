const pointBuffer = 0.5;

/**
 * Represents an object that can undergo collision. 
 */
class Collider {
	constructor () {
		if (this.constructor === Collider) {
			throw new Error('Cannot instantiate an abstract class')
		}
	}
}

/**
 * Represents a single point in 2D Euclidean space.
 * @extends Collider
 */
class Point extends Collider {
	constructor (x, y) {
		super();
		this.x=x; 
		this.y=y;
	}
}

/**
 * Represents a line segment in 2D Euclidean space.
 */
class Line extends Collider {
	constructor (x1,y1, x2,y2) {
		super();
		this.p1 = new Point(x1,y1);
		this.p2 = new Point(x2,y2);
		this.len = euclideanDist(p1, p2);
	}
}

/**
 * Represents a rectangle in 2D Euclidean space.
 */
class Rectangle extends Collider {
	constructor (x,y,w,h) {
		super();
		this.width=w;
		this.height=h;
		this.corner = new Point (x,y);
	}
}

/** Represents a circle in 2D Euclidean space.
 * 
 */
class Circle extends Collider {
	constructor (cx, cy, r) {
		super();
		this.r = r;
		this.center = new Point(cx,cy);
	}
}

/** Takes two points and determines the Euclidean distance between them.
 * 
 * @param {Point} p1, the first point
 * @param {Point} p2, the second point
 * @returns a `Number` representing the Euclidean distance between p1 and p2 
 */
function euclideanDist (p1, p2) {
	const deltaY = p1.y-p2.y, deltaX=p1.x-p2.x;
	return (Math.sqrt((deltaY*deltaY)+(deltaX*deltaX)));
} 

/** Determines whether two points are within `distance` of each other.
 * Can be used for point equality with `distance` set to a small value
 * (to account for floating point error).
 * @param {Point} p1 
 * @param {Point} p2
 * @param {Number} distance defaults to 0.5
 * @returns {Boolean} 
 */
function pointNearPoint (p1, p2, distance=pointBuffer) {
	return euclideanDist(p1, p2) <= distance;
}

/**
 * Determines whether a point lies on a line. 
 * @param {Point} p 
 * @param {Line} l 
 * @returns {Boolean}
 */
function pointOnLine (p, l) {
	let dSum = (euclideanDist(p, l.p1)+euclideanDist(p, l.p2));
	return dSum < l.len+pointBuffer && 
				 dSum > l.len-pointBuffer;
}

/** 
 * 
 * @param {*} p 
 * @param {*} circ 
 * @returns 
 */
function pointInCirc (p, circ) {
	return euclideanDist(p, circ.center) < circ.r;
}

function pointInRect (p, rect) {
	return (p.x >= rect.corner.x) && (p.x <= rect.corner.x+rect.width) &&
				 (p.y >= rect.corner.y) && (p.y <= rect.corner.y+rect.height);
}


function rectIntersectsRect (rect1,rect2) {
	let c1 = rect1.corner, c2=rect2.corner;
	return (c1.x+rect1.w >= c2.x) && (c1.x <= c2.x+rect2.w) && 
				 (c1.y+rect1.h >= c2.y) && (c1.y <= c2.y+rect2.h);
} // rectIntersectsRect

function lineInCirc (l, circ) {
	if (pointInCirc(l.p1, circ) || pointInCirc(l.p2, circ)) {
		return true;
	}


}

function circIntersectsCirc(circ1, circ2) {
  return euclideanDist(circ1.center, circ2.center)<=circ1.r+circ2.r
} 

function rectIntersectsCirc (rect, circ) {
	let center = circ.center; let corner = rect.corner;
	let closestX = center.x;
	let closestY = center.y;

	if (center.x < corner.x) closestX=corner.x;
	else if (center.x > corner.x+rect.width) closestX=corner.x+rect.width;

	if (center.y < corner.y) closestY=corner.y;
	else if (center.y > corner.y+rect.height) closestY=corner.y+rect.height;

	return euclideanDist(new Point(closestX, closestY), circ.center) <= circ.r;
} // rectIntersectsCirc

function _getGoodCollisionAlgorithms (collider) {
	if (collider instanceof Circle) {
		return [[pointNearPoint, 2], [pointInCirc, 2], [rectIntersectsCirc, 2], lineInCirc];
	} else if (collider instanceof Rectangle) {
		return [[rectIntersectsRect, 1], [rectIntersectsCirc, 1], [pointInRect, 2]];
	} else if (collider instanceof Line) {
		return [[pointOnLine, 2], [lineInCirc, 1]];
	} else if (collider instanceof Point) {
		return [[pointNearPoint, 1], [pointOnLine, 1], [pointInRect, 1], [pointInCirc, 1]]; 
	}
	return false;
} // _getGoodCollisionAlgorithms

/**
 * 
 * @param {Collider} x 
 * @param {Collider} y 
 * @returns 
 */
function collides (x, y) {
	let xColl = _getGoodCollisionAlgorithms(x);
	let yColl = _getGoodCollisionAlgorithms(y);
	let coll;


	for (let i = 0; i < xColl.length; i++) {
		for (let j = 0; j < yColl.length; j++) {
			if (xColl[i][0]===yColl[j][0]) {
				coll = xColl[i];
				break;
			}
		}
	}
	return (coll[0])(...(coll[1]===1 ? [x, y] : [y, x]));
} // collides

/**
 * Represents a hitbox composed of more fundamental collision geometries. 
 */
class Hitbox {
	/**
	 * 
	 * @param  {...any} args 
	 */
	constructor (...args) {
		this.elts = args;
	} 

	/** Determines if two hitboxes collide.
	 * 
	 * @param Hitbox hbox 
	 */
	collidesWith (hbox) {
		return hbox.elts.any(x => (
			this.elts.any(y => (
				Collision.collides(x, y)
			)) 
		))
	}
} // Hitbox

export { Hitbox, Point, Line, Circle, Rectangle, collides, Collider, //}
				 p1, p2, p3, l1, l2, l3, c1, c2, c3, r1, r2, r3 };

let p1 = new Point(0, 0),
		p2 = new Point(10, 0),
		p3 = new Point(10, 10),
		l1 = new Line(0, 0, 10, 0),
		l2 = new Line(10, 0, 10, 10),
		l3 = new Line(0, 0, 10, 10),
		c1 = new Circle(0, 0, 10),
		c2 = new Circle(11, 11, 1),
		c3 = new Circle(11, 11, 10),
		r1 = new Rectangle(0, 0, 10, 10),
		r2 = new Rectangle(0, 0, 9, 9),
		r3 = new Rectangle(10, 10, 10, 10);

