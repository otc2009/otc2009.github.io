let photoImage = null;
let baseImage = null;
let finalImage = null;
let baseWidth = 0;
let baseHeight = 0;
let viewWidth, viewHeight;
let viewCenterX, viewCenterY;
let canvasShell;

let editHistory = [];
let editIndex = -1;
const MAX_EDIT_STEPS = 20;

let lightExposure = 0;
let toneContrast = 0;
let brightHighlights = 0;
let deepShadows = 0;

let colorSaturation = 0;
let colorVibrance = 0;
let colorWarmth = 0;
let colorTint = 0;

let redBoost = 0;
let greenBoost = 0;
let blueBoost = 0;

let edgeSharpen = 0;
let blurStrength = 0;
let edgeVignette = 0;
let filmGrain = 0;
let pixelBlocks = 0;
let colorFringe = 0;

let glowHalo = 0;
let colorSteps = 0;
let duoMix = 0;

let bwOn = false;
let invertOn = false;
let sepiaOn = false;
let thresholdOn = false;

let imageSpin = 0;
let flipSideways = false;
let flipUpside = false;
let frameShape = 'free';
let zoomPercent = 100;

let saveFormat = 'png';
let saveQuality = 90;

let filterDelayId = null;
let needsRefresh = false;
let baseViewW, baseViewH;

function showLoading(message) {
    message = message || 'Processing...';
    const overlay = document.getElementById('loadingOverlay');
    const text = overlay.querySelector('.loading-text');
    if (text) text.textContent = message;
    overlay.classList.remove('hidden');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('hidden');
}

function showToast(message, type, duration) {
    type = type || 'success';
    duration = duration || 2000;
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type;
    toast.offsetHeight;
    toast.classList.add('show');
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { toast.classList.add('hidden'); }, 300);
    }, duration);
}

function updateStatus(text) {
    const statusEl = document.getElementById('statusText');
    if (statusEl) statusEl.textContent = text;
}

function updateHistoryStatus() {
    const el = document.getElementById('historyStatus');
    if (el) el.textContent = 'History: ' + (editIndex + 1) + '/' + editHistory.length;
}

function updateZoomStatus() {
    const el = document.getElementById('zoomStatus');
    if (el) el.textContent = 'Zoom: ' + zoomPercent + '%';
}

function saveToHistory() {
    if (editIndex < editHistory.length - 1) {
        editHistory = editHistory.slice(0, editIndex + 1);
    }
    const state = {
        lightExposure: lightExposure, toneContrast: toneContrast, brightHighlights: brightHighlights, deepShadows: deepShadows,
        colorSaturation: colorSaturation, colorVibrance: colorVibrance, colorWarmth: colorWarmth, colorTint: colorTint,
        redBoost: redBoost, greenBoost: greenBoost, blueBoost: blueBoost,
        edgeSharpen: edgeSharpen, blurStrength: blurStrength, edgeVignette: edgeVignette, filmGrain: filmGrain,
        pixelBlocks: pixelBlocks, colorFringe: colorFringe, glowHalo: glowHalo,
        colorSteps: colorSteps, duoMix: duoMix,
        bwOn: bwOn, invertOn: invertOn,
        sepiaOn: sepiaOn, thresholdOn: thresholdOn,
        imageSpin: imageSpin, flipSideways: flipSideways,
        flipUpside: flipUpside, zoomPercent: zoomPercent
    };
    editHistory.push(state);
    if (editHistory.length > MAX_EDIT_STEPS) {
        editHistory.shift();
    } else {
        editIndex++;
    }
    updateHistoryStatus();
}

function undo() {
    if (editIndex > 0) {
        editIndex--;
        restoreState(editHistory[editIndex]);
        showToast('Undo');
    } else {
        showToast('Nothing to undo', 'error');
    }
}

function redo() {
    if (editIndex < editHistory.length - 1) {
        editIndex++;
        restoreState(editHistory[editIndex]);
        showToast('Redo');
    } else {
        showToast('Nothing to redo', 'error');
    }
}

