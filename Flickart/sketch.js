let img = null;
let originalImg = null;
let processedImg = null;
let originalWidth = 0;
let originalHeight = 0;
let displayW, displayH;
let centerX, centerY;
let canvasContainer;

let history = [];
let historyIndex = -1;
const MAX_HISTORY = 20;

let exposure = 0;
let contrast = 0;
let highlights = 0;
let shadows = 0;

let saturation = 0;
let vibrance = 0;
let temperature = 0;
let tint = 0;

let redChannel = 0;
let greenChannel = 0;
let blueChannel = 0;

let sharpen = 0;
let blurAmount = 0;
let vignette = 0;
let grain = 0;
let pixelate = 0;
let chromatic = 0;

let glowAmount = 0;
let posterize = 0;
let duotone = 0;

let bwFilterActive = false;
let invertActive = false;
let sepiaActive = false;
let thresholdActive = false;

let rotation = 0;
let flipHorizontal = false;
let flipVertical = false;
let aspectRatio = 'free';
let scaleAmount = 100;

let exportFormat = 'png';
let exportQuality = 90;

let filterTimeout = null;
let needsProcessing = false;
let ogDisplayW, ogDisplayH;

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
    if (el) el.textContent = 'History: ' + (historyIndex + 1) + '/' + history.length;
}

function updateZoomStatus() {
    const el = document.getElementById('zoomStatus');
    if (el) el.textContent = 'Zoom: ' + scaleAmount + '%';
}

function saveToHistory() {
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    const state = {
        exposure: exposure, contrast: contrast, highlights: highlights, shadows: shadows,
        saturation: saturation, vibrance: vibrance, temperature: temperature, tint: tint,
        redChannel: redChannel, greenChannel: greenChannel, blueChannel: blueChannel,
        sharpen: sharpen, blurAmount: blurAmount, vignette: vignette, grain: grain,
        pixelate: pixelate, chromatic: chromatic, glowAmount: glowAmount,
        posterize: posterize, duotone: duotone,
        bwFilterActive: bwFilterActive, invertActive: invertActive,
        sepiaActive: sepiaActive, thresholdActive: thresholdActive,
        rotation: rotation, flipHorizontal: flipHorizontal,
        flipVertical: flipVertical, scaleAmount: scaleAmount
    };
    history.push(state);
    if (history.length > MAX_HISTORY) {
        history.shift();
    } else {
        historyIndex++;
    }
    updateHistoryStatus();
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        restoreState(history[historyIndex]);
        showToast('Undo');
    } else {
        showToast('Nothing to undo', 'error');
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        restoreState(history[historyIndex]);
        showToast('Redo');
    } else {
        showToast('Nothing to redo', 'error');
    }
}

function restoreState(state) {
    exposure = state.exposure;
    contrast = state.contrast;
    highlights = state.highlights;
    shadows = state.shadows;
    saturation = state.saturation;
    vibrance = state.vibrance;
    temperature = state.temperature;
    tint = state.tint;
    redChannel = state.redChannel;
    greenChannel = state.greenChannel;
    blueChannel = state.blueChannel;
    sharpen = state.sharpen;
    blurAmount = state.blurAmount;
    vignette = state.vignette;
    grain = state.grain;
    pixelate = state.pixelate;
    chromatic = state.chromatic;
    glowAmount = state.glowAmount;
    posterize = state.posterize;
    duotone = state.duotone;
    bwFilterActive = state.bwFilterActive;
    invertActive = state.invertActive;
    sepiaActive = state.sepiaActive;
    thresholdActive = state.thresholdActive;
    rotation = state.rotation;
    flipHorizontal = state.flipHorizontal;
    flipVertical = state.flipVertical;
    scaleAmount = state.scaleAmount;
    updateAllSliderUI();
    updateEffectButtons();
    applyAllFilters();
    updateHistoryStatus();
}

