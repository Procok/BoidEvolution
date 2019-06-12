class Boid {
    constructor(pos, speed = 0, size = 2, sensor = 0, energy = Math.random() * 1000, rank = 0, weights = [-30, 20, 2, 2, 2]) {
        this.position = pos;
        this.size = clamp(size, 2, Infinity);
        this.speed = clamp(speed, 1, Infinity);
        this.sensor = clamp(sensor, 1, Infinity)
        this.energy = energy;
        this.rank = clamp(rank, 0, 5);
        this.velocity = createVector(Math.random() * this.speed - this.speed / 2, Math.random() * this.speed - this.speed / 2);
        this.lastPos = pos;
        this.weights = weights;
        this.color = this.rank == 0 ? color(0, 255, 0) : color(0, map(this.energy, 0, 10000, 80, 255), 0);
        this.nextRepFrame = frameCount + Math.max(boids.length * boids.length, 200);
        this.maxEnergy = 6000 * Math.sqrt(this.size + this.rank);
    }

    async remove() {
        if (this.rank == 0) {
            var index = food.indexOf(this);
            if (index > -1) {
                food.splice(index, 1);
            }
        }
        else {
            var index = boids.indexOf(this);
            if (index > -1) {
                boids.splice(index, 1);
            }
        }
    }

    async edges() {
        if (this.position.x > width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = width;
        }
        if (this.position.y > height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = height;
        }
    }

    async flock(query) {
        var total = 0;
        var movement = createVector(0, 0);
        var alignV = createVector(0, 0), separationV = createVector(0, 0), cohesionV = createVector(0, 0);
        for (var i = 0; i < query.length; i++) {
            var other = query[i]
            if (other != this) {
                let d = Math.pow(this.position.x - other.position.x, 2) + Math.pow(other.position.y - this.position.y, 2);
                let thisToOther = p5.Vector.sub(other.position, this.position);
                thisToOther.div(d);
                if (other.rank > this.rank) {
                    if (this.size / other.size < 0.5) {
                        movement.add(thisToOther.mult(this.weights[0]));
                    }
                    else if (this.size / other.size < 1) {
                        movement.add(thisToOther.mult(this.weights[0] / 2));
                    }
                    stroke(255, 0, 0);
                    line(this.position.x, this.position.y, other.position.x, other.position.y);

                }
                else if (this.rank == 1 && other.rank == 0) {
                    movement.add(thisToOther.mult(this.weights[1]));
                    if (d <= Math.pow(this.size * 2, 2)) {
                        this.energy += other.energy * Math.pow(this.rank, 2);
                        other.remove();
                        this.nextRepFrame = frameCount;
                    }
                    stroke(0, 0, 255);
                    line(this.position.x, this.position.y, other.position.x, other.position.y);

                }
                else if (other.rank < this.rank && other.rank > 0) {
                    if (this.size / other.size > 2) {
                        if (d <= Math.pow(this.size * 2, 2)) {
                            this.energy += other.energy * Math.pow(this.rank, 2);
                            other.remove();
                            this.nextRepFrame = frameCount;
                        }
                    }
                    else if (this.size / other.size > 1) {
                        if (d <= Math.pow(this.size * 2, 2)) {
                            this.energy += other.energy / 2 * Math.pow(this.rank, 2);
                            other.energy /= 2;
                        }
                    }
                    movement.add(thisToOther.mult(this.weights[1]));
                    stroke(0, 0, 255);
                    line(this.position.x, this.position.y, other.position.x, other.position.y);
                }
                else {
                    /*
                     total++;
                     alignV.add(other.velocity);
                     if (d < other.deflectForce) {
                         separationV.add(diff.mult(400));
                         total++
                     }
                     else {
                         separationV.add(diff);
                     }
                     cohesionV.add(other.position);
                     stroke(0, 255, 0)
                     line(this.position.x, this.position.y, other.position.x, other.position.y);
                    */
                }
            }
        }
        /*
        if (query.length > 1) {
            alignV.div(query.length - 1 - total);
            alignV.setMag(this.speed);
            alignV.sub(this.velocity);
            alignV.limit(this.speed);

            separationV.div(query.length - 1 - total);
            separationV.setMag(this.speed);
            separationV.sub(this.velocity);
            separationV.limit(this.speed * 1.2);

            cohesionV.div(query.length - 1 - total);
            cohesionV.sub(this.position);
            cohesionV.setMag(this.speed);
            cohesionV.sub(this.velocity);
            cohesionV.limit(this.speed);

            movement.add(alignV.div(5));
            movement.add(separationV.div(5));
            movement.add(cohesionV.div(5));
        }
        */
        if (query.length == 0 || movement.mag() < 0.1) {
            movement = createVector(map(Math.random(), 0, 1, -this.velocity.x / 2, this.velocity.x / 2), map(Math.random(), 0, 1, -this.velocity.y / 2, this.velocity.y / 2))
        }
        this.energy = clamp(this.energy, -Infinity, this.maxEnergy)
        this.repruduce();
        this.velocity.div(this.weights[3]).add(movement);
    }

    async repruduce() {
        if (this.energy >= this.maxEnergy * 0.9 && this.nextRepFrame <= frameCount) {
            this.nextRepFrame = frameCount + Math.max(boids.length * boids.length, 200);
            this.energy *= 0.2;
            boids.push(new Boid(createVector(this.position.x + map(Math.random(), 0, 1, -20, 20), this.position.y + map(Math.random(), 0, 1, -20, 20)), this.speed * map(Math.random(), 0, 1, 1 - mutationRate, 1 + mutationRate), this.size * map(Math.random(), 0, 1, 1 - mutationRate, 1 + mutationRate), this.sensor * map(Math.random(), 0, 1, 1 - mutationRate, 1 + mutationRate), this.energy, this.rank += Math.random() < mutationRate ? 1 : (Math.random() > 1 - mutationRate && this.rank > 1 ? -1 : 0), apply(this.weights, map(Math.random(), 0, 1, 1 - mutationRate, 1 + mutationRate))))
        }
    }

    async update() {
        if (this.rank > 0) {
            this.position.add(this.velocity.setMag(this.speed / 2));
            if (frameCount % 30 == 0)
                this.energy -= (Math.pow(this.speed, 1.5) * Math.pow(this.size, 2) + this.sensor * 2);
            if (this.energy <= 0) {
                this.remove();
            }
        }
        else {
            this.energy += 100 / 60;
        }
    }


    async show() {
        this.color = this.rank == 0 ? color(0, map(this.energy, 0, this.maxEnergy, 100, 255), 0) : color(80, map(this.energy, 0, this.maxEnergy, 100, 255), 80)
        noStroke();
        fill(this.color)
        if (this.rank == 0) {
            ellipse(this.position.x, this.position.y, this.size * 2 + map(this.energy, 0, this.maxEnergy, 0, 10), this.size * 2 + map(this.energy, 0, this.maxEnergy, 0, 10));
        }
        else {
            push();
            polygon(this.position.x, this.position.y, this.size * 2 + 2, this.rank + 2);
            pop();
        }
        if (this.rank > 0) {
            strokeWeight(1)
            stroke(color(255, 255, 255, 180))
            noFill()
            ellipse(this.position.x, this.position.y, this.sensor * 10)
            line(this.position.x, this.position.y, this.position.x + this.velocity.x * 5, this.position.y + this.velocity.y * 5)
        }
        this.lastPos = this.position
    }
}


function map(val, min, max, newmin, newmax) {
    return (newmax - newmin) * (val - min) / (max - min) + newmin;
}

function apply(arr, mul) {
    var out = []
    for (var i = 0; i < arr.length; i++) {
        out.push(arr[i] * mul);
    }
    return out;
}

function clamp(value, min, max) {
    if (value < min) return min
    if (value > max) return max
    return value
}

function ra() {
    return (Math.random() - 0.5) * Math.PI;
}

function polygon(x, y, radius, npoints) {
    let angle = TWO_PI / npoints;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius;
        let sy = y + sin(a) * radius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}