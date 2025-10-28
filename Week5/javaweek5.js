console.log("theMessage");

const total = 10;
var centerImg = document.getElementById("thePosters");
var prevImg = document.getElementById("prevPoster");
var nextImg = document.getElementById("nextPoster");
var button = document.getElementById("potato");
let index = 1;

var base = "";


button.style.border = "2px solid black";

function reset(n){
    if(n < 1){
        return total;
    }
    if(n > total){
        return 1;
    }
    return n;
}

function setImages() {
    const prevIndex = reset(index - 1);
    const nextIndex = reset(index + 1);
  
    centerImg.src = `p${index}.jpg`;
    prevImg.src = `p${prevIndex}.jpg`;
    nextImg.src = `p${nextIndex}.jpg`;
}
  
button.addEventListener("click", () => {
    centerImg.style.opacity = 0;
  
    setTimeout(() => {
      index = reset(index + 1);
      setImages();
      centerImg.style.opacity = 1;
    }, 250);
});
 
setImages();

