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

	collides (obj) {
		if (obj instanceof Point) {
			return pointNearPoint(this, obj);
		} else if (obj instanceof Line) {
			return pointOnLine(this, obj);
		} else if (obj instanceof Rectangle) {
			return pointInRect(this, obj) 
		} else if (obj instanceof Circle) {
			return pointInCirc(this, obj)
		} else {
			return false
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

	collides (obj) {
		switch (obj.constructor) {
			case Point:
				return pointNearPoint(this, obj);
			case Line:
				return pointOnLine(this, obj);
			case Rectangle:
				return pointInRect(this, obj) 
			case Circle:
				return pointInCirc(this, obj)
			default:
				return false
		}
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
		this.len = euclideanDist(this.p1, this.p2);
	}

	collides (obj) {
		switch (obj.constructor) {
			case Point:
				return pointOnLine(obj, this);
			case Line:
				return lineIntersectsLine(this, obj);
			case Rectangle:
				return lineIntersectsRect(this, obj);
			case Circle:
				return lineInCirc(this, obj);
			default:
				return false
		}
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

	collides (obj) {
		switch (obj.constructor) {
			case Point: 
				return pointInRect(obj, this);
			case Line:
				return lineIntersectsRect(obj, this)
			case Rectangle: 
				return rectIntersectsRect(this, obj)
			case Circle: 
				return rectIntersectsCirc(this, obj)
			default:
				return false
		}
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

	collides (obj) {
		switch (obj.constructor) {
			case Point:
				return pointInCirc(obj, this);
			case Line:
				return lineInCirc(obj, this);
			case Rectangle:
				return rectIntersectsCirc(obj, this);
			case Circle:
				return circIntersectsCirc(obj, this);
			default: 
				return false;
		}
	}
}

function dot (vec1, vec2) {
	if (vec1.length!==vec2.length) {
		throw new Error('Argument exception: input arrays must be of equal length');
	} 
	return vec1.reduce((acc, x, i) => (
		acc+(x*vec2[i])
	), 0)
}

function applySAT (polygon1, polygon2) {
	let pts1 = polygon1.points, pts2 = polygon2.points, j = 0;
	for (let j = 1; j < pts1.length; j++) {
		let i=(j+1 === pts1.length ? 0 : j-1);
		let len_ax = euclideanDist(pts1[i], pts1[j]);
		let axis = [-(pts1[j][1]-pts1[i][1])/len_ax, (pts1[j][0]-pts1[i][0])/len_ax];
		let projections1 = pts1.map(pt => (dot([pt[0], pt[1]], axis))),
				projections2 = pts2.map(pt => (dot([pt[0], pt[1]], axis)));
		let max1 = Math.max(...projections1), min1 = Math.min(...projections1),
				max2 = Math.max(...projections2), min2 = Math.min(...projections2);
		
		if (max1 < min2 || max2 < min1) {
			return false
		}
	}
	return true;
}

class Polygon extends Collider {
	constructor (...args) {
		super()
		if (args.length<=1) {
			throw new Error ("ArgumentCountException: polygons must have at least 2 vertices");
		} 
		let points = [];
		args.forEach(x => {
			if (Array.isArray(x)) {
				if (x.some(y => (!isFinite(y))||x.length!==2)) {
					throw new Error ("ArgumentException: all array arguments must be ordered pairs of finite reals");
				} else {
					points.push(x);
				}
			} else if (x instanceof Point) {
				points.push([x.x, x.y]);
			} else {
				throw new Error ("ArgumentException: all arguments must be either Points or arrays");
			}
		})
		this.points = points;
	} 

	collides (obj) {
		let that;
		switch (obj.constructor) {
			case Point:
				that = new Polygon(obj);
				break
			case Line:
				for (let i = 0; i < this.points.length; i++) {
					let j = (i+1)%this.points.length;
					let p1 = this.points[i], p2=this.points[j]
					if (lineIntersectsLine(new Line(p1[0],p1[1],p2[0],p2[1]), obj)) {
						return true
					}
				}
				return false
			case Rectangle:
				let c = obj.corner;
				let p2 = new Point(c.x, c.y+obj.height), 
						p3 = new Point(c.x+obj.width, c.y),
						p4 = new Point(c.x+obj.width, c.y+obj.height);
				that= new Polygon(c, p2, p3, p4)
				break
			case Circle:
			case Polygon: 
				that = obj;
				break
			default:
				return false;
		}
		return applySAT(this, that)
	} 

}

/** Takes two points and determines the Euclidean distance between them.
 * 
 * @param {Point} p1, the first point
 * @param {Point} p2, the second point
 * @returns a `Number` representing the Euclidean distance between p1 and p2 
 */
function euclideanDist (p1, p2) {
	let deltaY, deltaX;
	if (p1 instanceof Point) {
		deltaY = p1.y-p2.y, deltaX=p1.x-p2.x;
	} else {
		deltaY = p1[1]-p2[1], deltaX=p1[0]-p2[0];
	}
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
	return euclideanDist(p, circ.center) <= circ.r;
}

function pointInRect (p, rect) {
	return (p.x >= rect.corner.x) && (p.x <= rect.corner.x+rect.width) &&
				 (p.y >= rect.corner.y) && (p.y <= rect.corner.y+rect.height);
}

/**
 * 
 */
function lineIntersectsLine (l1, l2) {
	let uA = ((l2.p2.x-l2.p1.x)*(l1.p1.y-l2.p1.y) - (l2.p2.y-l2.p1.y)*(l1.p1.x-l2.p1.x)) / 
					 ((l2.p2.y-l2.p1.y)*(l1.p2.x-l1.p1.x) - (l2.p2.x-l2.p1.x)*(l1.p2.y-l1.p1.y)),
			uB = ((l1.p2.x-l1.p1.x)*(l1.p1.y-l2.p1.y) - (l1.p2.y-l1.p1.y)*(l1.p1.x-l2.p1.x)) / 
					 ((l2.p2.y-l2.p1.y)*(l1.p2.x-l1.p1.x) - (l2.p2.x-l2.p1.x)*(l1.p2.y-l1.p1.y));

	 return (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1)
}

function lineIntersectsRect (l1, rect) {
	let p = rect.corner;
	return lineIntersectsLine(l1, new Line(p.x, p.y, p.x+rect.width, p.y)) ||
				 lineIntersectsLine(l1, new Line(p.x, p.y, p.x, p.x+rect.height))||
				 lineIntersectsLine(l1, new Line(p.x, p.y+rect.height, p.x+rect.width, p.y+rect.height))||
				 lineIntersectsLine(l1, new Line(p.x+rect.width, p.y, p.x+rect.width, p.y+rect.height));

}

function rectIntersectsRect (rect1,rect2) {
	let c1 = rect1.corner, c2=rect2.corner;
	return (c1.x+rect1.width >= c2.x)  && (c1.x <= c2.x+rect2.width) && 
				 (c1.y+rect1.height >= c2.y) && (c1.y <= c2.y+rect2.height);
} // rectIntersectsRect

function lineInCirc (l, circ) {
	if (pointInCirc(l.p1, circ) || pointInCirc(l.p2, circ)) {
		return true;
	}
	let dot = (((circ.center.x-l.p1.x)*(l.p2.x-l.p1.x)) + 
						 ((circ.center.y-l.p1.y)*(l.p2.y-l.p1.y))) /
						 (l.len*l.len);
	let cpt = new Point(l.p1.x+(dot*(l.p2.x-l.p1.x)),
										  l.p1.y+(dot*(l.p2.y-l.p1.y)));
	
	return pointOnLine(cpt, l) && 
				 (euclideanDist(cpt, circ.center) <= circ.r);
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
		return hbox.elts.some(x => (
			this.elts.some(y => (
				Collision.collides(x, y)
			)) 
		))
	}
} // Hitbox

let polygonSamples = 
	[new Polygon([0,0],[1,8],[4,4]),
	new Polygon([3,4],[7,10],[9,0]),
	new Polygon([8,4],[12,1],[12,5],[10,8])]


export { Hitbox, Point, Line, Circle, Rectangle, Polygon, Collider, //}
				 polygonSamples, applySAT };

// let collisionSamples = 
// 	[new Point(0, 0), 								//  0
// 	new Point(10, 0),									//  1
// 	new Point(10, 10),								//  2
// 	new Line(0, 0, 10, 0),						//  3
// 	new Line(10, 0, 10, 10),					//	4
// 	new Line(0, 0, 10, 10),						// 	5
// 	new Circle(0, 0, 10),							// 	6
// 	new Circle(11, 11, 1),						// 	7
// 	new Circle(11, 11, 10),						// 	8
// 	new Rectangle(0, 0, 10, 10),			// 	9
// 	new Rectangle(0, 0, 9, 9),				// 10
// 	new Rectangle(10, 10, 10, 10)];		// 11

/*
true	false	false	true	false	true	true	false	false	true	true	false	
false	true	false	true	true	false	false	false	false	true	false	false	
false	false	true	false	true	true	false	false	true	true	false	true	
true	true	false	false	true	true	true	false	false	true	true	false	
false	true	true	true	false	true	true	false	true	true	false	true	
true	false	true	true	true	false	true	false	true	true	true	true	
true	false	false	true	true	true	true	false	true	true	true	false	
false	false	false	false	false	false	false	true	true	false	false	true	
false	false	true	false	true	true	true	true	true	true	true	true	
true	true	true	true	true	true	true	false	true	false	false	false	
true	false	false	true	false	true	true	false	true	false	false	false	
false	false	true	false	true	true	false	true	true	false	false	false
 */

/* 
true 	false	false	true	false	true	true	false	false	true	true	false 
false	true	false	true	false	true	true 	false	false	true	false	false	
false	false	true	false	true	false	false	true	true		
true	true
false	false
true	true
true	true
false	false
false	false
true	true
true	false
false	false
*/