//global variables
let img = null;
let originalImg = null;
let processedImg = null;
let displayW, displayH;
let centerX, centerY;
let colorA, colorB;
let colorProgress = 0;
let exposure = 0;
let lastExposure = 0;
let pixelate = 100;
let lastPixelate = 100;
let shimmer = 0;
let lastShimmer = 0;
let grain = 0;
let lastGrain = 0;
let verticalStretch = 1.0;
let horizontalStretch = 1.0;
let red = 50, blue = 50, green = 50;
let lastRed = 50, lastBlue = 50, lastGreen = 50;

function setup() {
    let c = createCanvas(windowWidth, windowHeight);
    c.position(0, 0);
    c.style("z-index", "-1");

    rectMode(CENTER);
    imageMode(CENTER);

    //colorA = color(255, 150, 150);
    //colorB = color(150, 150, 255);

    displayH = min(width * 0.6, height * 0.6);
    displayW = displayH * 1.2;
    let ogDisplayH = displayH;
    let ogDisplayW = displayW;
    centerX = width * 0.75;
    centerY = height * 0.5;

    //photo buttons
    const upload = document.getElementById("imgUpload");
    const resetButton = document.getElementById("resetButton");
    const resetFiltersButton = document.getElementById("resetFiltersButton");
    const downloadButton = document.getElementById("downloadButton");

    const buttonWidth = resetButton.offsetWidth;
    const imageBottom = centerY + (displayH / 2);
    const gap = 10;

    resetButton.style.position = "absolute";
    resetButton.style.left = `${centerX - buttonWidth * 1.5 - gap * 2}px`;
    resetButton.style.top = `${imageBottom + 30}px`;

    resetFiltersButton.style.position = "absolute";
    resetFiltersButton.style.left = `${centerX - buttonWidth / 2}px`;
    resetFiltersButton.style.top = `${imageBottom + 30}px`;

    downloadButton.style.position = "absolute";
    downloadButton.style.left = `${centerX + buttonWidth / 2 + gap * 2}px`;
    downloadButton.style.top = `${imageBottom + 30}px`;

    //event listeners 
    resetButton.addEventListener("click", () => {
        upload.click();
        exposure = 0;
        pixelate = 100;
        shimmer = 0;
        red = 50;
        blue = 50;
        green = 50;
        document.getElementById("exposureSlider").value = 0;
        document.getElementById("pixelateSlider").value = 100;
        document.getElementById("shimmerSlider").value = 0;
        document.getElementById("grainSlider").value = 0;
        document.getElementById("redSlider").value = 50;
        document.getElementById("greenSlider").value = 50;
        document.getElementById("blueSlider").value = 50;
        displayW = ogDisplayW;
        displayH = ogDisplayH;

    });

    upload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        loadImage(URL.createObjectURL(file), (loaded) => {
        img = loaded;
        originalImg = loaded.get();

        let size = min(originalImg.width, originalImg.height);
        let rectHeight = size;
        let rectWidth = size * 1.2;

        if (rectWidth > originalImg.width) {
            rectWidth = originalImg.width;
            rectHeight = rectWidth / 1.2;
        }

        let cropX = (originalImg.width - rectWidth) / 2;
        let cropY = (originalImg.height - rectHeight) / 2;

        originalImg = originalImg.get(cropX, cropY, rectWidth, rectHeight);
        processedImg = originalImg.get();
        });
    });
    const exposureSlider = document.getElementById("exposureSlider");
    exposureSlider.addEventListener("input", (e) => {exposure = e.target.value;});
    const pixelateSlider = document.getElementById("pixelateSlider");
    pixelateSlider.addEventListener("input", (e) => {pixelate = e.target.value});
    const shimmerSlider = document.getElementById("shimmerSlider")
    shimmerSlider.addEventListener("input", (e) => {shimmer = e.target.value});
    const grainSlider = document.getElementById("grainSlider");
    grainSlider.addEventListener("input", (e) => {grain = e.target.value});
    const resetFiltersBtn = document.getElementById("resetFiltersButton");
    resetFiltersBtn.addEventListener("click", () => {
        exposure = 0;
        pixelate = 100;
        shimmer = 0;
        grain = 0;
        red = 50;
        blue = 50;
        green = 50;
        document.getElementById("exposureSlider").value = 0;
        document.getElementById("pixelateSlider").value = 100;
        document.getElementById("shimmerSlider").value = 0;
        document.getElementById("grainSlider").value = 0;
        document.getElementById("redSlider").value = 50;
        document.getElementById("blueSlider").value = 50;
        document.getElementById("greenSlider").value = 50;
        horizontalStretch = 1.0;
        verticalStretch = 1.0;
        displayW = ogDisplayW;
        displayH = ogDisplayH;
    });

    downloadButton.addEventListener("click", () => {
        if (processedImg) {
            let downloadImg = processedImg.get();
            let newWidth = processedImg.width * horizontalStretch;
            let newHeight = processedImg.height * verticalStretch;
            downloadImg.resize(newWidth, newHeight);
            save(downloadImg, "edited-photo.png");
        }
    });

    //resolution buttons
    document.getElementById("vStretch1").addEventListener("click", () => {
        verticalStretch = 1.2;
        horizontalStretch = 1.0;
        displayW=ogDisplayW
        displayH=ogDisplayH;
    });
    document.getElementById("vStretch2").addEventListener("click", () => {
        verticalStretch = 1.4;
        horizontalStretch = 1.0;
        displayW=ogDisplayW;
        displayH=ogDisplayH;
    });
    document.getElementById("center").addEventListener("click", () => {
        verticalStretch = 1.0;
        horizontalStretch = 1.0;
        displayW=ogDisplayW;
        displayH=ogDisplayH;
    });
    document.getElementById("hStretch1").addEventListener("click", () => {
        verticalStretch = 1.0;
        horizontalStretch = 1.2;
        displayW=ogDisplayW;
        displayH=ogDisplayH
    });
    document.getElementById("hStretch2").addEventListener("click", () => {
        verticalStretch = 1.0;
        horizontalStretch = 1.4;
        displayW*=0.87;
        displayH*=0.87;
    });
    //color sliders
    const redSlider = document.getElementById("redSlider");
    redSlider.addEventListener("input", (e) => {red = e.target.value});
    const greenSlider = document.getElementById("greenSlider");
    greenSlider.addEventListener("input", (e) => {green = e.target.value});
    const blueSlider = document.getElementById("blueSlider");
    blueSlider.addEventListener("input", (e) => {blue = e.target.value});
}
function applyExposure() {
    if (exposure != lastExposure) {
        if (exposure == 0) {
            processedImg = originalImg;
        } 
        else {
            let tempImg = originalImg.get();
            tempImg.resize(400, 0);

            tempImg.loadPixels();
            let exp = parseInt(exposure);
            for (let i = 0; i < tempImg.pixels.length; i += 4) {
                tempImg.pixels[i] = constrain(tempImg.pixels[i] + exp, 0, 255);
                tempImg.pixels[i + 1] = constrain(tempImg.pixels[i + 1] + exp, 0, 255);
                tempImg.pixels[i + 2] = constrain(tempImg.pixels[i + 2] + exp, 0, 255);
            }
            tempImg.updatePixels();
            processedImg = tempImg;
        }
        lastExposure = exposure;
    }
}