function restoreState(state) {
    lightExposure = state.lightExposure;
    toneContrast = state.toneContrast;
    brightHighlights = state.brightHighlights;
    deepShadows = state.deepShadows;
    colorSaturation = state.colorSaturation;
    colorVibrance = state.colorVibrance;
    colorWarmth = state.colorWarmth;
    colorTint = state.colorTint;
    redBoost = state.redBoost;
    greenBoost = state.greenBoost;
    blueBoost = state.blueBoost;
    edgeSharpen = state.edgeSharpen;
    blurStrength = state.blurStrength;
    edgeVignette = state.edgeVignette;
    filmGrain = state.filmGrain;
    pixelBlocks = state.pixelBlocks;
    colorFringe = state.colorFringe;
    glowHalo = state.glowHalo;
    colorSteps = state.colorSteps;
    duoMix = state.duoMix;
    bwOn = state.bwOn;
    invertOn = state.invertOn;
    sepiaOn = state.sepiaOn;
    thresholdOn = state.thresholdOn;
    imageSpin = state.imageSpin;
    flipSideways = state.flipSideways;
    flipUpside = state.flipUpside;
    zoomPercent = state.zoomPercent;
    updateAllSliderUI();
    updateEffectButtons();
    applyAllFilters();
    updateHistoryStatus();
}

function updateAllSliderUI() {
    var sliders = {
        exposureSlider: lightExposure, contrastSlider: toneContrast,
        highlightsSlider: brightHighlights, shadowsSlider: deepShadows,
        saturationSlider: colorSaturation, vibranceSlider: colorVibrance,
        temperatureSlider: colorWarmth, tintSlider: colorTint,
        redSlider: redBoost, greenSlider: greenBoost, blueSlider: blueBoost,
        sharpenSlider: edgeSharpen, blurSlider: blurStrength, vignetteSlider: edgeVignette,
        grainSlider: filmGrain, pixelateSlider: pixelBlocks, chromaticSlider: colorFringe,
        glowSlider: glowHalo, posterizeSlider: colorSteps, duotoneSlider: duoMix,
        scaleSlider: zoomPercent, qualitySlider: saveQuality
    };
    var values = {
        exposureValue: lightExposure, contrastValue: toneContrast,
        highlightsValue: brightHighlights, shadowsValue: deepShadows,
        saturationValue: colorSaturation, vibranceValue: colorVibrance,
        temperatureValue: colorWarmth, tintValue: colorTint,
        redValue: redBoost, greenValue: greenBoost, blueValue: blueBoost,
        sharpenValue: edgeSharpen, blurValue: blurStrength, vignetteValue: edgeVignette,
        grainValue: filmGrain, pixelateValue: pixelBlocks, chromaticValue: colorFringe,
        glowValue: glowHalo, posterizeValue: colorSteps, duotoneValue: duoMix,
        scaleValue: zoomPercent + '%', qualityValue: saveQuality + '%'
    };
    for (var id in sliders) {
        var el = document.getElementById(id);
        if (el) el.value = sliders[id];
    }
    for (var id in values) {
        var el = document.getElementById(id);
        if (el) el.textContent = values[id];
    }
}

function updateEffectButtons() {
    var bwBtn = document.getElementById('bwFilter');
    var invertBtn = document.getElementById('invertBtn');
    var sepiaBtn = document.getElementById('sepiaBtn');
    var thresholdBtn = document.getElementById('thresholdBtn');
    if (bwBtn) bwBtn.classList.toggle('active', bwOn);
    if (invertBtn) invertBtn.classList.toggle('active', invertOn);
    if (sepiaBtn) sepiaBtn.classList.toggle('active', sepiaOn);
    if (thresholdBtn) thresholdBtn.classList.toggle('active', thresholdOn);
}

function resetAllFilters() {
    lightExposure = 0; toneContrast = 0; brightHighlights = 0; deepShadows = 0;
    colorSaturation = 0; colorVibrance = 0; colorWarmth = 0; colorTint = 0;
    redBoost = 0; greenBoost = 0; blueBoost = 0;
    edgeSharpen = 0; blurStrength = 0; edgeVignette = 0; filmGrain = 0;
    pixelBlocks = 0; colorFringe = 0;
    glowHalo = 0; colorSteps = 0; duoMix = 0;
    bwOn = false; invertOn = false;
    sepiaOn = false; thresholdOn = false;
    imageSpin = 0; flipSideways = false; flipUpside = false;
    zoomPercent = 100;
    updateEffectButtons();
}

