/* canvas.js */

/**
 * This file contains all the canvas-related functions:
 * - resizeCanvas: Adjusts the canvas size.
 * - clearCanvas: Clears the canvas.
 * - drawEllipse, drawCycloid, drawIsometric: Drawing functions.
 */

// Retrieve the canvas and context
const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');

/**
 * resizeCanvas() adjusts the canvas width and height
 * to match its container's CSS dimensions.
 */
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

/**
 * clearCanvas() now resets the transformation matrix and clears the canvas.
 */
function clearCanvas() {
    // Step 1: Resize the canvas to ensure it matches its container.
    resizeCanvas();
    console.log("Canvas dimensions:", canvas.width, canvas.height);

    // Step 2: Fully reset the transformation matrix.
    if (ctx.resetTransform) {
        ctx.resetTransform();
    } else {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // Step 3: Clear the entire canvas.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Step 4 (Optional): Force a reflow by temporarily hiding and showing the canvas.
    canvas.style.display = 'none';
    // Trigger reflow by reading offsetHeight.
    canvas.offsetHeight;
    canvas.style.display = 'block';

    // Step 5: Compute the center offsets (10% from left, vertical center)
    const xShift = 0.1 * canvas.width;
    const yShift = canvas.height / 2;
    console.log("Transformation will be set with scaleFactor =", scaleFactor, "xShift =", xShift, "yShift =", yShift);

    // Step 6: Apply your desired transformation in one go.
    // Scale by scaleFactor (and flip vertically with -scaleFactor), then translate by xShift and yShift.
    ctx.setTransform(scaleFactor, 0, 0, -scaleFactor, xShift, yShift);
}



// The rest of your drawing functions (drawEllipse, etc.) remain unchanged.


/**
 * drawEllipse() draws an ellipse with:
 * - Axes, the ellipse outline, foci, and the ellipse axes.
 */
function drawEllipse() {
    clearCanvas();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const a = Math.min(canvas.width, canvas.height) * 0.35;
    const b = a * 0.6;
    const c = Math.sqrt(a * a - b * b);

    // Axes lines
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    // Draw ellipse outline
    ctx.strokeStyle = '#3a86ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, a, b, 0, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw foci
    ctx.fillStyle = '#ff006e';
    ctx.beginPath();
    ctx.arc(centerX - c, centerY, 5, 0, 2 * Math.PI);
    ctx.arc(centerX + c, centerY, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Draw ellipse axes
    ctx.strokeStyle = '#8338ec';
    ctx.beginPath();
    ctx.moveTo(centerX - a, centerY);
    ctx.lineTo(centerX + a, centerY);
    ctx.moveTo(centerX, centerY - b);
    ctx.lineTo(centerX, centerY + b);
    ctx.stroke();
}

// drawCycloid() and drawIsometric() remain exactly as in your original code.
function drawCycloid() {
    clearCanvas();
    const baseY = canvas.height * 0.7;
    const radius = 40;
    const startX = 50;
    const steps = 60;

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(canvas.width, baseY);
    ctx.stroke();

    ctx.strokeStyle = '#3a86ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= steps * 2; i++) {
        const theta = (i / steps) * Math.PI;
        const x = startX + radius * (theta - Math.sin(theta));
        const y = baseY - radius * (1 - Math.cos(theta));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = '#8338ec';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const theta = (i / 2) * Math.PI;
        const cx = startX + radius * theta;
        const cy = baseY;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        ctx.stroke();

        const px = cx + radius * Math.sin(theta);
        const py = cy - radius * Math.cos(theta);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.stroke();

        ctx.fillStyle = '#ff006e';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function drawIsometric() {
    clearCanvas();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = Math.min(canvas.width, canvas.height) * 0.25;

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + size * Math.cos(Math.PI / 6), centerY - size * Math.sin(Math.PI / 6));
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX - size * Math.cos(Math.PI / 6), centerY - size * Math.sin(Math.PI / 6));
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, centerY - size);
    ctx.stroke();

    const cubeSize = size * 0.6;
    function isoTo2D(x, y, z) {
        return {
            x: centerX + x * Math.cos(Math.PI / 6) - y * Math.cos(Math.PI / 6),
            y: centerY - x * Math.sin(Math.PI / 6) - y * Math.sin(Math.PI / 6) - z
        };
    }
    const vertices = [
        isoTo2D(0, 0, 0),
        isoTo2D(cubeSize, 0, 0),
        isoTo2D(cubeSize, cubeSize, 0),
        isoTo2D(0, cubeSize, 0),
        isoTo2D(0, 0, cubeSize),
        isoTo2D(cubeSize, 0, cubeSize),
        isoTo2D(cubeSize, cubeSize, cubeSize),
        isoTo2D(0, cubeSize, cubeSize)
    ];

    ctx.strokeStyle = '#3a86ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    ctx.lineTo(vertices[1].x, vertices[1].y);
    ctx.lineTo(vertices[2].x, vertices[2].y);
    ctx.lineTo(vertices[3].x, vertices[3].y);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = '#ff006e';
    ctx.beginPath();
    ctx.moveTo(vertices[4].x, vertices[4].y);
    ctx.lineTo(vertices[5].x, vertices[5].y);
    ctx.lineTo(vertices[6].x, vertices[6].y);
    ctx.lineTo(vertices[7].x, vertices[7].y);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = '#8338ec';
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    ctx.lineTo(vertices[4].x, vertices[4].y);
    ctx.moveTo(vertices[1].x, vertices[1].y);
    ctx.lineTo(vertices[5].x, vertices[5].y);
    ctx.moveTo(vertices[2].x, vertices[2].y);
    ctx.lineTo(vertices[6].x, vertices[6].y);
    ctx.moveTo(vertices[3].x, vertices[3].y);
    ctx.lineTo(vertices[7].x, vertices[7].y);
    ctx.stroke();
}