function applyPixelate(){
    if(pixelate != lastPixelate){
        let tempImg = processedImg.get();

        if(pixelate != 100){
            let scaleFactor = map(parseInt(pixelate), 0, 100, 0.05, 1);
            let smallW = tempImg.width * scaleFactor;
            let smallH = tempImg.height * scaleFactor;

            tempImg.resize(smallW, smallH);
            tempImg.resize(processedImg.width, processedImg.height);
        }

        processedImg = tempImg;
        lastPixelate = pixelate;
    }
}

function applyShimmer(){
    if(shimmer!=lastShimmer){
        if(shimmer == 0){
        }
        else{
            let tempImg = processedImg.get();
            let originalWidth = tempImg.width;
            let originalHeight = tempImg.height;
            tempImg.resize(400,0);
            tempImg.loadPixels();
            let shimmerAmount = parseInt(shimmer);
            for(let i = 0; i < tempImg.pixels.length; i+=4){
                let r = tempImg.pixels[i];
                let g = tempImg.pixels[i+1];
                let b = tempImg.pixels[i+2];
                let brightness = (r+g+b) / 3;
                if(brightness > 130){
                    let boost = map(shimmerAmount, 0, 100, 0, 150);
                    let fadeAmount = map(brightness, 130, 255, 0.3, 1.0);
                    let avg = (r + g + b) / 3;
                    tempImg.pixels[i] = constrain(r + (r - avg) * fadeAmount + boost * 0.5, 0, 255);
                    tempImg.pixels[i+1] = constrain(g + (g - avg) * fadeAmount + boost * 0.5, 0, 255);
                    tempImg.pixels[i+2] = constrain(b + (b - avg) * fadeAmount + boost * 0.5, 0, 255);
                }
            }
            tempImg.updatePixels();
            tempImg.resize(originalWidth, originalHeight);
            processedImg = tempImg;
        }
        lastShimmer = shimmer;
    }
}

