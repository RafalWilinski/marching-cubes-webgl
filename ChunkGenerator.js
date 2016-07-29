var thresholdValue;
var resolutionValue;
var noiseScaleValue;
var chunkScaleValue;
var isolevelValue;
var pointValue;
var chunk;
var seed;

window.addEventListener('load', function() {
  thresholdValue = document.getElementById('threshold_value');
  resolutionValue = document.getElementById('resolution_value');
  noiseScaleValue = document.getElementById('noise-scale_value');
  chunkScaleValue = document.getElementById('chunk-scale_value');
  isolevelValue = document.getElementById('isolevel_value');
  pointValue = document.getElementById('pointlevel_value');

  onThresholdChange(50);
  onResolutionChange(10);
  onNoiseScaleChange(10);
  onChunkScaleChange(20);
  onIsolevelChange(50);
  onPointValueChange(75);

  document.chunkform.onsubmit = function() {
    removeAllObjects();

    chunk = new Chunk(
      parseInt(resolutionValue.textContent),
      parseFloat(noiseScaleValue.textContent),
      parseFloat(chunkScaleValue.textContent),
      parseFloat(thresholdValue.textContent),
      parseFloat(isolevelValue.textContent),
      parseFloat(pointValue.textContent),
      seed,
      gl
    );

    chunk.polygonise(parseFloat(isolevelValue.textContent));

    return false;
  };
});

const onThresholdChange = function(value) {
  thresholdValue.textContent = value / 100;
};

const onResolutionChange = function(value) {
  resolutionValue.textContent = value;
};

const onNoiseScaleChange = function(value) {
  noiseScaleValue.textContent = value / 100;
};

const onChunkScaleChange = function(value) {
  chunkScaleValue.textContent = value / 20;
};

const onIsolevelChange = function(value) {
  isolevelValue.textContent = value / 100;
};

const onPointValueChange = function(value) {
  pointValue.textContent = value / 100;
};

const onSeedChange = function(value) {
  var sum = 0;
  for (var i = 0; i < value.length; i++) {
    sum += value.charCodeAt(i);
  }

  seed = sum % 100000000;
  console.log('Seed: ' + seed);
};