function applyAllFilters() {
    if (!baseImage) return;
    finalImage = baseImage.get();
    var workW = baseWidth;
    var workH = baseHeight;

    if (pixelBlocks > 0) {
        var scaleFactor = map(pixelBlocks, 0, 100, 1, 0.05);
        var smallW = Math.max(1, baseWidth * scaleFactor);
        var smallH = Math.max(1, baseHeight * scaleFactor);
        finalImage.resize(smallW, smallH);
        finalImage.resize(baseWidth, baseHeight);
    }

    if (blurStrength > 0) {
        var blurVal = map(blurStrength, 0, 100, 0, 6);
        finalImage.filter(BLUR, blurVal);
    }

    finalImage.resize(800, 0);
    workW = finalImage.width;
    workH = finalImage.height;

    finalImage.loadPixels();

    for (var i = 0; i < finalImage.pixels.length; i += 4) {
        var r = finalImage.pixels[i];
        var g = finalImage.pixels[i + 1];
        var b = finalImage.pixels[i + 2];

        if (lightExposure !== 0) {
            var exp = lightExposure * 2.55;
            r += exp; g += exp; b += exp;
        }

        if (toneContrast !== 0) {
            var factor = (259 * (toneContrast + 255)) / (255 * (259 - toneContrast));
            r = factor * (r - 128) + 128;
            g = factor * (g - 128) + 128;
            b = factor * (b - 128) + 128;
        }

        var lum = (r + g + b) / 3;
        if (brightHighlights !== 0 && lum > 128) {
            var highlightFactor = ((lum - 128) / 127) * (brightHighlights / 100) * 50;
            r += highlightFactor; g += highlightFactor; b += highlightFactor;
        }
        if (deepShadows !== 0 && lum < 128) {
            var shadowFactor = ((128 - lum) / 128) * (deepShadows / 100) * 50;
            r += shadowFactor; g += shadowFactor; b += shadowFactor;
        }

        if (colorWarmth !== 0) {
            r += colorWarmth * 0.5;
            b -= colorWarmth * 0.5;
        }

        if (colorTint !== 0) {
            g += colorTint * 0.3;
            r += colorTint * 0.15;
            b += colorTint * 0.15;
        }

        r += redBoost * 2.55;
        g += greenBoost * 2.55;
        b += blueBoost * 2.55;

        if (colorSaturation !== 0) {
            var gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            var satFactor = 1 + colorSaturation / 100;
            r = gray + satFactor * (r - gray);
            g = gray + satFactor * (g - gray);
            b = gray + satFactor * (b - gray);
        }

        if (colorVibrance !== 0) {
            var maxC = Math.max(r, g, b);
            var minC = Math.min(r, g, b);
            var sat = maxC === 0 ? 0 : (maxC - minC) / maxC;
            var vibFactor = (1 - sat) * (colorVibrance / 100);
            var grayV = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            r = r + (r - grayV) * vibFactor;
            g = g + (g - grayV) * vibFactor;
            b = b + (b - grayV) * vibFactor;
        }

        if (colorSteps > 0) {
            var levels = Math.max(2, Math.floor(map(colorSteps, 0, 100, 256, 2)));
            r = Math.floor(r / (256 / levels)) * (256 / levels);
            g = Math.floor(g / (256 / levels)) * (256 / levels);
            b = Math.floor(b / (256 / levels)) * (256 / levels);
        }

        if (filmGrain > 0) {
            var grainIntensity = filmGrain * 0.5;
            var noise = random(-grainIntensity, grainIntensity);
            r += noise; g += noise; b += noise;
        }

        if (bwOn) {
            var grayBW = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            r = grayBW; g = grayBW; b = grayBW;
        }

        if (sepiaOn) {
            var tr = 0.393 * r + 0.769 * g + 0.189 * b;
            var tg = 0.349 * r + 0.686 * g + 0.168 * b;
            var tb = 0.272 * r + 0.534 * g + 0.131 * b;
            r = tr; g = tg; b = tb;
        }

        if (invertOn) {
            r = 255 - r; g = 255 - g; b = 255 - b;
        }

        if (thresholdOn) {
            var grayT = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            r = grayT > 128 ? 255 : 0;
            g = grayT > 128 ? 255 : 0;
            b = grayT > 128 ? 255 : 0;
        }

        if (duoMix > 0) {
            var grayD = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            var duoFactor = duoMix / 100;
            var dr, dg, db;
            if (grayD < 128) {
                dr = map(grayD, 0, 128, 80, 255);
                dg = map(grayD, 0, 128, 40, 200);
                db = map(grayD, 0, 128, 120, 100);
            } else {
                dr = map(grayD, 128, 255, 255, 255);
                dg = map(grayD, 128, 255, 200, 255);
                db = map(grayD, 128, 255, 100, 50);
            }
            r = lerp(r, dr, duoFactor);
            g = lerp(g, dg, duoFactor);
            b = lerp(b, db, duoFactor);
        }

        if (edgeVignette > 0) {
            var pixelIndex = i / 4;
            var px = pixelIndex % workW;
            var py = (pixelIndex / workW) | 0;
            var dx = (px - workW / 2) / (workW / 2);
            var dy = (py - workH / 2) / (workH / 2);
            var dist = dx * dx + dy * dy;
            var darken = dist * (edgeVignette / 100);
            r = r * (1 - darken);
            g = g * (1 - darken);
            b = b * (1 - darken);
        }

        finalImage.pixels[i] = constrain(r, 0, 255);
        finalImage.pixels[i + 1] = constrain(g, 0, 255);
        finalImage.pixels[i + 2] = constrain(b, 0, 255);
    }
    finalImage.updatePixels();
    finalImage.resize(baseWidth, baseHeight);
    needsRefresh = false;
}

