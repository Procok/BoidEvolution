const boids = [];
const food = [];
let visualize = false;

let alignSlider, cohesionSlider, separationSlider;
let quadTree;
let statics = []
let areaWidth = window.innerWidth;
let areaHeight = window.innerHeight - 200;
let maxFood = 200;
let mutationRate = 0.1;
let rankChart, speedChart, sizeChart, sensorChart
let ranks, speeds, sizes, sensors;
let createRank = 0;

function setup() {
    createCanvas(areaWidth, areaHeight);
    frameRate(60);
    createFood(100);
    createBoids(20);
    background(0);

    rankChart = new CanvasJS.Chart("rankChart", { animationEnabled: false, exportEnabled: true, theme: "dark1", title: { text: "Ranks" }, data: [{ type: "column", indexLabelFontColor: "#5A5757", indexLabelPlacement: "outside", dataPoints: [] }] });
    speedChart = new CanvasJS.Chart("speedChart", { animationEnabled: false, exportEnabled: true, theme: "dark1", title: { text: "Speeds" }, data: [{ type: "column", indexLabelFontColor: "#5A5757", indexLabelPlacement: "outside", dataPoints: [] }] });
    sizeChart = new CanvasJS.Chart("sizeChart", { animationEnabled: false, exportEnabled: true, theme: "dark1", title: { text: "Sizes" }, data: [{ type: "column", indexLabelFontColor: "#5A5757", indexLabelPlacement: "outside", dataPoints: [] }] });
    sensorChart = new CanvasJS.Chart("sensorChart", { animationEnabled: false, exportEnabled: true, theme: "dark1", title: { text: "Sensors" }, data: [{ type: "column", indexLabelFontColor: "#5A5757", indexLabelPlacement: "outside", dataPoints: [] }] });
}

async function draw() {
    background(0);
    if (frameCount % 30 == 0) {
        createFood(Math.max(food.length * 0.2, 3));
    }
    var bound = new Rectangle(0, 0, width, height)
    bound.visualize = visualize
    quadTree = new QuadTree(bound)
    quadTree.insertRange(boids.concat(food))
    ranks = [];
    speeds = [];
    sizes = [];
    sensors = [];
    for (let boid of boids) {
        c = new Circle(boid.position.x, boid.position.y, boid.sensor * 5)
        boid.flock(quadTree.query(c))
        boid.update();
        boid.edges();
        boid.show(boid.size);
        if (!ranks[boid.rank])
            ranks[boid.rank] = 0
        ranks[boid.rank]++;
        if (!speeds[round(boid.speed) - 2])
            speeds[round(boid.speed) - 2] = 0
        speeds[round(boid.speed) - 2]++;
        if (!sizes[round(boid.size) - 2])
            sizes[round(boid.size) - 2] = 0
        sizes[round(boid.size) - 2]++;
        if (!sensors[round(boid.sensor) - 2])
            sensors[round(boid.sensor) - 2] = 0
        sensors[round(boid.sensor) - 2]++;
    }
    for (let f of food) {
        f.update();
        f.show();
    }

    if (mouseIsPressed) {
        if (mouseButton === LEFT) {
            if (createRank == 0)
                food.push(new Boid(createVector(mouseX, mouseY)));
            else
                boids.push(new Boid(createVector(mouseX, mouseY), map(Math.random(), 0, 1, 2, 20), map(Math.random(), 0, 1, 2, 20), map(Math.random(), 0, 1, 4, 20), 2000, createRank));
        }
    }
    ranks[0] = food.length;
    if (frameCount % 10 == 0 || frameCount < 10)
        chartdraw(rankChart, ranks);
    if (frameCount % 10 == 1 || frameCount < 10)
        chartdraw(speedChart, speeds, 2);
    if (frameCount % 10 == 2 || frameCount < 10)
        chartdraw(sizeChart, sizes, 2);
    if (frameCount % 10 == 3 || frameCount < 10)
        chartdraw(sensorChart, sensors, 2);
}

function keyPressed() {
    if (keyCode >= 48 && keyCode <= 53) {
        createRank = keyCode - 48;
    }
}

function createFood(num) {
    for (let i = 0; i < num; i++) {
        if (food.length <= maxFood) {
            food.push(new Boid(createVector(random(40, width - 40), random(40, height - 40))));
        }
    }
}

function createBoids(num) {
    for (let i = 0; i < num; i++) {
        var r1 = Math.random();
        boids.push(new Boid(createVector(random(40, width - 40), random(40, height - 40)), map(r1, 0, 1, 2, 10), map(1 - r1, 0, 1, 2, 10), map(Math.random(), 0, 1, 4, 20), 2000, 1));
    }
    console.log(boids)

}

function chartdraw(chart, array, offset = 0) {
    var d = []
    for (let i = 0; i < array.length; i++) {
        const r = array[i];
        d.push({ x: i + offset, y: r });
    }
    chart.options.data[0].dataPoints = d;
    chart.render();
}

