// DOM Elements
const tabs = document.querySelectorAll('.tab-btn');
const panes = document.querySelectorAll('.tab-pane');

// Tab Switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');

        // Resize plots if needed when tab becomes visible
        if (tab.dataset.tab === 'threedim') {
            if (typeof Plotly !== 'undefined') {
                Plotly.relayout('plotly-3d', { autosize: true });
            }
        }
        // Resize 1D canvas when tab becomes visible
        if (tab.dataset.tab === 'onedim') {
            resizeCanvas();
        }
        // Resize lab canvas when tab becomes visible
        if (tab.dataset.tab === 'labs') {
            resizeLabCanvas();
        }
    });
});

/* =========================================
   1D GRADIENT DESCENT (Playground)
   ========================================= */

const canvas1d = document.getElementById('canvas-1d');
const ctx1d = canvas1d.getContext('2d');
const container1d = document.getElementById('canvas-container-1d');

// State
let state1d = {
    x: 4,
    lr: 0.1,
    history: []
};

// Inputs
const inputX = document.getElementById('input-x');
const inputLR = document.getElementById('input-lr');
const valX = document.getElementById('val-x');
const valLR = document.getElementById('val-lr');

// Functions
const f = (x) => x * x;
const df = (x) => 2 * x;

// Resize Canvas
function resizeCanvas() {
    canvas1d.width = container1d.clientWidth;
    canvas1d.height = container1d.clientHeight;
    draw1d();
}
window.addEventListener('resize', resizeCanvas);

// Coordinate Transformation (Math coords to constant Screen coords)
// We want to show x from -6 to 6, y from -5 to 30
function toScreen(x, y) {
    const scaleX = canvas1d.width / 12; // 12 units wide (-6 to 6)
    const scaleY = canvas1d.height / 35; // 35 units high (-5 to 30)

    // Center origin horizontally
    const screenX = (x + 6) * scaleX;
    // Y flips (canvas 0 is top)
    const screenY = canvas1d.height - (y + 5) * scaleY;

    return { x: screenX, y: screenY };
}

function draw1d() {
    ctx1d.clearRect(0, 0, canvas1d.width, canvas1d.height);

    // Draw Axes
    ctx1d.strokeStyle = '#ddd';
    ctx1d.lineWidth = 2;
    ctx1d.beginPath();
    // X Axis
    let p0 = toScreen(-6, 0);
    let p1 = toScreen(6, 0);
    ctx1d.moveTo(p0.x, p0.y);
    ctx1d.lineTo(p1.x, p1.y);
    // Y Axis
    p0 = toScreen(0, -5);
    p1 = toScreen(0, 30);
    ctx1d.moveTo(p0.x, p0.y);
    ctx1d.lineTo(p1.x, p1.y);
    ctx1d.stroke();

    // Draw Function Curve y = x^2
    ctx1d.strokeStyle = '#000';
    ctx1d.lineWidth = 4;
    ctx1d.beginPath();
    for (let x = -6; x <= 6; x += 0.1) {
        let p = toScreen(x, f(x));
        if (x === -6) ctx1d.moveTo(p.x, p.y);
        else ctx1d.lineTo(p.x, p.y);
    }
    ctx1d.stroke();

    // Draw History Paths (Ghost trails)
    if (state1d.history.length > 0) {
        ctx1d.strokeStyle = '#aaa';
        ctx1d.setLineDash([5, 5]);
        ctx1d.lineWidth = 2;
        ctx1d.beginPath();
        let startP = toScreen(state1d.history[0], f(state1d.history[0]));
        ctx1d.moveTo(startP.x, startP.y);
        for (let i = 1; i < state1d.history.length; i++) {
            let px = state1d.history[i];
            let p = toScreen(px, f(px));
            ctx1d.lineTo(p.x, p.y);
        }
        ctx1d.stroke();
        ctx1d.setLineDash([]);
    }

    // Draw Current Ball
    let curP = toScreen(state1d.x, f(state1d.x));

    // Draw Tangent (Slope)
    const slope = df(state1d.x);
    // Line equation y - y1 = m(x - x1) => y = m(x - x1) + y1
    // Draw line of length +/- 1 unit x
    let tangentX1 = state1d.x - 1;
    let tangentX2 = state1d.x + 1;
    let tangentY1 = slope * (tangentX1 - state1d.x) + f(state1d.x);
    let tangentY2 = slope * (tangentX2 - state1d.x) + f(state1d.x);

    let tP1 = toScreen(tangentX1, tangentY1);
    let tP2 = toScreen(tangentX2, tangentY2);

    ctx1d.strokeStyle = 'red';
    ctx1d.lineWidth = 3;
    ctx1d.beginPath();
    ctx1d.moveTo(tP1.x, tP1.y);
    ctx1d.lineTo(tP2.x, tP2.y);
    ctx1d.stroke();

    // Draw Ball
    ctx1d.fillStyle = 'black';
    ctx1d.beginPath();
    ctx1d.arc(curP.x, curP.y, 8, 0, Math.PI * 2);
    ctx1d.fill();
}

