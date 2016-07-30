function Chunk(resolution, noiseScale, chunkScale, threshold, pointValues, seed, debugVertices, gl, noiseAlg) {
  this.resolution = resolution;
  this.noiseScale = noiseScale;
  this.chunkScale = chunkScale;
  this.data = [];
  this.threshold = threshold;
  this.pointValues = pointValues;
  this.gl = gl;
  this.noiseAlg = noiseAlg;
  noise.seed(seed);

  this.generateChunkPoints();
  if (debugVertices) {
    this.renderPoints();
  }
}

Chunk.prototype.generateChunkPoints = function () {
  for (var x = 0; x < this.resolution; x++) {
    this.data[x] = [];
    for (var y = 0; y < this.resolution; y++) {
      this.data[x][y] = [];
      for (var z = 0; z < this.resolution; z++) {
        var value = this.noiseAlg === 'simplex'
          ? noise.simplex3(x * this.noiseScale, y * this.noiseScale, z * this.noiseScale)
          : noise.perlin3(x * this.noiseScale, y * this.noiseScale, z * this.noiseScale);

        if (value > this.threshold) {
          this.data[x][y][z] = this.pointValues;
        } else {
          this.data[x][y][z] = 0;
        }
      }
    }
  }
};

Chunk.prototype.renderPoints = function () {
  this.sample = new RenderableObject(Cube.vertices, Cube.uvs, Cube.normals, Cube.indices, [0, 0, 0], gl);
  this.sample.prepareBuffers();

  if (this.data.length < this.resolution) {
    console.error('Cannot render Chunk before it\'s generated!');
  } else {
    for (var x = 0; x < this.resolution; x++) {
      for (var y = 0; y < this.resolution; y++) {
        for (var z = 0; z < this.resolution; z++) {
          if (this.data[x][y][z] > 0) {
            spawnObject(this.sample.copy([
              x * this.chunkScale - this.chunkScale * this.resolution / 2,
              y * this.chunkScale - this.chunkScale * this.resolution / 2,
              z * this.chunkScale - this.chunkScale * this.resolution / 2
            ]));
          }
        }
      }
    }
  }
};

Chunk.prototype.prepareMesh = function (isoLevel) {
  var mesh = [];

  for (var x = 0; x < this.resolution - 1; x++) {
    for (var y = 0; y < this.resolution - 1; y++) {
      for (var z = 0; z < this.resolution - 1; z++) {
        var part = this.polygonisePoint(x, y, z, isoLevel);
        if (part) mesh = mesh.concat(part);
      }
    }
  }

  return mesh;
};

Chunk.prototype.polygonise = function (isoLevel) {
  var mesh = this.prepareMesh(isoLevel);

  var indices = new Array(3 * mesh.length);
  var indicesIndex = 0;
  var vertices = new Array(3 * 3 * mesh.length);
  var vertexIndex = 0;
  var uvs = [];
  var normals = new Array(3 * 3 * mesh.length);
  var normalIndex = 0;
  var i = 0;

  for (var submeshIndex = 0; submeshIndex < mesh.length; submeshIndex++) {
    for (var pointIndex = 0; pointIndex < mesh[submeshIndex].length; pointIndex++) {
      vertices[vertexIndex] = mesh[submeshIndex][pointIndex].x;
      vertices[vertexIndex + 1] = mesh[submeshIndex][pointIndex].y;
      vertices[vertexIndex + 2] = mesh[submeshIndex][pointIndex].z;
      vertexIndex += 3;

      indices[indicesIndex] = (submeshIndex * 3 + pointIndex);
      indicesIndex++;

      var normal = calculateNormal(mesh[submeshIndex]);
      for(i = 0; i < 3; i++) {
        normals[normalIndex + i] = normal[i];
      }

      normalIndex += 3;
    }
  }

  for(i = 0; i < indices.length; i++) {
    if (i % 4 === 0) {
      uvs.push(0.0);
      uvs.push(0.0);
    } else if (i % 4 === 1) {
      uvs.push(0.0);
      uvs.push(1.0);
    } else if (i % 4 === 2) {
      uvs.push(1.0);
      uvs.push(1.0);
    } else if (i % 4 === 3) {
      uvs.push(1.0);
      uvs.push(0.0);
    }
  }

  console.log('Marching cube generated. Vertices: ' + vertices.length / 3
    + ', indices: ' + indices.length
    + ', uvs: ' + uvs.length
    + ', normals: ' + normals.length / 3);

  var chunk = new RenderableObject(vertices, uvs, normals, indices, [0,0,0], gl);
  chunk.prepareBuffers();
  spawnObject(chunk);
};

