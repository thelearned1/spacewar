
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
		this.x=x; 
		this.y=y;
	}
}

/**
 * Represents a line segment in 2D Euclidean space.
 */
class Line extends Collider {
	constructor (x1,y1, x2,y2) {
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

/** 
 * 
 * @param {Point} p1 
 * @param {Point} p2 
 * @param {Number} distance 
 * @returns 
 */
function pointNearPoint (p1, p2, distance=pointBuffer) {
	return euclideanDist(p1, p2) < distance;
}

function pointOnLine (p, l) {
	let dSum = (euclideanDist(p, l.p1)+euclideanDist(p, l.p2));
	return dSum < l.len+pointBuffer && 
				 dSum > l.len-pointBuffer;
}

function pointInCirc (p, circ) {
	return Collision.dist(p, circ.center) < circ.r;
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

function rectIntersectsCirc (rect, circ) {
	let c = circ.center, corner = rect.corner;
	let closestX = (c.x < corner.x ? corner.x : corner.x+rect.w);
	let closestY = (c.y < corner.y ? corner.y : corner.y+rect.h);
	
	return euclideanDist(new Point(closestX, closestY), circ.center) <= circ.r;
} // rectIntersectsCirc

function _getGoodCollisionAlgorithms (collider) {
	if (collider instanceof Circle) {
		return [[pointInCirc, 2], [rectIntersectsCirc, 2], lineInCirc];
	} else if (collider instanceof Rectangle) {
		return [[rectIntersectsCirc, 1], [rectIntersectsRect, 1], [pointInRect, 2]];
	} else if (collider instanceof Line) {
		return [[pointOnLine, 2], [lineInCirc, 1]];
	} else if (collider instanceof Point) {
		return [[pointNearPoint, 1], [pointOnLine, 1], [pointInRect, 1], [pointInCirc, 1]]; 
	}
	return false;
} // _getGoodCollisionAlgorithms

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
	return (xColl[0])(...(xColl[1]===1 ? [x, y] : [y, x]));
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
