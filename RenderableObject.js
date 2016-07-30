function RenderableObject (vertices, uv, normals, indices, position, gl) {
  this.vertices = vertices;
  this.uv = uv;
  this.normals = normals;
  this.indices = indices;
  this.position = position;
  this.gl = gl;
  return this;
}

RenderableObject.prototype.prepareBuffers = function() {
  this.initVerticesBuffer();
  this.initNormalsBuffer();
  this.initUVBuffer();
  this.initIndicesBuffer();
};

RenderableObject.prototype.initVerticesBuffer = function() {
  this.verticesBuffer = gl.createBuffer();
  this.gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
  this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
};

RenderableObject.prototype.initNormalsBuffer = function() {
  this.normalsBuffer = gl.createBuffer();
  this.gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
  this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
};

RenderableObject.prototype.initUVBuffer = function() {
  this.uvBuffer = gl.createBuffer();
  this.gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
  this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uv), gl.STATIC_DRAW);
};

RenderableObject.prototype.initIndicesBuffer = function() {
  this.indicesBuffer = gl.createBuffer();
  this.gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
  this.gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
};

RenderableObject.prototype.render = function () {
  mvPushMatrix();

  mvTranslate(this.position);

  this.gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
  this.gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

  this.gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
  this.gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

  this.gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
  this.gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

  this.gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);

  setMatrixUniforms();

  this.gl.drawElements(gl.TRIANGLES, this.vertices.length / 3, gl.UNSIGNED_SHORT, 0);
  mvPopMatrix();
};

RenderableObject.prototype.copy = function(position) {
  var copy = new RenderableObject(this.vertices, this.uv, this.normals, this.indices, position, this.gl);
  copy.verticesBuffer = this.verticesBuffer;
  copy.normalsBuffer = this.normalsBuffer;
  copy.uvBuffer = this.uvBuffer;
  copy.indicesBuffer = this.indicesBuffer;
  return copy;
};
