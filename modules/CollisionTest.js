import { Point, Line, Circle, Rectangle, Polygon, Hitbox } from './Collision.js'; 

let collisionTest = () => {
	let collisionSamples = 
		[
			new Point(0, 0),
			new Point(10, 0),
			new Point(10, 10),
			new Line(0, 0, 10, 0),
			new Line(10, 0, 10, 10),
			new Line(0, 0, 10, 10),
			new Circle(0, 0, 10),
			new Circle(11, 11, 1),
			new Circle(11, 11, 10),
			new Rectangle(0, 0, 10, 10),
			new Rectangle(0, 0, 9, 9),
			new Rectangle(10, 10, 10, 10),
			// new Polygon([0,0],[1,8],[4,4]),
			// new Polygon([3,4],[7,10],[9,0]),
			// new Polygon([8,4],[12,1],[12,5],[10,8])
		];

	let testCollisions = (collisionObjects, expectedResults) => {
		let mat = new Array (collisionObjects.length);
		for (let i = 0; i < mat.length; i++) {
			mat[i] = new Array(collisionObjects.length);
		}

		let totalTests = collisionObjects.length*collisionObjects.length;
		let testsPassed = 0, testsFailed = 0, testsFailedWithError = 0, errors = [],
            failures = [];

		for (let i = 0; i < collisionObjects.length; i++) {
			for (let j = 0; j < collisionObjects.length; j++) {
				try {
					mat[i][j] = collisionObjects[i].collides(collisionObjects[j]);
					if (mat[i][j]!==expectedResults[i][j]) {
						testsFailed++
                        failures.push([i, j])
					} else {
						testsPassed++;
					}
				} catch (e) {
					testsFailedWithError++;
					let err = {
						'message': e.message,
						'indices': [i, j]
					}
					errors.push(e.message);
				}
			}
		}

		let Tests = {
			totalTests,
			testsPassed,
			testsFailed,
            failures,
			testsFailedWithError,
			errors
		}

		return Tests
	}

	let expectedResults = [
		[true, false, false, true, false, true, true, false, false, true, true, false],
		[false, true, false, true, true, false, false, false, false, true, false, false],
		[false, false, true, false, true, true, false, false, true, true, false, true],
		[true, true, false, false, true, true, true, false, false, true, true, false],
		[false, true, true, true, false, true, true, false, true, true, false, true],
		[true, false, true, true, true, false, true, false, true, true, true, true],
		[true, false, false, true, true, true, true, false, true, true, true, false],
		[false, false, false, false, false, false, false, true, true, false, false, true],
		[false, false, true, false, true, true, true, true, true, true, true, true],
		[true, true, true, true, true, true, true, false, true, false, false, false],
		[true, false, false, true, false, true, true, false, true, false, false, false],
		[false, false, true, false, true, true, false, true, true, false, false, false]
	]

	return testCollisions(collisionSamples, expectedResults);
}

console.log(collisionTest());