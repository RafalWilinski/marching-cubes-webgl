var thresholdValue;
var resolutionValue;
var noiseScaleValue;
var chunkScaleValue;

window.onload = function() {
  thresholdValue = document.getElementById('threshold_value');
  resolutionValue = document.getElementById('resolution_value');
  noiseScaleValue = document.getElementById('noise-scale_value');
  chunkScaleValue = document.getElementById('chunk-scale_value');

  document.chunkform.onsubmit = function() {
    removeAllObjects();

    new Chunk(
      parseInt(resolutionValue.textContent),
      parseFloat(noiseScaleValue.textContent),
      parseFloat(chunkScaleValue.textContent),
      parseFloat(thresholdValue.textContent),
      Math.random(),
      gl
    );

    return false;
  };
};

const onThresholdChange = function(value) {
  thresholdValue.textContent = value * 1.00001 / 100;
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