// Logic Updates
function update1DDisplay() {
    valX.textContent = state1d.x.toFixed(1);
    valLR.textContent = state1d.lr.toFixed(2);

    const slope = df(state1d.x);
    const nextX = state1d.x - (state1d.lr * slope);

    document.getElementById('disp-x').textContent = state1d.x.toFixed(2);
    document.getElementById('disp-slope').textContent = slope.toFixed(2);
    document.getElementById('x-old').textContent = state1d.x.toFixed(2);
    document.getElementById('disp-lr').textContent = state1d.lr.toFixed(2);
    document.getElementById('disp-grad').textContent = slope.toFixed(2);
    document.getElementById('x-new').textContent = nextX.toFixed(2);
}

function doStep() {
    state1d.history.push(state1d.x);
    state1d.x = state1d.x - (state1d.lr * df(state1d.x));
    update1DDisplay();
    draw1d();
}

function reset1D() {
    state1d.x = parseFloat(inputX.value);
    state1d.lr = parseFloat(inputLR.value);
    state1d.history = [];
    update1DDisplay();
    draw1d();
}

// Event Listeners 1D
inputX.addEventListener('input', (e) => {
    state1d.x = parseFloat(e.target.value);
    state1d.history = []; // Clear history on manual move
    update1DDisplay();
    draw1d();
});

inputLR.addEventListener('input', (e) => {
    state1d.lr = parseFloat(e.target.value);
    update1DDisplay();
});

document.getElementById('btn-step').addEventListener('click', doStep);
document.getElementById('btn-reset').addEventListener('click', reset1D);

let autoRunInterval;
document.getElementById('btn-run').addEventListener('click', () => {
    if (autoRunInterval) {
        clearInterval(autoRunInterval);
        autoRunInterval = null;
    }
    // Very simple auto run
    let steps = 0;
    autoRunInterval = setInterval(() => {
        doStep();
        steps++;
        if (steps > 50 || Math.abs(df(state1d.x)) < 0.01) {
            clearInterval(autoRunInterval);
            autoRunInterval = null;
        }
    }, 200);
});

// Initial Init
resizeCanvas();
update1DDisplay();

/* =========================================
   3D SURFACE (The Bowl)
   ========================================= */
const zFunc = (x, y) => x * x + y * y; // Simple Bowl

