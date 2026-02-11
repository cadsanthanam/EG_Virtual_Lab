/* main.js */

/**
 * When the DOM is fully loaded, initialize the canvas size and bind the resize event.
 */
document.addEventListener("DOMContentLoaded", () => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
});

/**
 * toggleUnit(element)
 * 
 * Toggles the unit's collapsed/expanded state.
 */
function toggleUnit(element) {
    element.classList.toggle('unit-collapsed');
    const content = element.nextElementSibling;
    content.style.display = element.classList.contains('unit-collapsed') ? 'none' : 'block';
}

/**
 * loadTopic(topic)
 * 
 * Marks the clicked topic as active, updates the current topic header,
 * and calls loadTopicContent to update the theory section and draw the shape.
 */
function loadTopic(topic) {
    document.querySelectorAll('.topic').forEach(el => {
        el.classList.remove('active');
    });
    const clicked = document.querySelector(`.topic[onclick="loadTopic('${topic}')"]`);
    if (clicked) clicked.classList.add('active');

    const topicTitles = {
        'importance': 'Importance of Graphics in Engineering',
        'instruments': 'Drafting Instruments and Their Uses',
        'conventions': 'BIS Conventions and Specifications',
        'layout': 'Drawing Sheet Layout and Folding Techniques',
        'lettering': 'Lettering and Dimensioning Standards',
        'constructions': 'Basic Geometrical Constructions',

        'ellipse': 'Ellipse: Definition and Construction',
        'parabola': 'Parabola: Definition and Construction',
        'hyperbola': 'Hyperbola: Definition and Construction',
        'cycloid': 'Cycloid Curve',
        'epicycloid': 'Epicycloid Curve',
        'hypocycloid': 'Hypocycloid Curve',
        'involutes': 'Involutes of Square and Circle',
        'tangents': 'Tangents and Normals to Curves',
        'points': 'Projection of Points',

        'straight-lines': 'Projection of Straight Lines',
        'true-lengths': 'True Lengths and Inclinations',
        'rotating-line': 'Rotating Line Method',
        'polygonal': 'Projection of Polygonal Surfaces',
        'circular': 'Projection of Circular Surfaces',

        'prisms': 'Projection of Prisms',
        'pyramids': 'Projection of Pyramids',
        'cylinder': 'Projection of Cylinder',
        'cone': 'Projection of Cone',
        'sectioning': 'Sectioning of Solids',
        'true-shape': 'True Shape of Section',
        '3d-modeling': '3D Modeling (CAD)',

        'dev-prisms': 'Development of Prisms',
        'dev-pyramids': 'Development of Pyramids',
        'dev-cylinder': 'Development of Cylinders',
        'dev-cone': 'Development of Cones',
        'isometric-principles': 'Isometric Projection Principles',
        'isometric-scale': 'Isometric Scale',
        'isometric-solids': 'Isometric Projections of Solids',

        'multiple-views': 'Freehand Sketching of Multiple Views',
        'pictorial-views': 'Freehand Sketching of Pictorial Views',
        'perspective-prism': 'Perspective Projection: Prisms',
        'perspective-pyramid': 'Perspective Projection: Pyramids',
        'perspective-cylinder': 'Perspective Projection: Cylinder',
        'perspective-cone': 'Perspective Projection: Cone'
    };

    document.getElementById('current-topic').textContent =
        topicTitles[topic] || topic;

    loadTopicContent(topic);
}




function loadExperiment(experimentPath) {
    // Update the current topic title
    const topicElement = event.target;
    document.getElementById('current-topic').textContent = topicElement.textContent;

    // Hide the canvas and show the iframe
    const canvas = document.getElementById('drawing-canvas');
    const iframe = document.getElementById('content-iframe');

    canvas.style.display = 'none';
    iframe.style.display = 'block';

    // Load the experiment into the iframe
    iframe.src = experimentPath;
}

// Initially hide the iframe
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('content-iframe').style.display = 'none';
});



/**
 * loadExercise(url)
 * 
 * Fetches the content from the provided URL (e.g., 'ellipse.html'),
 * injects it into the #exercise-container, and executes any embedded scripts.
 */
