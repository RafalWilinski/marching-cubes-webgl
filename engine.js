import { updateCanvasSize, getCanvas } from './utils/dom';
import { loadIdentity, mvTranslate, setMatrixUniforms } from './utils/matrix';
import { makePerspective } from 'sylvester';

let vertexPositionAttribute;
let shaderProgram;
let verticesBuffer;

function initWebGL(canvas) {
  let g;
  try {
    g = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  } catch (e) {
    console.log('Failed to get WebGL Context');
  }

  if (!g) {
    alert('Unable to initialize WebGL. Your browser may not support it.');
    g = null;
  }

  return g;
}

//
// Get shader from DOM
//
const getShader = (gl, id) => {
  const shaderScript = document.getElementById(id);

  if (!shaderScript) {
    return null;
  }

  let theSource = '';
  let currentChild = shaderScript.firstChild;

  while (currentChild) {
    if (currentChild.nodeType === 3) {
      theSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }

  let shader;

  if (shaderScript.type === 'x-shader/x-fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type === 'x-shader/x-vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }

  gl.shaderSource(shader, theSource);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
    return null;
  }

  return shader;
};

//
// Get shaders and attach them to GL context
//
const initShaders = (gl) => {
  const fragmentShader = getShader(gl, 'shader-fs');
  const vertexShader = getShader(gl, 'shader-vs');
  shaderProgram = gl.createProgram();

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program');
  }

  gl.useProgram(shaderProgram);

  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(vertexPositionAttribute);
};

//
// Load vertices into GL buffer
//
const initBuffers = (gl) => {
  verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

  const vertices = [
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
};

//
// Main Drawing function
//
const drawScene = (gl) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const perspectiveMatrix = makePerspective(45, 640.0 / 480.0, 0.1, 100.0);

  loadIdentity();
  mvTranslate([-0.0, 0.0, -6.0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

  setMatrixUniforms(shaderProgram, perspectiveMatrix);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

export const start = () => {
  updateCanvasSize();
  const canvas = getCanvas();
  const g = initWebGL(canvas);

  if (g) {
    g.clearColor(0.0, 0.0, 0.0, 1.0);
    g.enable(g.DEPTH_TEST);
    g.depthFunc(g.LEQUAL);

    initShaders(g);
    initBuffers(g);

    setInterval(drawScene, 15);
  }

  return g;
};

const gl = start();