function applyGrain(){
    if(grain!=lastGrain){
        if(grain==0){
        }
        else{
            let tempImg = processedImg.get();
            let originalWidth = tempImg.width;
            let originalHeight = tempImg.height;
            tempImg.resize(400,0);
            tempImg.loadPixels();

            let grainIntensity = map(parseInt(grain), 0, 100, 0, 50);

            for(let i = 0; i < tempImg.pixels.length; i+=4){
                let noise = random(-grainIntensity, grainIntensity);
                tempImg.pixels[i] = constrain(tempImg.pixels[i] + noise, 0, 255);
                tempImg.pixels[i+1] = constrain(tempImg.pixels[i+1] + noise, 0, 255);
                tempImg.pixels[i+2] = constrain(tempImg.pixels[i+2] + noise, 0, 255);
            }

            tempImg.updatePixels();
            tempImg.resize(originalWidth, originalHeight);
            processedImg = tempImg;
        }
        lastGrain = grain;
    }
}

function applyRed(){
    if(red!=lastRed){
        let tempImg = processedImg.get();
        let originalWidth = tempImg.width;
        let originalHeight = tempImg.height;
        tempImg.resize(400,0);

        tempImg.loadPixels();
        let redAdjust = (parseInt(red) - 50) * 3;
        for(let i = 0; i < tempImg.pixels.length; i+=4){
            tempImg.pixels[i] = constrain(tempImg.pixels[i] + redAdjust, 0, 255);
        }
        tempImg.updatePixels();
        tempImg.resize(originalWidth, originalHeight);
        processedImg = tempImg;
        lastRed = red;
    }
}

function applyGreen(){
    if(green!=lastGreen){
        let tempImg = processedImg.get();
        let originalWidth = tempImg.width;
        let originaHeight = tempImg.height;
        tempImg.resize(400,0);
        tempImg.loadPixels();
        let greenAdjust = (parseInt(green) - 50) * 3;
        for(let i = 0; i < tempImg.pixels.length; i+=4){
            tempImg.pixels[i+1] = constrain(tempImg.pixels[i+1] + greenAdjust, 0, 255);
        }
        tempImg.updatePixels();
        tempImg.resize(originalWidth, originaHeight);
        processedImg = tempImg;
        lastGreen = green;
    }
}

function applyBlue(){
    if(blue!=lastBlue){
        let tempImg = processedImg.get();
        let originalWidth = tempImg.width;
        let originaHeight = tempImg.height;
        tempImg.resize(400,0);
        tempImg.loadPixels();
        let blueAdjust = (parseInt(blue) - 50) * 3;
        for(let i = 0; i < tempImg.pixels.length; i+=4){
            tempImg.pixels[i+2] = constrain(tempImg.pixels[i+2] + blueAdjust, 0, 255);
        }
        tempImg.updatePixels();
        tempImg.resize(originalWidth, originaHeight);
        processedImg = tempImg;
        lastBlue = blue;
    }
}

//main draw loop
function draw() {
    background('#87CEEB');

    drawingContext.shadowOffsetX = 15;
    drawingContext.shadowOffsetY = 15;
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = 'rgba(0, 0, 0, 0.5)';

    stroke(255);
    strokeWeight(6);
    noFill();
    rect(centerX, centerY, displayW * horizontalStretch, displayH * verticalStretch);

    if (img) {
        //let fade = (sin(frameCount * 0.02) + 1) / 2;
        //let borderColor = lerpColor(colorA, colorB, fade);
        //noStroke();
        //fill(borderColor)
        //detection for slider changes
        if(exposure != lastExposure || pixelate != lastPixelate || shimmer != lastShimmer || grain != lastGrain || red != lastRed || blue != lastBlue || green != lastGreen){
            lastExposure = -111;
            lastPixelate = -111;
            lastShimmer = -111;
            lastGrain = -111;
            processedImg = originalImg;
            lastRed = -111;
            lastBlue = -111;
            lastGreen = -111;
        }
        applyExposure();
        applyPixelate();
        applyShimmer();
        applyGrain();
        applyRed();
        applyBlue();
        applyGreen();
        image(processedImg, centerX, centerY, displayW * horizontalStretch, displayH * verticalStretch);
        noTint();
        colorProgress+=0.02;
        if(colorProgress > 1){
            colorProgress = 0;
        }
  }
}