function scheduleFilterUpdate() {
    needsRefresh = true;
    clearTimeout(filterDelayId);
    filterDelayId = setTimeout(function() {
        applyAllFilters();
        saveToHistory();
    }, 150);
}

function setup() {
    canvasShell = document.getElementById('canvasContainer');
    var containerRect = canvasShell.getBoundingClientRect();
    var c = createCanvas(containerRect.width, containerRect.height);
    c.parent('canvasContainer');
    rectMode(CENTER);
    imageMode(CENTER);
    updateDisplayDimensions();
    saveToHistory();

    document.getElementById("resetButton").addEventListener("click", function() {
        document.getElementById("imgUpload").click();
    });

    document.getElementById("imgUpload").addEventListener("change", function(e) {
        var file = e.target.files[0];
        if (!file) return;
        showLoading('Loading...');
        updateStatus('Loading...');
        loadImage(URL.createObjectURL(file), function(loaded) {
            photoImage = loaded;
            baseImage = loaded.get();
            baseWidth = baseImage.width;
            baseHeight = baseImage.height;
            finalImage = baseImage.get();
            resetAllFilters();
            updateAllSliderUI();
            updateDisplayDimensions();
            editHistory = [];
            editIndex = -1;
            saveToHistory();
            hideLoading();
            showToast('Image loaded!');
            updateStatus(baseWidth + ' x ' + baseHeight);
        }, function() {
            hideLoading();
            showToast('Failed to load', 'error');
        });
    });

    document.getElementById("resetFiltersButton").addEventListener("click", function() {
        if (!baseImage) return;
        resetAllFilters();
        updateAllSliderUI();
        applyAllFilters();
        saveToHistory();
        showToast('Reset!');
        updateStatus('Reset');
    });

    document.getElementById("undoButton").addEventListener("click", undo);
    document.getElementById("redoButton").addEventListener("click", redo);

    document.getElementById("downloadButton").addEventListener("click", function() {
        if (!finalImage) {
            showToast('No image', 'error');
            return;
        }
        showLoading('Exporting...');
        setTimeout(function() {
            var downloadImg = finalImage.get();
            if (zoomPercent !== 100) {
                var newW = Math.round(baseWidth * zoomPercent / 100);
                var newH = Math.round(baseHeight * zoomPercent / 100);
                downloadImg.resize(newW, newH);
            }
            if (imageSpin !== 0 || flipSideways || flipUpside) {
                var gfx = createGraphics(downloadImg.width, downloadImg.height);
                gfx.push();
                gfx.translate(gfx.width / 2, gfx.height / 2);
                gfx.rotate(radians(imageSpin));
                if (flipSideways) gfx.scale(-1, 1);
                if (flipUpside) gfx.scale(1, -1);
                gfx.imageMode(CENTER);
                gfx.image(downloadImg, 0, 0);
                gfx.pop();
                downloadImg = gfx;
            }
            var filename = 'flickart-' + Date.now();
            if (saveFormat === 'jpg') {
                downloadImg.canvas.toBlob(function(blob) {
                    var link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = filename + '.jpg';
                    link.click();
                }, 'image/jpeg', saveQuality / 100);
            } else if (saveFormat === 'webp') {
                downloadImg.canvas.toBlob(function(blob) {
                    var link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = filename + '.webp';
                    link.click();
                }, 'image/webp', saveQuality / 100);
            } else {
                save(downloadImg, filename + '.png');
            }
            hideLoading();
            showToast('Downloaded!');
        }, 100);
    });

    var sliderConfigs = [
        { id: 'exposureSlider', valueId: 'exposureValue', setter: function(v) { lightExposure = v; } },
        { id: 'contrastSlider', valueId: 'contrastValue', setter: function(v) { toneContrast = v; } },
        { id: 'highlightsSlider', valueId: 'highlightsValue', setter: function(v) { brightHighlights = v; } },
        { id: 'shadowsSlider', valueId: 'shadowsValue', setter: function(v) { deepShadows = v; } },
        { id: 'saturationSlider', valueId: 'saturationValue', setter: function(v) { colorSaturation = v; } },
        { id: 'vibranceSlider', valueId: 'vibranceValue', setter: function(v) { colorVibrance = v; } },
        { id: 'temperatureSlider', valueId: 'temperatureValue', setter: function(v) { colorWarmth = v; } },
        { id: 'tintSlider', valueId: 'tintValue', setter: function(v) { colorTint = v; } },
        { id: 'redSlider', valueId: 'redValue', setter: function(v) { redBoost = v; } },
        { id: 'greenSlider', valueId: 'greenValue', setter: function(v) { greenBoost = v; } },
        { id: 'blueSlider', valueId: 'blueValue', setter: function(v) { blueBoost = v; } },
        { id: 'sharpenSlider', valueId: 'sharpenValue', setter: function(v) { edgeSharpen = v; } },
        { id: 'blurSlider', valueId: 'blurValue', setter: function(v) { blurStrength = v; } },
        { id: 'vignetteSlider', valueId: 'vignetteValue', setter: function(v) { edgeVignette = v; } },
        { id: 'grainSlider', valueId: 'grainValue', setter: function(v) { filmGrain = v; } },
        { id: 'pixelateSlider', valueId: 'pixelateValue', setter: function(v) { pixelBlocks = v; } },
        { id: 'chromaticSlider', valueId: 'chromaticValue', setter: function(v) { colorFringe = v; } },
        { id: 'glowSlider', valueId: 'glowValue', setter: function(v) { glowHalo = v; } },
        { id: 'posterizeSlider', valueId: 'posterizeValue', setter: function(v) { colorSteps = v; } },
        { id: 'duotoneSlider', valueId: 'duotoneValue', setter: function(v) { duoMix = v; } }
    ];

    for (var i = 0; i < sliderConfigs.length; i++) {
        (function(config) {
            var slider = document.getElementById(config.id);
            if (slider) {
                slider.addEventListener("input", function(e) {
                    config.setter(parseInt(e.target.value));
                    document.getElementById(config.valueId).textContent = e.target.value;
                    scheduleFilterUpdate();
                });
            }
        })(sliderConfigs[i]);
    }

    var scaleSlider = document.getElementById("scaleSlider");
    if (scaleSlider) {
        scaleSlider.addEventListener("input", function(e) {
            zoomPercent = parseInt(e.target.value);
            document.getElementById("scaleValue").textContent = zoomPercent + '%';
            updateZoomStatus();
        });
    }

    var qualitySlider = document.getElementById("qualitySlider");
    if (qualitySlider) {
        qualitySlider.addEventListener("input", function(e) {
            saveQuality = parseInt(e.target.value);
            document.getElementById("qualityValue").textContent = saveQuality + '%';
        });
    }

    var bwBtn = document.getElementById("bwFilter");
    if (bwBtn) {
        bwBtn.addEventListener("click", function() {
            bwOn = !bwOn;
            bwBtn.classList.toggle('active', bwOn);
            scheduleFilterUpdate();
        });
    }

    var invertBtn = document.getElementById("invertBtn");
    if (invertBtn) {
        invertBtn.addEventListener("click", function() {
            invertOn = !invertOn;
            invertBtn.classList.toggle('active', invertOn);
            scheduleFilterUpdate();
        });
    }

    var sepiaBtn = document.getElementById("sepiaBtn");
    if (sepiaBtn) {
        sepiaBtn.addEventListener("click", function() {
            sepiaOn = !sepiaOn;
            sepiaBtn.classList.toggle('active', sepiaOn);
            scheduleFilterUpdate();
        });
    }

    var thresholdBtn = document.getElementById("thresholdBtn");
    if (thresholdBtn) {
        thresholdBtn.addEventListener("click", function() {
            thresholdOn = !thresholdOn;
            thresholdBtn.classList.toggle('active', thresholdOn);
            scheduleFilterUpdate();
        });
    }

    var rotateLeftBtn = document.getElementById("rotateLeft");
    if (rotateLeftBtn) {
        rotateLeftBtn.addEventListener("click", function() {
            imageSpin = (imageSpin - 90) % 360;
            showToast('Rotated -90');
        });
    }

    var rotateRightBtn = document.getElementById("rotateRight");
    if (rotateRightBtn) {
        rotateRightBtn.addEventListener("click", function() {
            imageSpin = (imageSpin + 90) % 360;
            showToast('Rotated +90');
        });
    }

    var flipHBtn = document.getElementById("flipH");
    if (flipHBtn) {
        flipHBtn.addEventListener("click", function() {
            flipSideways = !flipSideways;
            showToast(flipSideways ? 'Flipped H' : 'Unflipped H');
        });
    }

    var flipVBtn = document.getElementById("flipV");
    if (flipVBtn) {
        flipVBtn.addEventListener("click", function() {
            flipUpside = !flipUpside;
            showToast(flipUpside ? 'Flipped V' : 'Unflipped V');
        });
    }

    var aspectIds = ['aspect11', 'aspect43', 'aspect169', 'aspectFree'];
    for (var i = 0; i < aspectIds.length; i++) {
        (function(id) {
            var btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener("click", function() {
                    frameShape = id.replace('aspect', '').toLowerCase();
                    var allAspectBtns = document.querySelectorAll('[id^="aspect"]');
                    for (var j = 0; j < allAspectBtns.length; j++) {
                        allAspectBtns[j].classList.remove('active');
                    }
                    btn.classList.add('active');
                    showToast('Aspect: ' + frameShape);
                });
            }
        })(aspectIds[i]);
    }

    var formatIds = ['formatPng', 'formatJpg', 'formatWebp'];
    for (var i = 0; i < formatIds.length; i++) {
        (function(id) {
            var btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener("click", function() {
                    saveFormat = id.replace('format', '').toLowerCase();
                    var allFormatBtns = document.querySelectorAll('.format-btn');
                    for (var j = 0; j < allFormatBtns.length; j++) {
                        allFormatBtns[j].classList.remove('active');
                    }
                    btn.classList.add('active');
                    showToast('Format: ' + saveFormat.toUpperCase());
                });
            }
        })(formatIds[i]);
    }

    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) redo();
                else undo();
            } else if (e.key === 's') {
                e.preventDefault();
                document.getElementById("downloadButton").click();
            } else if (e.key === 'o') {
                e.preventDefault();
                document.getElementById("resetButton").click();
            }
        }
    });
}

