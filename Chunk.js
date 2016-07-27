function Chunk (resolution, noiseScale, chunkScale, threshold, seed, gl) {
  this.resolution = resolution;
  this.noiseScale = noiseScale;
  this.chunkScale = chunkScale;
  this.data = [];
  this.threshold = threshold;
  this.gl = gl;
  noise.seed(seed);

  this.generateChunkPoints();
  this.renderPoints();
}

Chunk.prototype.generateChunkPoints = function() {
  for (var x = 0; x < this.resolution; x++) {
    this.data[x] = [];
    for (var y = 0; y < this.resolution; y++) {
      this.data[x][y] = [];
      for (var z = 0; z < this.resolution; z++) {
        var value = noise.simplex3(x / this.noiseScale, y / this.noiseScale, z / this.noiseScale);
        if (value > this.threshold) {
          this.data[x][y][z] = 1;
        } else {
          this.data[x][y][z] = 0;
        }
      }
    }
  }
};

Chunk.prototype.renderPoints = function() {
  var sample = new RenderableObject(Cube.vertices, Cube.uvs, Cube.normals, Cube.indices, [0,0,0], gl);

  if (this.data.length < this.resolution) {
    console.error('Cannot render Chunk before it\'s generated!');
  } else {
    for (var x = 0; x < this.resolution; x++) {
      for (var y = 0; y < this.resolution; y++) {
        for (var z = 0; z < this.resolution; z++) {
          if (this.data[x][y][z] === 1) {
            console.log('Spawning at: ' + x + ',' + y + ',' + z);
            spawnObject(sample.copy([x / this.chunkScale, y / this.chunkScale, z / this.chunkScale]));
          }
        }
      }
    }

    console.log('Chunk spawned!');
  }
};