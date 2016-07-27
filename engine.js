var canvas;
var gl;

var cubeRotation = 0.0;
var lastCubeUpdateTime = 0;

var cubeImage;
var cubeTexture;

var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var vertexNormalAttribute;
var textureCoordAttribute;
var perspectiveMatrix;

var renderableObjects = [];

function start() {
  canvas = document.getElementById("glcanvas");

  initWebGL(canvas);

  if (gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    initShaders();
    initBuffers();
    initTextures();
    setInterval(drawScene, 15);
  }
}

/**
 * Initialize WebGL Context. Displays alert if it's not possible.
 */
function initWebGL() {
  gl = null;
  try {
    gl = canvas.getContext("experimental-webgl");
  } catch (e) {
    alert("Unable to initialize WebGL. " + e);
  }

  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
}

/**
 * Create vertex, texture and normal buffers
 */
function initBuffers() {
  var cube = new RenderableObject(Cube.vertices, Cube.uvs, Cube.normals, Cube.indices, [2,-1, -2], gl);
  cube.prepareBuffers();
  renderableObjects.push(cube);
  var cube2 = new RenderableObject(Cube.vertices, Cube.uvs, Cube.normals, Cube.indices, [-2, -1, -2], gl);
  cube2.prepareBuffers();
  renderableObjects.push(cube2);
}

/**
 * Initialize the textures we'll be using, then initiate a load of the texture images.
 * The handleTextureLoaded() callback will fired after.
 */
function initTextures() {
  cubeTexture = gl.createTexture();
  cubeImage = new Image();
  cubeImage.onload = function() { handleTextureLoaded(cubeImage, cubeTexture); }
  cubeImage.crossOrigin = '';
  cubeImage.src = "grid.png";
}

/**
 * Callback function called after loading texture from file.
 * @param image
 * @param texture
 */
function handleTextureLoaded(image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

/**
 * Draws scene.
 *  - creates perspective matrix,
 *  - moves camera position
 *  - binds vertex, texturecoord and normal buffers to rendering context
 *  - sets texture
 *  - finally draws cube and rotates it
 */
function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);

  loadIdentity();
  mvTranslate([0.0, 0.0, -6.0]);

  renderableObjects.forEach(function(renderableObject) {
    renderableObject.render();
  });

  // Update the rotation for the next draw, if it's time to do so.
  var currentTime = (new Date).getTime();
  if (lastCubeUpdateTime) {
    var delta = currentTime - lastCubeUpdateTime;

    cubeRotation += (30 * delta) / 1000.0;
  }

  lastCubeUpdateTime = currentTime;
}

/**
 * Initialize shaders and attach them to program.
 */
function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(shader));
  }

  gl.useProgram(shaderProgram);

  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);

  textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  gl.enableVertexAttribArray(textureCoordAttribute);

  vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(vertexNormalAttribute);
}

/**
 * Loads shaders from DOM.
 * @param gl
 * @param id
 * @returns {*}
 */
function getShader(gl, id) {
  var shaderScript = document.getElementById(id);

  if (!shaderScript) {
    return null;
  }

  var theSource = "";
  var currentChild = shaderScript.firstChild;

  while(currentChild) {
    if (currentChild.nodeType == 3) {
      theSource += currentChild.textContent;
    }

    currentChild = currentChild.nextSibling;
  }

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }

  gl.shaderSource(shader, theSource);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

/**
 * Creates identity matrix.
 */
function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));

  var normalMatrix = mvMatrix.inverse();
  normalMatrix = normalMatrix.transpose();
  var nUniform = gl.getUniformLocation(shaderProgram, "uNormalMatrix");
  gl.uniformMatrix4fv(nUniform, false, new Float32Array(normalMatrix.flatten()));
}

var mvMatrixStack = [];

function mvPushMatrix(m) {
  if (m) {
    mvMatrixStack.push(m.dup());
    mvMatrix = m.dup();
  } else {
    mvMatrixStack.push(mvMatrix.dup());
  }
}

function mvPopMatrix() {
  if (!mvMatrixStack.length) {
    throw("Can't pop from an empty matrix stack.");
  }
  mvMatrix = mvMatrixStack.pop();
  return mvMatrix;
}

function mvRotate(angle, v) {
  var inRadians = angle * Math.PI / 180.0;
  var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
  multMatrix(m);
}