function updateAllSliderUI() {
    var sliders = {
        exposureSlider: exposure, contrastSlider: contrast,
        highlightsSlider: highlights, shadowsSlider: shadows,
        saturationSlider: saturation, vibranceSlider: vibrance,
        temperatureSlider: temperature, tintSlider: tint,
        redSlider: redChannel, greenSlider: greenChannel, blueSlider: blueChannel,
        sharpenSlider: sharpen, blurSlider: blurAmount, vignetteSlider: vignette,
        grainSlider: grain, pixelateSlider: pixelate, chromaticSlider: chromatic,
        glowSlider: glowAmount, posterizeSlider: posterize, duotoneSlider: duotone,
        scaleSlider: scaleAmount, qualitySlider: exportQuality
    };
    var values = {
        exposureValue: exposure, contrastValue: contrast,
        highlightsValue: highlights, shadowsValue: shadows,
        saturationValue: saturation, vibranceValue: vibrance,
        temperatureValue: temperature, tintValue: tint,
        redValue: redChannel, greenValue: greenChannel, blueValue: blueChannel,
        sharpenValue: sharpen, blurValue: blurAmount, vignetteValue: vignette,
        grainValue: grain, pixelateValue: pixelate, chromaticValue: chromatic,
        glowValue: glowAmount, posterizeValue: posterize, duotoneValue: duotone,
        scaleValue: scaleAmount + '%', qualityValue: exportQuality + '%'
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
    if (bwBtn) bwBtn.classList.toggle('active', bwFilterActive);
    if (invertBtn) invertBtn.classList.toggle('active', invertActive);
    if (sepiaBtn) sepiaBtn.classList.toggle('active', sepiaActive);
    if (thresholdBtn) thresholdBtn.classList.toggle('active', thresholdActive);
}

function resetAllFilters() {
    exposure = 0; contrast = 0; highlights = 0; shadows = 0;
    saturation = 0; vibrance = 0; temperature = 0; tint = 0;
    redChannel = 0; greenChannel = 0; blueChannel = 0;
    sharpen = 0; blurAmount = 0; vignette = 0; grain = 0;
    pixelate = 0; chromatic = 0;
    glowAmount = 0; posterize = 0; duotone = 0;
    bwFilterActive = false; invertActive = false;
    sepiaActive = false; thresholdActive = false;
    rotation = 0; flipHorizontal = false; flipVertical = false;
    scaleAmount = 100;
    updateEffectButtons();
}

function applyAllFilters() {
    if (!originalImg) return;
    processedImg = originalImg.get();
    var workW = originalWidth;
    var workH = originalHeight;

    if (pixelate > 0) {
        var scaleFactor = map(pixelate, 0, 100, 1, 0.05);
        var smallW = Math.max(1, originalWidth * scaleFactor);
        var smallH = Math.max(1, originalHeight * scaleFactor);
        processedImg.resize(smallW, smallH);
        processedImg.resize(originalWidth, originalHeight);
    }

    if (blurAmount > 0) {
        var blurVal = map(blurAmount, 0, 100, 0, 6);
        processedImg.filter(BLUR, blurVal);
    }

    processedImg.resize(800, 0);
    workW = processedImg.width;
    workH = processedImg.height;

    processedImg.loadPixels();

    for (var i = 0; i < processedImg.pixels.length; i += 4) {
        var r = processedImg.pixels[i];
        var g = processedImg.pixels[i + 1];
        var b = processedImg.pixels[i + 2];

        if (exposure !== 0) {
            var exp = exposure * 2.55;
            r += exp; g += exp; b += exp;
        }

        if (contrast !== 0) {
            var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            r = factor * (r - 128) + 128;
            g = factor * (g - 128) + 128;
            b = factor * (b - 128) + 128;
        }

        var lum = (r + g + b) / 3;
        if (highlights !== 0 && lum > 128) {
            var highlightFactor = ((lum - 128) / 127) * (highlights / 100) * 50;
            r += highlightFactor; g += highlightFactor; b += highlightFactor;
        }
        if (shadows !== 0 && lum < 128) {
            var shadowFactor = ((128 - lum) / 128) * (shadows / 100) * 50;
            r += shadowFactor; g += shadowFactor; b += shadowFactor;
        }

        if (temperature !== 0) {
            r += temperature * 0.5;
            b -= temperature * 0.5;
        }

        if (tint !== 0) {
            g += tint * 0.3;
            r += tint * 0.15;
            b += tint * 0.15;
        }

        r += redChannel * 2.55;
        g += greenChannel * 2.55;
        b += blueChannel * 2.55;

        if (saturation !== 0) {
            var gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            var satFactor = 1 + saturation / 100;
            r = gray + satFactor * (r - gray);
            g = gray + satFactor * (g - gray);
            b = gray + satFactor * (b - gray);
        }

        if (vibrance !== 0) {
            var maxC = Math.max(r, g, b);
            var minC = Math.min(r, g, b);
            var sat = maxC === 0 ? 0 : (maxC - minC) / maxC;
            var vibFactor = (1 - sat) * (vibrance / 100);
            var grayV = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            r = r + (r - grayV) * vibFactor;
            g = g + (g - grayV) * vibFactor;
            b = b + (b - grayV) * vibFactor;
        }

        if (posterize > 0) {
            var levels = Math.max(2, Math.floor(map(posterize, 0, 100, 256, 2)));
            r = Math.floor(r / (256 / levels)) * (256 / levels);
            g = Math.floor(g / (256 / levels)) * (256 / levels);
            b = Math.floor(b / (256 / levels)) * (256 / levels);
        }

        if (grain > 0) {
            var grainIntensity = grain * 0.5;
            var noise = random(-grainIntensity, grainIntensity);
            r += noise; g += noise; b += noise;
        }

        if (bwFilterActive) {
            var grayBW = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            r = grayBW; g = grayBW; b = grayBW;
        }

        if (sepiaActive) {
            var tr = 0.393 * r + 0.769 * g + 0.189 * b;
            var tg = 0.349 * r + 0.686 * g + 0.168 * b;
            var tb = 0.272 * r + 0.534 * g + 0.131 * b;
            r = tr; g = tg; b = tb;
        }

        if (invertActive) {
            r = 255 - r; g = 255 - g; b = 255 - b;
        }

        if (thresholdActive) {
            var grayT = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            r = grayT > 128 ? 255 : 0;
            g = grayT > 128 ? 255 : 0;
            b = grayT > 128 ? 255 : 0;
        }

        if (duotone > 0) {
            var grayD = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            var duoFactor = duotone / 100;
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

        if (vignette > 0) {
            var pixelIndex = i / 4;
            var px = pixelIndex % workW;
            var py = (pixelIndex / workW) | 0;
            var dx = (px - workW / 2) / (workW / 2);
            var dy = (py - workH / 2) / (workH / 2);
            var dist = dx * dx + dy * dy;
            var darken = dist * (vignette / 100);
            r = r * (1 - darken);
            g = g * (1 - darken);
            b = b * (1 - darken);
        }

        processedImg.pixels[i] = constrain(r, 0, 255);
        processedImg.pixels[i + 1] = constrain(g, 0, 255);
        processedImg.pixels[i + 2] = constrain(b, 0, 255);
    }
    processedImg.updatePixels();
    processedImg.resize(originalWidth, originalHeight);
    needsProcessing = false;
}

function scheduleFilterUpdate() {
    needsProcessing = true;
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(function() {
        applyAllFilters();
        saveToHistory();
    }, 150);
}

function setup() {
    canvasContainer = document.getElementById('canvasContainer');
    var containerRect = canvasContainer.getBoundingClientRect();
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
            img = loaded;
            originalImg = loaded.get();
            originalWidth = originalImg.width;
            originalHeight = originalImg.height;
            processedImg = originalImg.get();
            resetAllFilters();
            updateAllSliderUI();
            updateDisplayDimensions();
            history = [];
            historyIndex = -1;
            saveToHistory();
            hideLoading();
            showToast('Image loaded!');
            updateStatus(originalWidth + ' x ' + originalHeight);
        }, function() {
            hideLoading();
            showToast('Failed to load', 'error');
        });
    });

    document.getElementById("resetFiltersButton").addEventListener("click", function() {
        if (!originalImg) return;
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
        if (!processedImg) {
            showToast('No image', 'error');
            return;
        }
        showLoading('Exporting...');
        setTimeout(function() {
            var downloadImg = processedImg.get();
            if (scaleAmount !== 100) {
                var newW = Math.round(originalWidth * scaleAmount / 100);
                var newH = Math.round(originalHeight * scaleAmount / 100);
                downloadImg.resize(newW, newH);
            }
            if (rotation !== 0 || flipHorizontal || flipVertical) {
                var gfx = createGraphics(downloadImg.width, downloadImg.height);
                gfx.push();
                gfx.translate(gfx.width / 2, gfx.height / 2);
                gfx.rotate(radians(rotation));
                if (flipHorizontal) gfx.scale(-1, 1);
                if (flipVertical) gfx.scale(1, -1);
                gfx.imageMode(CENTER);
                gfx.image(downloadImg, 0, 0);
                gfx.pop();
                downloadImg = gfx;
            }
            var filename = 'flickart-' + Date.now();
            if (exportFormat === 'jpg') {
                downloadImg.canvas.toBlob(function(blob) {
                    var link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = filename + '.jpg';
                    link.click();
                }, 'image/jpeg', exportQuality / 100);
            } else if (exportFormat === 'webp') {
                downloadImg.canvas.toBlob(function(blob) {
                    var link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = filename + '.webp';
                    link.click();
                }, 'image/webp', exportQuality / 100);
            } else {
                save(downloadImg, filename + '.png');
            }
            hideLoading();
            showToast('Downloaded!');
        }, 100);
    });

    var sliderConfigs = [
        { id: 'exposureSlider', valueId: 'exposureValue', setter: function(v) { exposure = v; } },
        { id: 'contrastSlider', valueId: 'contrastValue', setter: function(v) { contrast = v; } },
        { id: 'highlightsSlider', valueId: 'highlightsValue', setter: function(v) { highlights = v; } },
        { id: 'shadowsSlider', valueId: 'shadowsValue', setter: function(v) { shadows = v; } },
        { id: 'saturationSlider', valueId: 'saturationValue', setter: function(v) { saturation = v; } },
        { id: 'vibranceSlider', valueId: 'vibranceValue', setter: function(v) { vibrance = v; } },
        { id: 'temperatureSlider', valueId: 'temperatureValue', setter: function(v) { temperature = v; } },
        { id: 'tintSlider', valueId: 'tintValue', setter: function(v) { tint = v; } },
        { id: 'redSlider', valueId: 'redValue', setter: function(v) { redChannel = v; } },
        { id: 'greenSlider', valueId: 'greenValue', setter: function(v) { greenChannel = v; } },
        { id: 'blueSlider', valueId: 'blueValue', setter: function(v) { blueChannel = v; } },
        { id: 'sharpenSlider', valueId: 'sharpenValue', setter: function(v) { sharpen = v; } },
        { id: 'blurSlider', valueId: 'blurValue', setter: function(v) { blurAmount = v; } },
        { id: 'vignetteSlider', valueId: 'vignetteValue', setter: function(v) { vignette = v; } },
        { id: 'grainSlider', valueId: 'grainValue', setter: function(v) { grain = v; } },
        { id: 'pixelateSlider', valueId: 'pixelateValue', setter: function(v) { pixelate = v; } },
        { id: 'chromaticSlider', valueId: 'chromaticValue', setter: function(v) { chromatic = v; } },
        { id: 'glowSlider', valueId: 'glowValue', setter: function(v) { glowAmount = v; } },
        { id: 'posterizeSlider', valueId: 'posterizeValue', setter: function(v) { posterize = v; } },
        { id: 'duotoneSlider', valueId: 'duotoneValue', setter: function(v) { duotone = v; } }
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
            scaleAmount = parseInt(e.target.value);
            document.getElementById("scaleValue").textContent = scaleAmount + '%';
            updateZoomStatus();
        });
    }

    var qualitySlider = document.getElementById("qualitySlider");
    if (qualitySlider) {
        qualitySlider.addEventListener("input", function(e) {
            exportQuality = parseInt(e.target.value);
            document.getElementById("qualityValue").textContent = exportQuality + '%';
        });
    }

    var bwBtn = document.getElementById("bwFilter");
    if (bwBtn) {
        bwBtn.addEventListener("click", function() {
            bwFilterActive = !bwFilterActive;
            bwBtn.classList.toggle('active', bwFilterActive);
            scheduleFilterUpdate();
        });
    }

    var invertBtn = document.getElementById("invertBtn");
    if (invertBtn) {
        invertBtn.addEventListener("click", function() {
            invertActive = !invertActive;
            invertBtn.classList.toggle('active', invertActive);
            scheduleFilterUpdate();
        });
    }

    var sepiaBtn = document.getElementById("sepiaBtn");
    if (sepiaBtn) {
        sepiaBtn.addEventListener("click", function() {
            sepiaActive = !sepiaActive;
            sepiaBtn.classList.toggle('active', sepiaActive);
            scheduleFilterUpdate();
        });
    }

    var thresholdBtn = document.getElementById("thresholdBtn");
    if (thresholdBtn) {
        thresholdBtn.addEventListener("click", function() {
            thresholdActive = !thresholdActive;
            thresholdBtn.classList.toggle('active', thresholdActive);
            scheduleFilterUpdate();
        });
    }

    var rotateLeftBtn = document.getElementById("rotateLeft");
    if (rotateLeftBtn) {
        rotateLeftBtn.addEventListener("click", function() {
            rotation = (rotation - 90) % 360;
            showToast('Rotated -90');
        });
    }

    var rotateRightBtn = document.getElementById("rotateRight");
    if (rotateRightBtn) {
        rotateRightBtn.addEventListener("click", function() {
            rotation = (rotation + 90) % 360;
            showToast('Rotated +90');
        });
    }

    var flipHBtn = document.getElementById("flipH");
    if (flipHBtn) {
        flipHBtn.addEventListener("click", function() {
            flipHorizontal = !flipHorizontal;
            showToast(flipHorizontal ? 'Flipped H' : 'Unflipped H');
        });
    }

    var flipVBtn = document.getElementById("flipV");
    if (flipVBtn) {
        flipVBtn.addEventListener("click", function() {
            flipVertical = !flipVertical;
            showToast(flipVertical ? 'Flipped V' : 'Unflipped V');
        });
    }

    var aspectIds = ['aspect11', 'aspect43', 'aspect169', 'aspectFree'];
    for (var i = 0; i < aspectIds.length; i++) {
        (function(id) {
            var btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener("click", function() {
                    aspectRatio = id.replace('aspect', '').toLowerCase();
                    var allAspectBtns = document.querySelectorAll('[id^="aspect"]');
                    for (var j = 0; j < allAspectBtns.length; j++) {
                        allAspectBtns[j].classList.remove('active');
                    }
                    btn.classList.add('active');
                    showToast('Aspect: ' + aspectRatio);
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
                    exportFormat = id.replace('format', '').toLowerCase();
                    var allFormatBtns = document.querySelectorAll('.format-btn');
                    for (var j = 0; j < allFormatBtns.length; j++) {
                        allFormatBtns[j].classList.remove('active');
                    }
                    btn.classList.add('active');
                    showToast('Format: ' + exportFormat.toUpperCase());
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
    if (originalImg) {
        var imgRatio = originalWidth / originalHeight;
        if (maxW / maxH > imgRatio) {
            displayH = maxH;
            displayW = displayH * imgRatio;
        } else {
            displayW = maxW;
            displayH = displayW / imgRatio;
        }
    } else {
        displayH = min(maxH, maxW / 1.5);
        displayW = displayH * 1.5;
    }
    ogDisplayW = displayW;
    ogDisplayH = displayH;
    centerX = width / 2;
    centerY = height / 2;
}

function draw() {
    background(30);
    if (img && processedImg) {
        push();
        translate(centerX, centerY);
        rotate(radians(rotation));
        if (flipHorizontal) scale(-1, 1);
        if (flipVertical) scale(1, -1);
        var drawW = displayW * scaleAmount / 100;
        var drawH = displayH * scaleAmount / 100;
        image(processedImg, 0, 0, drawW, drawH);
        pop();
        noFill();
        stroke(255);
        strokeWeight(2);
        push();
        translate(centerX, centerY);
        rotate(radians(rotation));
        var bw = displayW * scaleAmount / 100 + 4;
        var bh = displayH * scaleAmount / 100 + 4;
        rect(0, 0, bw, bh);
        pop();
    } else {
        fill(80);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(14);
        text('Click "File: Upload" to load an image', centerX, centerY - 10);
        textSize(11);
        fill(60);
        text('Supports JPG, PNG, WebP, GIF', centerX, centerY + 15);
        text('Ctrl+O to open, Ctrl+S to save, Ctrl+Z to undo', centerX, centerY + 35);
    }
}

function windowResized() {
    var containerRect = canvasContainer.getBoundingClientRect();
    resizeCanvas(containerRect.width, containerRect.height);
    updateDisplayDimensions();
}