function loadExercise(url) {
    fetch(url)
        .then(response => response.text())
        .then(htmlString => {
            // Parse the HTML string into a DOM document.
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');

            // Extract the <body> content from the loaded document.
            const loadedContent = doc.body.innerHTML;

            // Inject the loaded content into the container.
            const container = document.getElementById('exercise-container');
            container.innerHTML = loadedContent;

            // Find and execute external scripts.
            const scripts = container.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = script.src;
                    newScript.async = false; // preserve order
                } else {
                    newScript.textContent = script.textContent;
                }
                document.body.appendChild(newScript);
                // Optionally, remove the original script tag.
                script.parentNode.removeChild(script);
            });
        })
        .catch(err => {
            document.getElementById('exercise-container').innerHTML =
                `<div class="alert alert-danger">Error loading content: ${err}</div>`;
        });
}


/**
 * loadTopicContent(topic)
 * 
 * Updates the theory/instruction section (#concept-content) and
 * calls the appropriate drawing function based on the topic.
 */
function loadTopicContent(topic) {
    const conceptContent = document.getElementById('concept-content');
    if (topic === 'ellipse') {
        conceptContent.innerHTML = `
        <h3>Ellipse</h3>
        <div class="compact-info">
          <span class="property-label">Definition:</span>
          Locus of a point whose sum of distances from two foci is constant.
          <span class="property-label">Construction:</span>
          <span class="step">Focus-directrix</span>
          <span class="step">String method</span>
        </div>
      `;
        drawEllipse();
    } else if (topic === 'cycloid') {
        conceptContent.innerHTML = `
        <h3>Cycloid</h3>
        <div class="compact-info">
          <span class="property-label">Definition:</span>
          Locus of a point on the circumference of a rolling circle.
          <span class="property-label">Equation:</span>
          x = r(θ − sinθ), y = r(1−cosθ)
        </div>
      `;
        drawCycloid();
    } else if (topic === 'isometric-principles') {
        conceptContent.innerHTML = `
        <h3>Isometric Projection</h3>
        <div class="compact-info">
          <span class="property-label">Definition:</span>
          3D object drawn with axes 120° apart.
          <span class="property-label">Scale:</span>
          Typically 0.816 of true length for perfect isometric.
        </div>
      `;
        drawIsometric();
    } else {
        conceptContent.innerHTML = `
        <h3>${document.getElementById('current-topic').textContent}</h3>
        <div class="compact-info">
          <span class="property-label">Definition:</span>
          Brief definition of ${topic}.
          <span class="property-label">Principles:</span>
          <span class="step">Step A</span>
          <span class="step">Step B</span>
          <span class="step">Step C</span>
        </div>
      `;
        clearCanvas();
    }
}

// Next, Prev, and Reset buttons to control steps.
document.getElementById("nextBtn").addEventListener("click", () => {
    if (step < totalSteps) step++;
    drawSteps();
    updateStepText();
});
document.getElementById("prevBtn").addEventListener("click", () => {
    if (step > 0) step--;
    drawSteps();
    updateStepText();
});
document.getElementById("resetBtn").addEventListener("click", () => {
    step = 0;
    drawSteps();
    updateStepText();
});

// Zoom controls
document.getElementById("zoomInBtn").addEventListener("click", () => {
    scaleFactor *= 1.1;
    drawSteps();
});
document.getElementById("zoomOutBtn").addEventListener("click", () => {
    scaleFactor /= 1.1;
    drawSteps();
});

/**
 * updateStepText() updates the instruction text in the step box.
 */
function updateStepText() {
    const txt = (stepTexts[step]) ? stepTexts[step] : "Done.";
    document.getElementById("stepText").textContent = txt;
}

/**
 * drawSteps() controls the step-by-step drawing procedure.
 * It includes:
 * - Parsing user inputs
 * - Computing points (A, F, V, V')
 * - Defining vertical lines with 0.5mm spacing (and every 20th line visible)
 * - Drawing each step (directrix, axis, F with dimensioning, V, V->V', vertical lines, arcs, and final shape)
 * - Finally, it calls drawDimensionAF() again at the end.
 */