Chunk.prototype.polygonisePoint = function (x, y, z, isoLevel) {
  var vertList = [];
  var i, ntriang;
  var cubeindex = 0;
  var triangles = [];

  if (this.data[x][y][z] < isoLevel) cubeindex |= 1 << 0;
  if (this.data[x + 1][y][z] < isoLevel) cubeindex |= 1 << 1;
  if (this.data[x + 1][y + 1][z] < isoLevel) cubeindex |= 1 << 2;
  if (this.data[x][y + 1][z] < isoLevel) cubeindex |= 1 << 3;
  if (this.data[x][y][z + 1] < isoLevel) cubeindex |= 1 << 4;
  if (this.data[x + 1][y][z + 1] < isoLevel) cubeindex |= 1 << 5;
  if (this.data[x + 1][y + 1][z + 1] < isoLevel) cubeindex |= 1 << 6;
  if (this.data[x][y + 1][z + 1] < isoLevel) cubeindex |= 1 << 7;

  if (MARCHING_CUBES.edges[cubeindex] === 0)
    return null;

  if (MARCHING_CUBES.edges[cubeindex] & 1)
    vertList[0] = this.vertexInterpolation(isoLevel,
      this.getPosition(x, y, z),
      this.getPosition(x + 1, y, z),
      this.data[x][y][z],
      this.data[x + 1][y][z]);

  if (MARCHING_CUBES.edges[cubeindex] & 2)
    vertList[1] = this.vertexInterpolation(isoLevel,
      this.getPosition(x + 1, y, z),
      this.getPosition(x + 1, y + 1, z),
      this.data[x + 1][y][z],
      this.data[x + 1][y + 1][z]);

  if (MARCHING_CUBES.edges[cubeindex] & 4)
    vertList[2] = this.vertexInterpolation(isoLevel,
      this.getPosition(x + 1, y + 1, z),
      this.getPosition(x, y + 1, z),
      this.data[x + 1][y + 1][z],
      this.data[x][y + 1][z]);

  if (MARCHING_CUBES.edges[cubeindex] & 8)
    vertList[3] = this.vertexInterpolation(isoLevel,
      this.getPosition(x, y + 1, z),
      this.getPosition(x, y, z),
      this.data[x][y + 1][z],
      this.data[x][y][z]);

  if (MARCHING_CUBES.edges[cubeindex] & 16)
    vertList[4] = this.vertexInterpolation(isoLevel,
      this.getPosition(x, y, z + 1),
      this.getPosition(x + 1, y, z + 1),
      this.data[x][y][z + 1],
      this.data[x + 1][y][z + 1]);

  if (MARCHING_CUBES.edges[cubeindex] & 32)
    vertList[5] = this.vertexInterpolation(isoLevel,
      this.getPosition(x + 1, y, z + 1),
      this.getPosition(x + 1, y + 1, z + 1),
      this.data[x + 1][y][z + 1],
      this.data[x + 1][y + 1][z + 1]);

  if (MARCHING_CUBES.edges[cubeindex] & 64)
    vertList[6] = this.vertexInterpolation(isoLevel,
      this.getPosition(x + 1, y + 1, z + 1),
      this.getPosition(x, y + 1, z + 1),
      this.data[x + 1][y + 1][z + 1],
      this.data[x][y + 1][z + 1]);

  if (MARCHING_CUBES.edges[cubeindex] & 128)
    vertList[7] = this.vertexInterpolation(isoLevel,
      this.getPosition(x, y + 1, z + 1),
      this.getPosition(x, y, z + 1),
      this.data[x][y + 1][z + 1],
      this.data[x][y][z + 1]);

  if (MARCHING_CUBES.edges[cubeindex] & 256)
    vertList[8] = this.vertexInterpolation(isoLevel,
      this.getPosition(x, y, z),
      this.getPosition(x, y, z + 1),
      this.data[x][y][z],
      this.data[x][y][z + 1]);

  if (MARCHING_CUBES.edges[cubeindex] & 512)
    vertList[9] = this.vertexInterpolation(isoLevel,
      this.getPosition(x + 1, y, z),
      this.getPosition(x + 1, y, z + 1),
      this.data[x + 1][y][z],
      this.data[x + 1][y][z + 1]);

  if (MARCHING_CUBES.edges[cubeindex] & 1024)
    vertList[10] = this.vertexInterpolation(isoLevel,
      this.getPosition(x + 1, y + 1, z),
      this.getPosition(x + 1, y + 1, z + 1),
      this.data[x + 1][y + 1][z],
      this.data[x + 1][y + 1][z + 1]);

  if (MARCHING_CUBES.edges[cubeindex] & 2048)
    vertList[11] = this.vertexInterpolation(isoLevel,
      this.getPosition(x, y + 1, z),
      this.getPosition(x, y + 1, z + 1),
      this.data[x][y + 1][z],
      this.data[x][y + 1][z + 1]);

  /* Create the triangle */
  ntriang = 0;
  for (i = 0; MARCHING_CUBES.tris[cubeindex][i] != -1; i += 3) {
    triangles[ntriang] = [];
    triangles[ntriang][0] = vertList[MARCHING_CUBES.tris[cubeindex][i]];
    triangles[ntriang][1] = vertList[MARCHING_CUBES.tris[cubeindex][i + 1]];
    triangles[ntriang][2] = vertList[MARCHING_CUBES.tris[cubeindex][i + 2]];

    ntriang++;
  }

  return triangles;
};

Chunk.prototype.vertexInterpolation = function (isoLevel, p1, p2, valp1, valp2) {
  var mu, p = {};

  if (Math.abs(isoLevel - valp1) < 0.00001) return (p1);
  if (Math.abs(isoLevel - valp2) < 0.00001) return (p2);
  if (Math.abs(valp1 - valp2) < 0.00001) return (p1);

  mu = (isoLevel - valp1) / (valp2 - valp1);
  p.x = p1.x + mu * (p2.x - p1.x);
  p.y = p1.y + mu * (p2.y - p1.y);
  p.z = p1.z + mu * (p2.z - p1.z);

  return (p);
};

Chunk.prototype.getPosition = function (xPos, yPos, zPos) {
  return {
    x: xPos * this.chunkScale - ((this.chunkScale * this.resolution) / 2),
    y: yPos * this.chunkScale - ((this.chunkScale * this.resolution) / 2),
    z: zPos * this.chunkScale - ((this.chunkScale * this.resolution) / 2)
  };
};