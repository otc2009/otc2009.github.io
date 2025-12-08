let img = null;
let originalImg = null;
let processedImg = null;
let originalWidth = 0;
let originalHeight = 0;
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
let red = 10, blue = 10, green = 10;
let lastRed = 10, lastBlue = 10, lastGreen = 10;
let yellow = 10, purple = 10, pink = 10;
let lastYellow = 10, lastPurple = 10, lastPink = 10;
let bwFilterActive = false;
let flipHorizontal = false;
let flipVertical = false;
let bouncingPhotos = [];
let backgroundImages = [];
let backgroundPhoto = null;
let showBouncingPhotos = true;

function preload() {
    backgroundImages.push(loadImage('edited-photo (4).png'));
    backgroundImages.push(loadImage('edited-photo (5).png'));
    backgroundImages.push(loadImage('edited-photo (6).png'));
    backgroundImages.push(loadImage('edited-photo (7).png'));
    backgroundImages.push(loadImage('edited-photo (8).png'));
    backgroundImages.push(loadImage('edited-photo (9).png'));
    backgroundImages.push(loadImage('owens_project.png'));
    backgroundImages.push(loadImage('unnamed.png'));
    backgroundImages.push(loadImage('unnamed (1).png'));
}

class BouncingPhoto {
    constructor(img, x, y) {
        this.img = img;
        this.size = random(80, 150);
        this.x = x;
        this.y = y;
        this.speedX = random(-2, 2);
        this.speedY = random(-2, 2);
        if (abs(this.speedX) < 1) this.speedX = this.speedX < 0 ? -1.5 : 1.5;
        if (abs(this.speedY) < 1) this.speedY = this.speedY < 0 ? -1.5 : 1.5;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x - this.size / 2 < 0 || this.x + this.size / 2 > width) {
            this.speedX *= -1;
            this.x = constrain(this.x, this.size / 2, width - this.size / 2);
        }
        if (this.y - this.size / 2 < 0 || this.y + this.size / 2 > height) {
            this.speedY *= -1;
            this.y = constrain(this.y, this.size / 2, height - this.size / 2);
        }
    }

    display() {
        push();
        imageMode(CENTER);
        tint(255, 150);
        image(this.img, this.x, this.y, this.size, this.size);
        noTint();
        pop();
    }
}

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

    //  bouncing photos
    for (let i = 0; i < backgroundImages.length; i++) {
        let x = random(width);
        let y = random(height);
        bouncingPhotos.push(new BouncingPhoto(backgroundImages[i], x, y));
    }

    //photo buttons
    const upload = document.getElementById("imgUpload");
    const resetButton = document.getElementById("resetButton");
    const resetFiltersButton = document.getElementById("resetFiltersButton");
    const downloadButton = document.getElementById("downloadButton");

    const buttonWidth = resetButton.offsetWidth;
    const imageBottom = centerY + (displayH / 2);
    const gap = 20;

    const totalButtonWidth = buttonWidth * 3 + gap * 2;
    const startX = centerX - (totalButtonWidth / 2);

    resetButton.style.position = "absolute";
    resetButton.style.left = `${startX}px`;
    resetButton.style.top = `${imageBottom + 30}px`;

    resetFiltersButton.style.position = "absolute";
    resetFiltersButton.style.left = `${startX + buttonWidth + gap}px`;
    resetFiltersButton.style.top = `${imageBottom + 30}px`;

    downloadButton.style.position = "absolute";
    downloadButton.style.left = `${startX + buttonWidth * 2 + gap * 2}px`;
    downloadButton.style.top = `${imageBottom + 30}px`;

    //event listeners
    resetButton.addEventListener("click", () => {
        upload.click();
        exposure = 0;
        pixelate = 100;
        shimmer = 0;
        grain = 0;
        red = 10;
        blue = 10;
        green = 10;
        yellow = 10;
        purple = 10;
        pink = 10;
        flipHorizontal = false;
        flipVertical = false;
        document.getElementById("exposureSlider").value = 0;
        document.getElementById("pixelateSlider").value = 100;
        document.getElementById("shimmerSlider").value = 0;
        document.getElementById("grainSlider").value = 0;
        document.getElementById("redSlider").value = 10;
        document.getElementById("greenSlider").value = 10;
        document.getElementById("blueSlider").value = 10;
        document.getElementById("yellowSlider").value = 10;
        document.getElementById("purpleSlider").value = 10;
        document.getElementById("pinkSlider").value = 10;
        displayW = ogDisplayW;
        displayH = ogDisplayH;

    });

    upload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        loadImage(URL.createObjectURL(file), (loaded) => {
        img = loaded;
        originalImg = loaded.get();

        backgroundPhoto = loaded.get();
        showBouncingPhotos = false;

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
        originalWidth = originalImg.width;
        originalHeight = originalImg.height;
        });
    });
    const exposureSlider = document.getElementById("exposureSlider");
    exposureSlider.addEventListener("input", (e) => {
        exposure = e.target.value;
        document.getElementById("exposureValue").textContent = e.target.value;
    });
    const pixelateSlider = document.getElementById("pixelateSlider");
    pixelateSlider.addEventListener("input", (e) => {
        pixelate = e.target.value;
        document.getElementById("pixelateValue").textContent = e.target.value;
    });
    const shimmerSlider = document.getElementById("shimmerSlider")
    shimmerSlider.addEventListener("input", (e) => {
        shimmer = e.target.value;
        document.getElementById("shimmerValue").textContent = e.target.value;
    });
    const grainSlider = document.getElementById("grainSlider");
    grainSlider.addEventListener("input", (e) => {
        grain = e.target.value;
        document.getElementById("grainValue").textContent = e.target.value;
    });
    const resetFiltersBtn = document.getElementById("resetFiltersButton");
    resetFiltersBtn.addEventListener("click", () => {
        exposure = 0;
        pixelate = 100;
        shimmer = 0;
        grain = 0;
        red = 10;
        blue = 10;
        green = 10;
        yellow = 10;
        purple = 10;
        pink = 10;
        flipHorizontal = false;
        flipVertical = false;
        document.getElementById("exposureSlider").value = 0;
        document.getElementById("pixelateSlider").value = 100;
        document.getElementById("shimmerSlider").value = 0;
        document.getElementById("grainSlider").value = 0;
        document.getElementById("redSlider").value = 10;
        document.getElementById("blueSlider").value = 10;
        document.getElementById("greenSlider").value = 10;
        document.getElementById("yellowSlider").value = 10;
        document.getElementById("purpleSlider").value = 10;
        document.getElementById("pinkSlider").value = 10;
        document.getElementById("exposureValue").textContent = 0;
        document.getElementById("pixelateValue").textContent = 100;
        document.getElementById("shimmerValue").textContent = 0;
        document.getElementById("grainValue").textContent = 0;
        document.getElementById("redValue").textContent = 10;
        document.getElementById("greenValue").textContent = 10;
        document.getElementById("blueValue").textContent = 10;
        document.getElementById("yellowValue").textContent = 10;
        document.getElementById("purpleValue").textContent = 10;
        document.getElementById("pinkValue").textContent = 10;
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

            // Apply flip transformations to download image
            if (flipHorizontal || flipVertical) {
                let flippedImg = createGraphics(downloadImg.width, downloadImg.height);
                flippedImg.push();
                flippedImg.translate(flippedImg.width / 2, flippedImg.height / 2);
                flippedImg.imageMode(CENTER);
                if (flipHorizontal) {
                    flippedImg.scale(-1, 1);
                }
                if (flipVertical) {
                    flippedImg.scale(1, -1);
                }
                flippedImg.image(downloadImg, 0, 0);
                flippedImg.pop();
                save(flippedImg, "edited-photo.png");
            } 
            else {
                save(downloadImg, "edited-photo.png");
            }
        }
    });

    document.getElementById("bwFilter").addEventListener("click", () => {
        bwFilterActive = !bwFilterActive;
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
    redSlider.addEventListener("input", (e) => {
        red = e.target.value;
        document.getElementById("redValue").textContent = e.target.value;
    });
    const greenSlider = document.getElementById("greenSlider");
    greenSlider.addEventListener("input", (e) => {
        green = e.target.value;
        document.getElementById("greenValue").textContent = e.target.value;
    });
    const blueSlider = document.getElementById("blueSlider");
    blueSlider.addEventListener("input", (e) => {
        blue = e.target.value;
        document.getElementById("blueValue").textContent = e.target.value;
    });
    const yellowSlider = document.getElementById("yellowSlider");
    yellowSlider.addEventListener("input", (e) => {
        yellow = e.target.value;
        document.getElementById("yellowValue").textContent = e.target.value;
    });
    const purpleSlider = document.getElementById("purpleSlider");
    purpleSlider.addEventListener("input", (e) => {
        purple = e.target.value;
        document.getElementById("purpleValue").textContent = e.target.value;
    });
    const pinkSlider = document.getElementById("pinkSlider");
    pinkSlider.addEventListener("input", (e) => {
        pink = e.target.value;
        document.getElementById("pinkValue").textContent = e.target.value;
    });

    //flip buttons
    document.getElementById("flipH").addEventListener("click", () => {
        flipHorizontal = !flipHorizontal;
    });
    document.getElementById("flipV").addEventListener("click", () => {
        flipVertical = !flipVertical;
    });
}


//filter functions


function applyExposure() {
    if (exposure != lastExposure) {
        if (exposure == 0) {
            // No exposure adjustment needed
        }
        else {
            let tempImg = processedImg.get();
            let originalWidth = tempImg.width;
            let originalHeight = tempImg.height;
            tempImg.resize(400, 0);

            tempImg.loadPixels();
            let exp = parseInt(exposure);
            for (let i = 0; i < tempImg.pixels.length; i += 4) {
                tempImg.pixels[i] = constrain(tempImg.pixels[i] + exp, 0, 255);
                tempImg.pixels[i + 1] = constrain(tempImg.pixels[i + 1] + exp, 0, 255);
                tempImg.pixels[i + 2] = constrain(tempImg.pixels[i + 2] + exp, 0, 255);
            }
            tempImg.updatePixels();
            tempImg.resize(originalWidth, originalHeight);
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
            let smallW = originalWidth * scaleFactor;
            let smallH = originalHeight * scaleFactor;

            tempImg.resize(smallW, smallH);
            tempImg.resize(originalWidth, originalHeight);
            processedImg = tempImg;
        }

        if(pixelate == 100){
            tempImg.resize(originalWidth, originalHeight);
            processedImg = tempImg;
        }

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
        let redAdjust = (parseInt(red) - 10) * 25;
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
        let greenAdjust = (parseInt(green) - 10) * 25;
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
        let blueAdjust = (parseInt(blue) - 10) * 25;
        for(let i = 0; i < tempImg.pixels.length; i+=4){
            tempImg.pixels[i+2] = constrain(tempImg.pixels[i+2] + blueAdjust, 0, 255);
        }
        tempImg.updatePixels();
        tempImg.resize(originalWidth, originaHeight);
        processedImg = tempImg;
        lastBlue = blue;
    }
}

function applyYellow(){
    if(yellow!=lastYellow){
        let tempImg = processedImg.get();
        let originalWidth = tempImg.width;
        let originaHeight = tempImg.height;
        tempImg.resize(400,0);
        tempImg.loadPixels();
        let yellowAdjust = (parseInt(yellow) - 10) * 25;
        for(let i = 0; i < tempImg.pixels.length; i+=4){
            tempImg.pixels[i] = constrain(tempImg.pixels[i] + yellowAdjust, 0, 255);
            tempImg.pixels[i+1] = constrain(tempImg.pixels[i+1] + yellowAdjust, 0, 255);
        }
        tempImg.updatePixels();
        tempImg.resize(originalWidth, originaHeight);
        processedImg = tempImg;
        lastYellow = yellow;
    }
}

function applyPurple(){
    if(purple!=lastPurple){
        let tempImg = processedImg.get();
        let originalWidth = tempImg.width;
        let originaHeight = tempImg.height;
        tempImg.resize(400,0);
        tempImg.loadPixels();
        let purpleAdjust = (parseInt(purple) - 10) * 25;
        for(let i = 0; i < tempImg.pixels.length; i+=4){
            tempImg.pixels[i] = constrain(tempImg.pixels[i] + purpleAdjust, 0, 255);
            tempImg.pixels[i+2] = constrain(tempImg.pixels[i+2] + purpleAdjust, 0, 255);
        }
        tempImg.updatePixels();
        tempImg.resize(originalWidth, originaHeight);
        processedImg = tempImg;
        lastPurple = purple;
    }
}

function applyPink(){
    if(pink!=lastPink){
        let tempImg = processedImg.get();
        let originalWidth = tempImg.width;
        let originaHeight = tempImg.height;
        tempImg.resize(400,0);
        tempImg.loadPixels();
        let pinkAdjust = (parseInt(pink) - 10) * 25;
        for(let i = 0; i < tempImg.pixels.length; i+=4){
            tempImg.pixels[i] = constrain(tempImg.pixels[i] + pinkAdjust * 0.8, 0, 255);
            tempImg.pixels[i+1] = constrain(tempImg.pixels[i+1] + pinkAdjust * 0.3, 0, 255);
            tempImg.pixels[i+2] = constrain(tempImg.pixels[i+2] + pinkAdjust * 0.3, 0, 255);
        }
        tempImg.updatePixels();
        tempImg.resize(originalWidth, originaHeight);
        processedImg = tempImg;
        lastPink = pink;
    }
}

//draw loop

function draw() {
    background('#87CEEB');

    // Display background photo or bouncing photos
    if (backgroundPhoto && !showBouncingPhotos) {
        // Stretch the background photo to fill the entire canvas
        push();
        imageMode(CORNER);
        image(backgroundPhoto, 0, 0, width, height);
        pop();
    } else if (showBouncingPhotos) {
        // Update and display bouncing photos
        for (let photo of bouncingPhotos) {
            photo.update();
            photo.display();
        }
    }

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
        //detection for slider changes - only reset if any filter changed
        if(exposure != lastExposure || pixelate != lastPixelate || shimmer != lastShimmer || grain != lastGrain || red != lastRed || blue != lastBlue || green != lastGreen || yellow != lastYellow || purple != lastPurple || pink != lastPink){
            processedImg = originalImg.get();

            // Apply only the filters that need to be applied
            if(exposure != 0) {
                let tempImg = processedImg.get();
                tempImg.resize(400, 0);
                tempImg.loadPixels();
                let exp = parseInt(exposure);
                for (let i = 0; i < tempImg.pixels.length; i += 4) {
                    tempImg.pixels[i] = constrain(tempImg.pixels[i] + exp, 0, 255);
                    tempImg.pixels[i + 1] = constrain(tempImg.pixels[i + 1] + exp, 0, 255);
                    tempImg.pixels[i + 2] = constrain(tempImg.pixels[i + 2] + exp, 0, 255);
                }
                tempImg.updatePixels();
                tempImg.resize(originalWidth, originalHeight);
                processedImg = tempImg;
            }

            if(pixelate != 100) {
                let tempImg = processedImg.get();
                let scaleFactor = map(parseInt(pixelate), 0, 100, 0.05, 1);
                let smallW = originalWidth * scaleFactor;
                let smallH = originalHeight * scaleFactor;
                tempImg.resize(smallW, smallH);
                tempImg.resize(originalWidth, originalHeight);
                processedImg = tempImg;
            }

            if(shimmer != 0) {
                let tempImg = processedImg.get();
                tempImg.resize(400, 0);
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

            if(grain != 0) {
                let tempImg = processedImg.get();
                tempImg.resize(400, 0);
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

            if(red != 10) {
                let tempImg = processedImg.get();
                tempImg.resize(400, 0);
                tempImg.loadPixels();
                let redAdjust = (parseInt(red) - 10) * 25;
                for(let i = 0; i < tempImg.pixels.length; i+=4){
                    tempImg.pixels[i] = constrain(tempImg.pixels[i] + redAdjust, 0, 255);
                }
                tempImg.updatePixels();
                tempImg.resize(originalWidth, originalHeight);
                processedImg = tempImg;
            }

            if(green != 10) {
                let tempImg = processedImg.get();
                tempImg.resize(400, 0);
                tempImg.loadPixels();
                let greenAdjust = (parseInt(green) - 10) * 25;
                for(let i = 0; i < tempImg.pixels.length; i+=4){
                    tempImg.pixels[i+1] = constrain(tempImg.pixels[i+1] + greenAdjust, 0, 255);
                }
                tempImg.updatePixels();
                tempImg.resize(originalWidth, originalHeight);
                processedImg = tempImg;
            }

            if(blue != 10) {
                let tempImg = processedImg.get();
                tempImg.resize(400, 0);
                tempImg.loadPixels();
                let blueAdjust = (parseInt(blue) - 10) * 25;
                for(let i = 0; i < tempImg.pixels.length; i+=4){
                    tempImg.pixels[i+2] = constrain(tempImg.pixels[i+2] + blueAdjust, 0, 255);
                }
                tempImg.updatePixels();
                tempImg.resize(originalWidth, originalHeight);
                processedImg = tempImg;
            }

            if(yellow != 10) {
                let tempImg = processedImg.get();
                tempImg.resize(400, 0);
                tempImg.loadPixels();
                let yellowAdjust = (parseInt(yellow) - 10) * 25;
                for(let i = 0; i < tempImg.pixels.length; i+=4){
                    tempImg.pixels[i] = constrain(tempImg.pixels[i] + yellowAdjust, 0, 255);
                    tempImg.pixels[i+1] = constrain(tempImg.pixels[i+1] + yellowAdjust, 0, 255);
                }
                tempImg.updatePixels();
                tempImg.resize(originalWidth, originalHeight);
                processedImg = tempImg;
            }

            if(purple != 10) {
                let tempImg = processedImg.get();
                tempImg.resize(400, 0);
                tempImg.loadPixels();
                let purpleAdjust = (parseInt(purple) - 10) * 25;
                for(let i = 0; i < tempImg.pixels.length; i+=4){
                    tempImg.pixels[i] = constrain(tempImg.pixels[i] + purpleAdjust, 0, 255);
                    tempImg.pixels[i+2] = constrain(tempImg.pixels[i+2] + purpleAdjust, 0, 255);
                }
                tempImg.updatePixels();
                tempImg.resize(originalWidth, originalHeight);
                processedImg = tempImg;
            }

            if(pink != 10) {
                let tempImg = processedImg.get();
                tempImg.resize(400, 0);
                tempImg.loadPixels();
                let pinkAdjust = (parseInt(pink) - 10) * 25;
                for(let i = 0; i < tempImg.pixels.length; i+=4){
                    tempImg.pixels[i] = constrain(tempImg.pixels[i] + pinkAdjust * 0.8, 0, 255);
                    tempImg.pixels[i+1] = constrain(tempImg.pixels[i+1] + pinkAdjust * 0.3, 0, 255);
                    tempImg.pixels[i+2] = constrain(tempImg.pixels[i+2] + pinkAdjust * 0.3, 0, 255);
                }
                tempImg.updatePixels();
                tempImg.resize(originalWidth, originalHeight);
                processedImg = tempImg;
            }

            lastExposure = exposure;
            lastPixelate = pixelate;
            lastShimmer = shimmer;
            lastGrain = grain;
            lastRed = red;
            lastBlue = blue;
            lastGreen = green;
            lastYellow = yellow;
            lastPurple = purple;
            lastPink = pink;
        }

        // Apply B&W filter
        push();
        translate(centerX, centerY);

        // Apply flip 
        if(flipHorizontal) {
            scale(-1, 1);
        }
        if(flipVertical) {
            scale(1, -1);
        }

        if(bwFilterActive) {
            let tempImg = processedImg.get();
            tempImg.filter(GRAY);
            image(tempImg, 0, 0, displayW * horizontalStretch, displayH * verticalStretch);
        } 
        else {
            image(processedImg, 0, 0, displayW * horizontalStretch, displayH * verticalStretch);
        }
        pop();
        noTint();
        colorProgress+=0.02;
        if(colorProgress > 1){
            colorProgress = 0;
        }
  }
}