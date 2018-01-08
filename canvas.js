var canvas = document.querySelector('canvas');

var w = window.innerWidth;
var h = window.innerHeight;
canvas.width = w;
canvas.height = h;

var c = canvas.getContext('2d');

var mouse = {
  x: undefined,
  y: undefined
}

//figure out if day or night, roughly
var d = new Date();
var time = d.getHours();
console.log(time);
if (time > 6 && time < 19) {
  var day = true;
}
else {
  var day = false;
}


// listener for browser Resize
window.addEventListener('resize', function () {
  var w = window.innerWidth;
  var h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  init();
})

// listener for mouse movement
window.addEventListener('mousemove', function (event) {
  mouse.x = event.x;
  mouse.y = event.y;
})

// x and y are the coordinates of the center of the rounded rectangle
function RoundedRect(x,y,width,height,r) {
  this.x = x;
  this.y = y;
  this.w = width;
  this.h = height;
  this.r = r;

  //figure out where to begin
  this.x0 = this.x - (this.w * 0.5);
  this.y0 = this.y - (this.h * 0.5) + this.r;

  // describe path of outline
  this.path = function () {
    var xcur = this.x0;
    var ycur = this.y0;
    c.beginPath();
    c.moveTo(xcur, ycur);
    ycur -= this.r;
    c.quadraticCurveTo(xcur, ycur, xcur + this.r, ycur);
    xcur += this.w;
    c.lineTo(xcur - this.r, ycur);
    c.quadraticCurveTo(xcur, ycur, xcur, ycur + this.r);
    ycur += this.h;
    c.lineTo(xcur, ycur - this.r);
    c.quadraticCurveTo(xcur, ycur, xcur - this.r, ycur);
    xcur -= this.w;
    c.lineTo(xcur + this.r, ycur);
    c.quadraticCurveTo(xcur, ycur, xcur, ycur - this.r);
    ycur -= this.h - this.r;
    c.lineTo(xcur, ycur);
    c.closePath();
  }

  // create a filled rounded rectangle
  this.fill = function(color) {
    this.path();
    c.fillStyle = color;
    c.fill();
  }

  // create outline of rounded rectangle
  this.stroke = function (color) {
    this.path();
    c.strokeStyle = color;
    c.stroke()
  }
}



// circle object
function Circle(x, y, dx, dy, r, color, max, min) {
  this.x = x;
  this.y = y;
  this.dx = dx;
  this.dy = dy;
  this.r = r;
  this.color = color;
  this.max = max;
  this.min = min;

  // draw circle
  this.draw = function() {
    c.beginPath();
    c.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    c.strokeStyle = this.color;
    c.stroke();
  }

  // use to animate circle
  this.update = function() {
    if (this.x + this.r > w || this.x - this.r < 0) {
      this.dx = -this.dx;
    }
    if (this.y + this.r > h || this.y - this.r < 0) {
      this.dy = -this.dy;
    }

    this.x += this.dx;
    this.y += this.dy;

    // circles touching mouse grow
    if (Math.abs(mouse.x - this.x) < Math.max(this.r, 10)
            && Math.abs(mouse.y - this.y) < Math.max(this.r, 10)) {
        if (this.r < this.max) {
          this.r += 1;
        }
    }
    // slowly shrink back to original size afterwards
    else {
      if (this.r > this.min + 0.01) {
        this.r -= 0.01;
      }
    }

    this.draw();
  }
}

var circles = [];

function init() {
  circles = [];

  // generate random circles to animate and add to array
  for (var i = 0; i < 600; i++) {
    var x = Math.random() * w;
    var y = Math.random() * h;

    var dx = (Math.random() - 0.5) * 5;
    var dy = (Math.random() - 0.5) * 5;

    var r = Math.random()*4 + 1;

    // day time color scheme
    if (day) {
      var colors = ["white", "yellow", "#87FFE5"];
    }
    //night time color scheme
    else {
      var colors = ["#2B4666", "#88B5D6", "#B8DBF2"];
    }

    // choose color randomly
    var col = Math.random() * 3;
    var ind = Math.floor(col);
    var color = colors[ind];

    // choose max randomly
    var maxes = [30,40,50];
    var mx = Math.random () * 3;
    var max = maxes[Math.floor(mx)];

    var min = r;

    // add to array
    circles.push(new Circle(x,y,dx,dy,r, color, max, min));
  }

}



function animate () {
  requestAnimationFrame(animate);
  c.clearRect(0,0,w,h);

  // background
  if (!day) {
    c.fillStyle = "#1A2739";
  }
  else {
    c.fillStyle = "#F59A7B";
  }
  c.fillRect(0,0,w,h);

  // animate circles
  for (var i = 0; i < circles.length; i++){
    circles[i].update();
  }

  // box around date
  var box = new RoundedRect(w/2,h/2,400,100,15);
  box.fill("white");

  //date
  c.font = "small-caps bold 50px bookman";
  c.fillStyle = "grey";
  var d = new Date();
  c.textAlign="center";
  c.fillText(d.toDateString(), w/2, h/2+15);
}

init();
animate();