function init3D() {
    // Check if Plotly is available
    if (typeof Plotly === 'undefined') {
        const errorMessage = `
            <div style="display: flex; align-items: center; justify-content: center; 
                        height: 100%; font-size: 1.2rem; font-weight: bold; 
                        text-align: center; padding: 2rem;">
                ⚠️ Plotly library could not be loaded.<br>
                Please check your internet connection or browser settings.
            </div>
        `;
        document.getElementById('plotly-3d').innerHTML = errorMessage;
        return;
    }
    
    const x = [];
    const y = [];
    const z = [];

    // Create grid centered at 0
    for (let i = -6; i <= 6; i += 0.5) {
        let rowX = [];
        let rowY = [];
        let rowZ = [];
        for (let j = -6; j <= 6; j += 0.5) {
            rowX.push(i);
            rowY.push(j);
            rowZ.push(zFunc(i, j));
        }
        x.push(rowX);
        y.push(rowY);
        z.push(rowZ);
    }

    const data = [{
        z: z,
        x: x,
        y: y,
        type: 'surface',
        colorscale: 'Greys',
        showscale: false,
        contours: {
            z: {
                show: true,
                usecolormap: true,
                project: { z: true }
            }
        }
    }];

    const layout = {
        title: 'Loss Surface z = x² + y²',
        height: 500,
        margin: { l: 0, r: 0, b: 0, t: 50 },
        scene: {
            camera: {
                eye: { x: 1.5, y: 1.5, z: 1.5 }
            }
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
    };

    // Plot the surface
    Plotly.newPlot('plotly-3d', data, layout);
}

// 3D Logic
let state3d = {
    x: 4,
    y: 4,
    lr: 0.1
};

function update3DMarker() {
    // Add a scatter3d trace for the current point
    const pointTrace = {
        x: [state3d.x],
        y: [state3d.y],
        z: [zFunc(state3d.x, state3d.y)],
        mode: 'markers',
        type: 'scatter3d',
        marker: {
            color: 'black',
            size: 10,
            symbol: 'circle'
        }
    };

    // We rely on Plotly.addTraces or just animate updates.
    // For simplicity, let's just reactively add a trace or restyle.
    // Ideally we preserve the surface trace (index 0) and update index 1.
    // But Plotly can be heavy. Let's try Plotly.react with both traces.

    // Re-calculating full data for simplicity in this prototype? No, heavy.
    // Let's assume index 0 is surface, we add/update index 1.

    // Actually simpler: Just plot the path!
}

// We will implement the 3D run logic using Plotly.animate in the next step to keep files clean.
// For now, initializing the graph.
init3D();

// 3D Controls
document.getElementById('input-3d-x').addEventListener('input', (e) => {
    state3d.x = parseFloat(e.target.value);
    document.getElementById('val-3d-x').textContent = state3d.x;
});
document.getElementById('input-3d-y').addEventListener('input', (e) => {
    state3d.y = parseFloat(e.target.value);
    document.getElementById('val-3d-y').textContent = state3d.y;
});
document.getElementById('input-3d-lr').addEventListener('input', (e) => {
    state3d.lr = parseFloat(e.target.value);
    document.getElementById('val-3d-lr').textContent = state3d.lr;
});

// Run 3D Descent
document.getElementById('btn-3d-run').addEventListener('click', () => {
    if (typeof Plotly === 'undefined') {
        alert('Plotly library is not available. Please check your internet connection.');
        return;
    }
    
    let curX = state3d.x;
    let curY = state3d.y;
    let lr = state3d.lr;

    let pathX = [curX];
    let pathY = [curY];
    let pathZ = [zFunc(curX, curY)];

    for (let i = 0; i < 30; i++) {
        // Gradient of x^2 + y^2 is [2x, 2y]
        let gradX = 2 * curX;
        let gradY = 2 * curY;

        curX = curX - lr * gradX;
        curY = curY - lr * gradY;

        pathX.push(curX);
        pathY.push(curY);
        pathZ.push(zFunc(curX, curY));
    }

    // Trace for the path
    const pathTrace = {
        type: 'scatter3d',
        mode: 'lines+markers',
        x: pathX,
        y: pathY,
        z: pathZ,
        line: { width: 6, color: 'black' },
        marker: { size: 4, color: 'red' }
    };

    Plotly.deleteTraces('plotly-3d', [1]).catch((err) => console.log('No trace to delete:', err)); // remove old path if any (assuming index 1)
    Plotly.addTraces('plotly-3d', pathTrace);
});


document.getElementById('btn-3d-reset').addEventListener('click', () => {
    if (typeof Plotly === 'undefined') {
        return;
    }
    Plotly.deleteTraces('plotly-3d', [1]).catch((err) => console.log('No trace to delete:', err));
});

/* =========================================
   LABS
   ========================================= */
/* =========================================
   LABS
   ========================================= */
const canvasLab = document.getElementById('canvas-lab');
const ctxLab = canvasLab.getContext('2d');
const labStatus = document.getElementById('lab-status');

let labState = {
    lr: 0.1,
    history: [],
    interval: null
};

function resizeLabCanvas() {
    // Assuming partial width
    canvasLab.width = canvasLab.parentElement.clientWidth;
    canvasLab.height = canvasLab.parentElement.clientHeight;
}
window.addEventListener('resize', resizeLabCanvas);

// Re-use logic but separate loop
function runLabSimulation(lr, label) {
    // Reset
    if (labState.interval) clearInterval(labState.interval);
    labState.history = [];
    labState.lr = lr;

    // Start at a fixed noticeable point
    let x = 4.5;
    let stepCount = 0;

    labStatus.innerHTML = `${label} (α=${lr})<br>Running...`;

    // Animation Loop
    labState.interval = setInterval(() => {
        labState.history.push(x);

        // Gradient Step
        let slope = 2 * x;
        x = x - lr * slope;

        // Draw Frame
        drawLab(x);

        stepCount++;

        // Stop conditions
        if (Math.abs(slope) < 0.1) {
            clearInterval(labState.interval);
            labStatus.innerHTML = `${label}<br>CONVERGED in ${stepCount} steps.`;
        }
        if (Math.abs(x) > 20 || stepCount > 100) {
            clearInterval(labState.interval);
            if (Math.abs(x) > 20) labStatus.innerHTML = `${label}<br>DIVERGED! The gradients exploded.`;
            else labStatus.innerHTML = `${label}<br>Stopped (Oscillating or too slow).`;
        }
    }, 100);
}

// Lab Drawing (Simplified version of 1D)
function drawLab(currentX) {
    ctxLab.clearRect(0, 0, canvasLab.width, canvasLab.height);

    // Coordinate mapping specific to Lab (wider view for divergence)
    const scaleX = canvasLab.width / 20; // -10 to 10
    const scaleY = canvasLab.height / 100; // -10 to 90

    const toLabScreen = (x, y) => {
        return {
            x: (x + 10) * scaleX,
            y: canvasLab.height - (y + 10) * scaleY
        };
    };

    // Draw Axis
    ctxLab.strokeStyle = '#eee';
    ctxLab.beginPath();
    let p0 = toLabScreen(-10, 0); let p1 = toLabScreen(10, 0);
    ctxLab.moveTo(p0.x, p0.y); ctxLab.lineTo(p1.x, p1.y);
    ctxLab.stroke();

    // Draw Curve
    ctxLab.strokeStyle = '#ccc';
    ctxLab.lineWidth = 2;
    ctxLab.beginPath();
    for (let i = -10; i <= 10; i += 0.5) {
        let p = toLabScreen(i, i * i);
        if (i === -10) ctxLab.moveTo(p.x, p.y);
        else ctxLab.lineTo(p.x, p.y);
    }
    ctxLab.stroke();

    // Draw History
    ctxLab.fillStyle = 'red';
    labState.history.forEach(hx => {
        let p = toLabScreen(hx, hx * hx);
        ctxLab.beginPath();
        ctxLab.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctxLab.fill();
    });

    // Draw Current
    ctxLab.fillStyle = 'black';
    let pCur = toLabScreen(currentX, currentX * currentX);
    ctxLab.beginPath();
    ctxLab.arc(pCur.x, pCur.y, 6, 0, Math.PI * 2);
    ctxLab.fill();
}

// Lab Buttons
document.getElementById('preset-slow').addEventListener('click', () => {
    resizeLabCanvas();
    runLabSimulation(0.01, "Too Slow");
});
document.getElementById('preset-good').addEventListener('click', () => {
    resizeLabCanvas();
    runLabSimulation(0.15, "Just Right");
});
document.getElementById('preset-fast').addEventListener('click', () => {
    resizeLabCanvas();
    runLabSimulation(1.05, "Diverging"); // 1.1 might be too fast, 1.05 shows oscillation growing
});

// Init Lab Canvas size once
setTimeout(resizeLabCanvas, 500);
