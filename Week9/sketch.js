function setup() {
    createCanvas(windowWidth, windowHeight);
  }
  
  function draw() {
    let d = abs(mouseX - width/2);
    let maxD = width/2;
    let blu = map(d, 0, maxD, 255, 100); 
    background(0, 0, blu);
  
  
    noStroke();
  
    fill(110);
    ellipse(mouseX, height/2, 150);
    
    fill(0);
    ellipse(mouseX-40, height/2+30, 10);
    ellipse(mouseX+40, height/2+30, 10);
  
    stroke(0);
    strokeWeight(5);
    strokeCap(ROUND);
    noFill();
    arc(mouseX, height/2+55, 50, 20, PI, PI*2);  
    
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(windowWidth/2-100, windowHeight/4, 200, 345);
    drawingContext.clip();
  
    noStroke();
    fill(255, 255, 0);
    ellipse(mouseX, height/2, 150);
  
    fill(0);
    ellipse(mouseX-40, height/2+10, 10);
    ellipse(mouseX+40, height/2+10, 10);
  
    stroke(0);
    strokeWeight(5);
    strokeCap(ROUND);
    noFill();
    arc(mouseX, height/2+15, 120, 100, 0, PI);
    
    drawingContext.restore();
    
    noStroke();
    fill(145, 215, 255, 120);
    rect(windowWidth/2-100, windowHeight/4+10, 200, 335, 150, 0, 0, 10);
    fill(30);
    rect(windowWidth/2-100, windowHeight/4+15, 20, 335, 10, 0, 150, 150);
    rect(windowWidth/2-100, windowHeight/4 + 325, 220, 50, 150, 0, 150, 150);
    rect(windowWidth/2-100+200, windowHeight/4+15, 20, 335, 0, 150, 150, 0);
    rect(windowWidth/2-100, windowHeight/4, 220, 50, 150, 150, 0, 0);
    fill(50);
    rect(windowWidth/2-12, windowHeight/4+332.5, 35, 35, 15, 15, 15, 15);
    rect(windowWidth/2-12, windowHeight/4+20, 35, 10, 15, 15, 15, 15);
    
    fill(255);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(32);
    text("it's all fake.", width/2+10, (windowHeight/4)*3+20);
  }

  function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
  }