function drawSteps() {
    parseInputs();
    V = computeV();
    Vp = { x: V.x, y: focusDist - V.x };

    // Define vertical lines with 0.5mm spacing and highlight every 20th line.
    lineData = [];
    let letterCount = 0;
    const spacing = 0.5; // 0.5mm spacing between lines
    for (let i = 1; i <= maxLines; i++) {
        let xVal = V.x + i * spacing;
        let t = (Math.abs(Vp.x) > 1e-9) ? xVal / Vp.x : 0;
        let yVal = t * Vp.y;
        let yMin = (yVal >= 0) ? -80 : yVal - 2;
        let yMax = (yVal >= 0) ? yVal + 2 : 80;
        let is20th = (i % 20 === 0); // every 20th line visible
        let color = is20th ? "lightblue" : "#fff";
        let axisLabel = "", slantLabel = "";
        if (is20th) {
            let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let letterIndex = letterCount;
            if (letterIndex < letters.length) {
                axisLabel = letters[letterIndex];
                slantLabel = letters[letterIndex] + "'";
            } else {
                axisLabel = "Line" + i;
                slantLabel = axisLabel + "'";
            }
            letterCount++;
        }
        lineData.push({
            i, xVal, yMin, yMax, color, is20th,
            axisLabel, slantLabel,
            arcs: []
        });
    }

    clearCanvas();

    // Step 1: Draw directrix (D, D')
    if (step >= 1) {
        drawLine(0, -100, 0, 100, "blue", 2);
        drawPoint(0, 100, "D", "blue");
        drawPoint(0, -100, "D'", "blue");
    }
    // Step 2: Draw axis line (A to 250,0)
    if (step >= 2) {
        drawPoint(0, 0, "A", "blue");
        drawLine(0, 0, 250, 0, "blue", 1);
    }
    // Step 3: Mark F and dimension AF
    if (step >= 3) {
        drawPoint(focusDist, 0, "F", "blue");
        drawDimensionAF();
    }
    // Step 4: Mark V (with ratio VF/AV=e)
    if (step >= 4) {
        drawPoint(V.x, V.y, "V", "blue");
    }
    // Step 5: Draw V -> V'
    if (step >= 5) {
        drawLine(V.x, 0, Vp.x, Vp.y, "#ccc", 1);
        drawPoint(Vp.x, Vp.y, "V'", "blue");
        let dx = Vp.x, dy = Vp.y;
        let factor = 250 / (Math.abs(dx) || 1);
        let xExt = dx * factor, yExt = dy * factor;
        drawLine(0, 0, xExt, yExt, "#ccc", 1);
    }
    // Step 6: Draw vertical construction lines
    if (step >= 6) {
        drawAllLines();
    }
    // Step 7: Measure arcs along each vertical line
    if (step >= 7) {
        for (let obj of lineData) {
            measureArcsForLine(obj);
        }
    }
    // Step 10: Draw the final shape and call dimensioning again for clarity.
    if (step >= 10) {
        drawFinalShape();
        drawDimensionAF();
    }

    restoreCanvas();
}

/**
 * Event listeners for Next, Prev, Reset, and Zoom buttons.
 */
document.getElementById("nextBtn").addEventListener("click", () => {
    if (step < totalSteps) step++;
    drawSteps();
    updateStepText();
});
document.getElementById("prevBtn").addEventListener("click", () => {
    if (step > 0) step--;
    drawSteps();
    updateStepText();
});
document.getElementById("resetBtn").addEventListener("click", () => {
    step = 0;
    drawSteps();
    updateStepText();
});
document.getElementById("zoomInBtn").addEventListener("click", () => {
    scaleFactor *= 1.1;
    drawSteps();
});
document.getElementById("zoomOutBtn").addEventListener("click", () => {
    scaleFactor /= 1.1;
    drawSteps();
});

/**
 * updateStepText() displays the current step instructions in the step box.
 */
function updateStepText() {
    const txt = (stepTexts[step]) ? stepTexts[step] : "Done.";
    document.getElementById("stepText").textContent = txt;
}

/**
 * When the page loads, set the canvas size and initialize the drawing steps.
 */
window.onload = () => {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;
    step = 0;
    drawSteps();
    updateStepText();
};
