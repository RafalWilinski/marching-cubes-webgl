var gl;

function getCanvas() {
  return document.getElementById("glcanvas");
}

function updateCanvasSize() {
  getCanvas().width = document.body.clientWidth;
  getCanvas().height = document.body.clientHeight;
}

function start() {
  updateCanvasSize();
  var canvas = getCanvas();
  gl = initWebGL(canvas);

  if (gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
}

function initWebGL(canvas) {
  gl = null;
  try {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  }
  catch(e) {
    console.log('Failed to get WebGL Context');
  }

  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    gl = null;
  }

  return gl;
}