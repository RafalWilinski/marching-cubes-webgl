function Chunk(resolution, noiseScale, chunkScale, threshold, seed, gl) {
  this.resolution = resolution;
  this.noiseScale = noiseScale;
  this.chunkScale = chunkScale;
  this.data = [];
  this.gridCells = [];
  this.threshold = threshold;
  this.gl = gl;
  noise.seed(seed);

  this.generateChunkPoints();
  this.renderPoints();
}

Chunk.prototype.generateChunkPoints = function () {
  for (var x = 0; x < this.resolution; x++) {
    this.data[x] = [];
    for (var y = 0; y < this.resolution; y++) {
      this.data[x][y] = [];
      for (var z = 0; z < this.resolution; z++) {
        var value = noise.simplex3(x * this.noiseScale, y * this.noiseScale, z * this.noiseScale);
        if (value > this.threshold) {
          this.data[x][y][z] = 1;
        } else {
          this.data[x][y][z] = 0;
        }
      }
    }
  }
};

Chunk.prototype.renderPoints = function () {
  var sample = new RenderableObject(Cube.vertices, Cube.uvs, Cube.normals, Cube.indices, [0, 0, 0], gl);
  sample.prepareBuffers();

  if (this.data.length < this.resolution) {
    console.error('Cannot render Chunk before it\'s generated!');
  } else {
    for (var x = 0; x < this.resolution; x++) {
      for (var y = 0; y < this.resolution; y++) {
        for (var z = 0; z < this.resolution; z++) {
          if (this.data[x][y][z] === 1) {
            spawnObject(sample.copy([
              x * this.chunkScale - this.chunkScale * this.resolution / 2,
              y * this.chunkScale - this.chunkScale * this.resolution / 2,
              z * this.chunkScale - this.chunkScale * this.resolution / 2
            ]));
          }
        }
      }
    }

    console.log('Chunk spawned!');

    this.polygonise(0.01);
  }
};

Chunk.prototype.polygonise = function (isoLevel) {
  var tris = [];

  for (var x = 0; x < this.resolution - 1; x++) {
    for (var y = 0; y < this.resolution - 1; y++) {
      for (var z = 0; z < this.resolution - 1; z++) {
        var newTris = this.polygonisePoint(x, y, z, isoLevel);
        if (newTris) tris = tris.concat(this.polygonisePoint(x, y, z, isoLevel));
      }
    }
  }

  console.log(tris);
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

  console.log(triangles);
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

Chunk.prototype.getPosition = function (x, y, z) {
  return {
    x: x * this.chunkScale - this.chunkScale * this.resolution / 2,
    y: y * this.chunkScale - this.chunkScale * this.resolution / 2,
    z: z * this.chunkScale - this.chunkScale * this.resolution / 2
  }
};