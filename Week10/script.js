const btn = document.getElementById("runaway");
let x = window.innerWidth / 2;
let y = window.innerHeight / 2;
btn.style.left = x + "px";
btn.style.top = y + "px";
document.addEventListener("mousemove", function(e) {
    let mouseX = e.clientX;
    let mouseY = e.clientY;
    if (mouseX > x - 150 && mouseX < x + 150 &&
        mouseY > y - 150 && mouseY < y + 150) {

        if (mouseX < x) x += 40;
        if (mouseX > x) x -= 40;
        if (mouseY < y) y += 40;
        if (mouseY > y) y -= 40;
        if (x < 0 || x > window.innerWidth - btn.offsetWidth ||
            y < 0 || y > window.innerHeight - btn.offsetHeight) {
    
            x = Math.random() * (window.innerWidth - btn.offsetWidth);
            y = Math.random() * (window.innerHeight - btn.offsetHeight);
        }
    

        btn.style.left = x + "px";
        btn.style.top = y + "px";
    }
});
