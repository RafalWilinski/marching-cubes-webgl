export getCanvas = () => document.getElementById("glcanvas");

export updateCanvasSize = () => {
  getCanvas().width = document.body.clientWidth;
  getCanvas().height = document.body.clientHeight;
};
