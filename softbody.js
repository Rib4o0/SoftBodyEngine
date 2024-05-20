const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const dt = 0.016;

function mainLoop() {
    computeForces();
    integrate(dt);
    handleCollisions();
    render(ctx);
    requestAnimationFrame(mainLoop);
}

mainLoop();
function render(ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw springs
    ctx.strokeStyle = 'black';
    for (let spring of springs) {
        ctx.beginPath();
        ctx.moveTo(spring.point1.position.x, spring.point1.position.y);
        ctx.lineTo(spring.point2.position.x, spring.point2.position.y);
        ctx.stroke();
    }

    // Draw points
    ctx.fillStyle = 'red';
    for (let point of points) {
        ctx.beginPath();
        ctx.arc(point.position.x, point.position.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function handleCollisions() {
    for (let point of points) {
        if (point.position.y > canvas.height) {
            point.position.y = canvas.height;
            point.velocity.y *= -0.5;  // Simple restitution
        }
        if (point.position.x < 0) {
            point.position.x = 0;
            point.velocity.x *= -0.5;
        }
        if (point.position.x > canvas.width) {
            point.position.x = canvas.width;
            point.velocity.x *= -0.5;
        }
        if (point.position.y < 0) {
            point.position.y = 0;
            point.velocity.y *= -0.5;
        }
    }
}

function integrate(dt) {
    for (let point of points) {
        if (point.mass !== 0) {
            let acceleration = { x: point.force.x / point.mass, y: point.force.y / point.mass };
            point.velocity.x += acceleration.x * dt;
            point.velocity.y += acceleration.y * dt;
            point.position.x += point.velocity.x * dt;
            point.position.y += point.velocity.y * dt;
            point.force.x = 0;
            point.force.y = 0;
        }
    }
}

function computeForces() {
    for (let spring of springs) {
        let p1 = spring.point1;
        let p2 = spring.point2;

        let dx = p2.position.x - p1.position.x;
        let dy = p2.position.y - p1.position.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let direction = { x: dx / distance, y: dy / distance };
        let forceMagnitude = spring.stiffness * (distance - spring.restLength);
        let force = { x: forceMagnitude * direction.x, y: forceMagnitude * direction.y };

        p1.force.x += force.x;
        p1.force.y += force.y;
        p2.force.x -= force.x;
        p2.force.y -= force.y;
    }

    // Add gravity
    for (let point of points) {
        point.force.y += 9.81 * point.mass;
    }
}

const points = [];
const springs = [];
const gridSize = 5;
const spacing = 20;
const stiffness = 100;
const mass = 1;

// Create a grid of points
for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
        points.push(new Point(x * spacing, y * spacing, mass));
    }
}

// Connect the points with springs
for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
        let i = y * gridSize + x;
        if (x < gridSize - 1) {
            springs.push(new Spring(points[i], points[i + 1], stiffness, spacing));
        }
        if (y < gridSize - 1) {
            springs.push(new Spring(points[i], points[i + gridSize], stiffness, spacing));
        }
    }
}

class Point {
    constructor(x, y, mass) {
        this.position = { x: x, y: y };
        this.velocity = { x: 0, y: 0 };
        this.force = { x: 0, y: 0 };
        this.mass = mass;
    }
}

class Spring {
    constructor(point1, point2, stiffness, restLength) {
        this.point1 = point1;
        this.point2 = point2;
        this.stiffness = stiffness;
        this.restLength = restLength;
    }
}
