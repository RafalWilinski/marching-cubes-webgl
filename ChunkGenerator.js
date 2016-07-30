var thresholdValue;
var resolutionValue;
var noiseScaleValue;
var chunkScaleValue;
var isolevelValue;
var pointValue;
var chunk;
var seed;
var noiseAlg;
var debugPoints = false;
var hotreload = false;

const buildChunk = function() {
  removeAllObjects();
  chunk = new Chunk(
    parseInt(resolutionValue.textContent),
    parseFloat(noiseScaleValue.textContent),
    parseFloat(chunkScaleValue.textContent),
    parseFloat(thresholdValue.textContent),
    parseFloat(pointValue.textContent),
    seed,
    debugPoints,
    gl,
    noiseAlg
  );

  chunk.polygonise(parseFloat(isolevelValue.textContent));
};

window.addEventListener('load', function() {
  thresholdValue = document.getElementById('threshold_value');
  resolutionValue = document.getElementById('resolution_value');
  noiseScaleValue = document.getElementById('noise-scale_value');
  chunkScaleValue = document.getElementById('chunk-scale_value');
  isolevelValue = document.getElementById('isolevel_value');
  pointValue = document.getElementById('pointlevel_value');

  onThresholdChange(50);
  onResolutionChange(20);
  onNoiseScaleChange(10);
  onChunkScaleChange(20);
  onIsolevelChange(50);
  onPointValueChange(75);

  document.chunkform.onsubmit = function() {
    buildChunk();
    return false;
  };
});

const onThresholdChange = function(value) {
  thresholdValue.textContent = value / 100;
  if (hotreload) buildChunk();
};

const onResolutionChange = function(value) {
  resolutionValue.textContent = parseInt(value / 2);
  if (hotreload) buildChunk();
};

const onNoiseScaleChange = function(value) {
  noiseScaleValue.textContent = value / 100;
  if (hotreload) buildChunk();
};

const onChunkScaleChange = function(value) {
  chunkScaleValue.textContent = value / 20;
  if (hotreload) buildChunk();
};

const onIsolevelChange = function(value) {
  isolevelValue.textContent = value / 100;
  if (hotreload) buildChunk();
};

const onPointValueChange = function(value) {
  pointValue.textContent = value / 100;
  if (hotreload) buildChunk();
};

const onSeedChange = function(value) {
  var sum = 0;
  for (var i = 0; i < value.length; i++) {
    sum += value.charCodeAt(i);
  }

  seed = sum % 100000000;
  console.log('Seed: ' + seed);
};

const onDebugVerticesChange = function() {
  debugPoints = !debugPoints;
};

const onNoiseAlgorithmChange = function (value) {
  noiseAlg = value;
};

const onHotReloadChange = function () {
  hotreload = !hotreload;
};