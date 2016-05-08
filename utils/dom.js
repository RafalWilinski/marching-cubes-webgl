export const getCanvas = () => document.getElementById('glcanvas');

export const updateCanvasSize = () => {
  getCanvas().width = document.body.clientWidth;
  getCanvas().height = document.body.clientHeight;
};
