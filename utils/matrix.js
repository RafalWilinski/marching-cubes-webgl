import { Matrix, Vector } from 'sylvester';

export const loadIdentity = () => {
  mvMatrix = Matrix.I(4);
};

export const multMatrix = (m) => {
  mvMatrix = mvMatrix.x(m);
};

export const mvTranslate = (v) => {
  multMatrix(Matrix.Translation(Vector([v[0], v[1], v[2]])).ensure4x4());
};

export const setMatrixUniforms = (gl, shaderProgram, perspectiveMatrix) => {
  const pUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  const mvUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
};
