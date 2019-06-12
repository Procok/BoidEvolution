class Rectangle {
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

	contains(point) {
		return (point.x >= this.x - this.w &&
			point.x <= this.x + this.w &&
			point.y >= this.y - this.h &&
			point.y <= this.y + this.h);
	}


	intersects(range) {
		return !(range.x - range.w > this.x + this.w ||
			range.x + range.w < this.x - this.w ||
			range.y - range.h > this.y + this.h ||
			range.y + range.h < this.y - this.h);
	}

	show() {
		noFill()
		stroke(255)
		strokeWeight(1)
		rect(this.x - this.w, this.y - this.h, this.w * 2, this.h * 2)
	}

}

// circle class for a circle shaped query
class Circle {
	constructor(x, y, r) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.rSquared = this.r * this.r;
	}

	contains(point) {
		// check if the point is in the circle by checking if the euclidean distance of
		// the point and the center of the circle if smaller or equal to the radius of
		// the circle
		let d = Math.pow((point.x - this.x), 2) + Math.pow((point.y - this.y), 2);
		return d <= this.rSquared;
	}

	intersects(range) {

		let xDist = Math.abs(range.x - this.x);
		let yDist = Math.abs(range.y - this.y);

		// radius of the circle
		let r = this.r;

		let w = range.w;
		let h = range.h;

		let edges = Math.pow((xDist - w), 2) + Math.pow((yDist - h), 2);

		// no intersection
		if (xDist > (r + w) || yDist > (r + h))
			return false;

		// intersection within the circle
		if (xDist <= w || yDist <= h)
			return true;

		// intersection on the edge of the circle
		return edges <= this.rSquared;
	}

	show() {
		stroke(255)
		strokeWeight(1)
		noFill()
		ellipse(this.x, this.y, this.r * 2);
	}

}

class QuadTree {
	constructor(boundary) {
		if (!boundary) {
			throw TypeError('boundary is null or undefined');
		}
		if (!(boundary instanceof Rectangle)) {
			throw TypeError('boundary should be a Rectangle');
		}
		this.capacity = 4;
		this.boids = [];
		this.boundary = boundary;
		this.northWest = null;
		this.northEast = null;
		this.southWest = null;
		this.southEast = null;
		this.divided = false;
		if (this.boundary.visualize) {
			this.boundary.show()
		}
		
	}

	insert(boid) {
		if (!this.boundary.contains(boid.position)) {
			return false;
		}

		if (this.boids.length < this.capacity) {
			this.boids.push(boid);
			return true;
		}

		if (!this.divided) {
			this.subdivide();
		}

		return (this.northEast.insert(boid) || this.northWest.insert(boid) ||
			this.southEast.insert(boid) || this.southWest.insert(boid));
	}

	insertRange(flock) {
		for (var i = 0; i < flock.length; i++) {
			this.insert(flock[i])
		}
	}

	subdivide() {
		let x = this.boundary.x;
		let y = this.boundary.y;
		let w = this.boundary.w / 2;
		let h = this.boundary.h / 2;

		let nw = new Rectangle(x - w, y - h, w, h);
		nw.visualize = this.boundary.visualize
		this.northWest = new QuadTree(nw);
		let ne = new Rectangle(x + w, y - h, w, h);
		ne.visualize = this.boundary.visualize
		this.northEast = new QuadTree(ne);
		let sw = new Rectangle(x - w, y + h, w, h);
		sw.visualize = this.boundary.visualize
		this.southWest = new QuadTree(sw);
		let se = new Rectangle(x + w, y + h, w, h);
		se.visualize = this.boundary.visualize
		this.southEast = new QuadTree(se);

		this.divided = true;
	}

	// Find all boids that appear within a range
	query(range, found) {
		if (!found) {
			found = [];
		}

		if (!range.intersects(this.boundary)) {
			return found;
		}

		for (let p of this.boids) {
			if (range.contains(p.position)) {
				found.push(p);
			}
		}
		if (this.divided) {
			this.northWest.query(range, found);
			this.northEast.query(range, found);
			this.southWest.query(range, found);
			this.southEast.query(range, found);
		}

		return found;
	}
}