function updateDisplayDimensions() {
    var maxW = width * 0.9;
    var maxH = height * 0.9;
    if (baseImage) {
        var imgRatio = baseWidth / baseHeight;
        if (maxW / maxH > imgRatio) {
            viewHeight = maxH;
            viewWidth = viewHeight * imgRatio;
        } else {
            viewWidth = maxW;
            viewHeight = viewWidth / imgRatio;
        }
    } else {
        viewHeight = min(maxH, maxW / 1.5);
        viewWidth = viewHeight * 1.5;
    }
    baseViewW = viewWidth;
    baseViewH = viewHeight;
    viewCenterX = width / 2;
    viewCenterY = height / 2;
}

function draw() {
    background(30);
    if (photoImage && finalImage) {
        push();
        translate(viewCenterX, viewCenterY);
        rotate(radians(imageSpin));
        if (flipSideways) scale(-1, 1);
        if (flipUpside) scale(1, -1);
        var drawW = viewWidth * zoomPercent / 100;
        var drawH = viewHeight * zoomPercent / 100;
        image(finalImage, 0, 0, drawW, drawH);
        pop();
        noFill();
        stroke(255);
        strokeWeight(2);
        push();
        translate(viewCenterX, viewCenterY);
        rotate(radians(imageSpin));
        var bw = viewWidth * zoomPercent / 100 + 4;
        var bh = viewHeight * zoomPercent / 100 + 4;
        rect(0, 0, bw, bh);
        pop();
    } else {
        fill(80);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(14);
        text('Click "File: Upload" to load an image', viewCenterX, viewCenterY - 10);
        textSize(11);
        fill(60);
        text('Supports JPG, PNG, WebP, GIF', viewCenterX, viewCenterY + 15);
        text('Ctrl+O to open, Ctrl+S to save, Ctrl+Z to undo', viewCenterX, viewCenterY + 35);
    }
}

function windowResized() {
    var containerRect = canvasShell.getBoundingClientRect();
    resizeCanvas(containerRect.width, containerRect.height);
    updateDisplayDimensions();
}
