var canvas;
var gl;

var NumVertices = 36;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var lastMouseX = 0;
var lastMouseY = 0;
var dragging = false;

var axis = 0;
theta = [-6, 72, 0];
theta = [0, 0, 0];
var thetIncrement = 2;

var thetaLoc;

var flag = true;
var heldToRtoate = false;
var cube, rubiksCube;
var x = 0,
  y = 0,
  z = 0;

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // cube = new Cube(gl, program, x, y, z, 1);
  rubiksCube = new RubiksCube(gl, program);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set background to black
  gl.enable(gl.DEPTH_TEST);

  // event listeners for keyboards
  document.addEventListener("keypress", function (event) {
    var key = event.key.toLowerCase();
    switch (key) {
      case "f":
        console.log("The 'F' or 'f' key was pressed");
        axis = xAxis;
        incrementTheta();
        break;
      case "j":
        console.log("The 'J' or 'j' key was pressed");
        axis = yAxis;
        incrementTheta();
        break;
      case "k":
        console.log("The 'K' or 'k' key was pressed");
        axis = zAxis;
        incrementTheta();
        break;
      case "s":
        flag = !flag;
        console.log("The 'S' or 's' key was pressed");
        break;
      case "r":
        thetIncrement *= -1;
        console.log("The 'R' or 'r' key was pressed");
        break;
    }
  });

  //event listeners for buttons

  document.getElementById("xButton").onclick = function () {
    axis = xAxis;
  };
  document.getElementById("yButton").onclick = function () {
    axis = yAxis;
  };
  document.getElementById("zButton").onclick = function () {
    axis = zAxis;
  };
  document.getElementById("ButtonT").onclick = function () {
    flag = !flag;
  };
  document.getElementById("reverse").onclick = function () {
    thetIncrement *= -1;
  };
  document.getElementById("reset").onclick = function () {
    rubiksCube.setTheta([0, 0, 0]);
  };

  document.getElementById("rotateRight").onclick = function () {
    console.log("roate right");
    rubiksCube.rotateRight();
  };
  document.getElementById("rotateUp").onclick = function () {
    console.log("roate up");
    rubiksCube.rotateUp();
  };
  document.getElementById("rotateDown").onclick = function () {
    console.log("roate down");
    rubiksCube.rotateDown();
  };
  document.getElementById("rotateLeft").onclick = function () {
    console.log("roate left");
    rubiksCube.rotateLeft();
  };
  document.getElementById("rotateFront").onclick = function () {
    console.log("roate front");
    rubiksCube.rotateFront();
  };
  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // rubiksCube.setTheta(theta);

  rubiksCube.render();
  gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
  requestAnimFrame(render);
}

function incrementTheta() {
  theta[axis] += thetIncrement;
}

class RubiksCube {
  constructor(gl, program) {
    this.gl = gl;
    this.program = program;
    this.cubes = [];
    this.rubiksPoints = [];
    this.rubiksColors = [];
    this.sideSize = 1; // temporarily should be 1 until fix.

    var red = [1.0, 0.0, 0.0, 1.0];
    var blue = [0.0, 0.0, 1.0, 1.0];
    var green = [0.0, 1.0, 0.0, 1.0];
    var yellow = [1.0, 1.0, 0.0, 1.0];
    var magenta = [1.0, 0.0, 1.0, 1.0];
    var white = [1.0, 1.0, 1.0, 1.0];
    var black = [0.0, 1.0, 1.0, 1.0];

    this.upColor = white;
    this.rightColor = green;
    this.bottomColor = yellow;
    this.leftColor = blue;
    this.frontColor = red;
    this.backColor = magenta;
    this.hidden = black;

    this.initCubes();
    this.initBuffers();
  }
  initBuffers() {
    var cBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, cBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      flatten(this.rubiksColors),
      this.gl.STATIC_DRAW
    );
    var vColor = this.gl.getAttribLocation(this.program, "vColor");
    this.gl.vertexAttribPointer(vColor, 4, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(vColor);

    var vBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      flatten(this.rubiksPoints),
      this.gl.STATIC_DRAW
    );
    var vPosition = this.gl.getAttribLocation(this.program, "vPosition");
    this.gl.vertexAttribPointer(vPosition, 4, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(vPosition);
  }

  // This function is used whenever the order of the cubes differ.
  recompute() {
    this.rubiksPoints = [];
    this.rubiksColors = [];
    this.addAllCubesInfo();
    this.initBuffers();
  }

  setTheta(theta) {
    // this.theta = theta;
    for (let i = 0; i < 26; i++) {
      this.cubes[i].rotate(theta);
    }

    this.recompute();
  }

  initCubes() {
    for (let x = -this.sideSize; x <= this.sideSize; x++) {
      for (let y = -this.sideSize; y <= this.sideSize; y++) {
        for (let z = -this.sideSize; z <= this.sideSize; z++) {
          if (x == 0 && y == 0 && z == 0) continue;
          this.cubes.push(
            new Cube(
              this.gl,
              this.program,
              x / 3.0,
              y / 3.0,
              z / 3.0,
              1.0 / 3.0
            )
          );
        }
      }
    }

    this.setSideColors();

    this.recompute();
  }

  setOffset(offset) {
    for (let i = 0; i < this.rubiksPoints.length; i++) {
      let point = this.rubiksPoints[i];
      // Update each coordinate based on the sign and offset
      point[0] += offset * this.getSign(point[0]);
      point[1] += offset * this.getSign(point[1]);
      point[2] += offset * this.getSign(point[2]);

      this.rubiksPoints[i] = point;
    }
    this.recompute();
  }

  getSign(number) {
    return number > 0 ? 1 : number < 0 ? -1 : 0;
  }

  setSideColors() {
    // whole left part:
    // up, right, bottom, left, front, back
    this.cubes[0].setColors(
      this.hidden,
      this.hidden,
      this.bottomColor,
      this.leftColor,
      this.frontColor,
      this.hidden
    );
    this.cubes[1].setColors(
      this.hidden,
      this.hidden,
      this.bottomColor,
      this.leftColor,
      this.hidden,
      this.hidden
    );
    this.cubes[2].setColors(
      this.hidden,
      this.hidden,
      this.bottomColor,
      this.leftColor,
      this.hidden,
      this.backColor
    );
    // up, right, bottom, left, front, back
    this.cubes[3].setColors(
      this.hidden,
      this.hidden,
      this.hidden,
      this.leftColor,
      this.frontColor,
      this.hidden
    );
    this.cubes[4].setColors(
      this.hidden,
      this.hidden,
      this.hidden,
      this.leftColor,
      this.hidden,
      this.hidden
    );
    this.cubes[5].setColors(
      this.hidden,
      this.hidden,
      this.hidden,
      this.leftColor,
      this.hidden,
      this.backColor
    );

    // up, right, bottom, left, front, back
    this.cubes[6].setColors(
      this.upColor,
      this.hidden,
      this.hidden,
      this.leftColor,
      this.frontColor,
      this.hidden
    );
    this.cubes[7].setColors(
      this.upColor,
      this.hidden,
      this.hidden,
      this.leftColor,
      this.hidden,
      this.hidden
    );
    this.cubes[8].setColors(
      this.upColor,
      this.hidden,
      this.hidden,
      this.leftColor,
      this.hidden,
      this.backColor
    );

    // Whole middle part:
    // up, right, bottom, left, front, back
    this.cubes[9].setColors(
      this.hidden,
      this.hidden,
      this.bottomColor,
      this.hideen,
      this.frontColor,
      this.hidden
    );
    this.cubes[10].setColors(
      this.hidden,
      this.hidden,
      this.bottomColor,
      this.hidden,
      this.hidden,
      this.hidden
    );
    this.cubes[11].setColors(
      this.hidden,
      this.hidden,
      this.bottomColor,
      this.hidden,
      this.hidden,
      this.backColor
    );
    // up, right, bottom, left, front, back
    this.cubes[12].setColors(
      this.hidden,
      this.hidden,
      this.hidden,
      this.hidden,
      this.frontColor,
      this.hidden
    );
    // center cube is not rendered.
    // this.cubes[13].setColors(this.hidden, this.hidden, this.hidden, this.hidden, this.hidden, this.hidden);
    this.cubes[13].setColors(
      this.hidden,
      this.hidden,
      this.hidden,
      this.hidden,
      this.frontColor,
      this.backColor
    );

    // up, right, bottom, left, front, back
    this.cubes[14].setColors(
      this.upColor,
      this.hidden,
      this.hidden,
      this.hidden,
      this.frontColor,
      this.hidden
    );
    this.cubes[15].setColors(
      this.upColor,
      this.hidden,
      this.hidden,
      this.hidden,
      this.hidden,
      this.hidden
    );
    this.cubes[16].setColors(
      this.upColor,
      this.hidden,
      this.hidden,
      this.hidden,
      this.hidden,
      this.backColor
    );

    // whole right part:
    // up, right, bottom, left, front, back
    this.cubes[17].setColors(
      this.hidden,
      this.rightColor,
      this.bottomColor,
      this.hidden,
      this.frontColor,
      this.hidden
    );
    this.cubes[18].setColors(
      this.hidden,
      this.rightColor,
      this.bottomColor,
      this.hidden,
      this.hidden,
      this.hidden
    );
    this.cubes[19].setColors(
      this.hidden,
      this.rightColor,
      this.bottomColor,
      this.hidden,
      this.hidden,
      this.backColor
    );
    // up, right, bottom, left, front, back
    this.cubes[20].setColors(
      this.hidden,
      this.rightColor,
      this.hidden,
      this.hidden,
      this.frontColor,
      this.hidden
    );
    this.cubes[21].setColors(
      this.hidden,
      this.rightColor,
      this.hidden,
      this.hidden,
      this.hidden,
      this.hidden
    );
    this.cubes[22].setColors(
      this.hidden,
      this.rightColor,
      this.hidden,
      this.hidden,
      this.hidden,
      this.backColor
    );
    // up, right, bottom, left, front, back
    this.cubes[23].setColors(
      this.upColor,
      this.rightColor,
      this.hidden,
      this.hidden,
      this.frontColor,
      this.hidden
    );
    this.cubes[24].setColors(
      this.upColor,
      this.rightColor,
      this.hidden,
      this.hidden,
      this.hidden,
      this.hidden
    );
    this.cubes[25].setColors(
      this.upColor,
      this.rightColor,
      this.hidden,
      this.hidden,
      this.hidden,
      this.backColor
    );
  }

  addAllCubesInfo() {
    // Adding cubes information.
    for (let i = 0; i < 26; i++) {
      this.addInfo(this.cubes[i]);
    }
  }

  addInfo(cube) {
    var info = cube.getInfo();
    // Concatenate the arrays
    this.rubiksPoints = this.rubiksPoints.concat(info[0]);
    this.rubiksColors = this.rubiksColors.concat(info[1]);
  }

  updateCubePositionsAfterRotation(
    needToBeRotated1,
    needToBeRotated2,
    rotationFlag
  ) {
    if (!rotationFlag) {
      needToBeRotated1.reverse();
      needToBeRotated2.reverse();
    }
    var tempCube1 = this.cubes[needToBeRotated1[3]];
    var tempCube2 = this.cubes[needToBeRotated2[3]];
    for (var i = 3; i >= 1; i--) {
      this.cubes[needToBeRotated1[i]] = this.cubes[needToBeRotated1[i - 1]];
      this.cubes[needToBeRotated2[i]] = this.cubes[needToBeRotated2[i - 1]];
    }
    this.cubes[needToBeRotated1[0]] = tempCube1;
    this.cubes[needToBeRotated2[0]] = tempCube2;
  }

  rotateRight(isClockwise = 1, theta = [90, 0, 0]) {
    //Select all cubes need to be rotated
    var edgesArray = [18, 20, 24, 22]; //for 2 colored cubes
    var cornersArray = [17, 23, 25, 19]; //for 3 colored cubes (corners)
    var center = 21; //need to rotate texture

    for (let i = 0; i < 4; i++) {
      this.cubes[edgesArray[i]].rotate(theta);
      this.cubes[cornersArray[i]].rotate(theta);
    }
    this.cubes[center].rotate(theta);

    //fix positions of cubes after rotation
    this.updateCubePositionsAfterRotation(
      edgesArray,
      cornersArray,
      isClockwise
    );

    this.recompute();
  }

  rotateUp(isClockwise = 1, theta = [0, 90, 0]) {
    //Select all cubes need to be rotated
    var edgesArray = [14, 7, 16, 24];
    // edgesArray = [7, 14, 24, 16];
    var cornersArray = [23, 6, 8, 25];
    // cornersArray = [6, 23, 25, 8];
    var center = 15;

    //TODO rotate all cubes w.r.t x direction
    for (let i = 0; i < 4; i++) {
      this.cubes[edgesArray[i]].rotate(theta);
      this.cubes[cornersArray[i]].rotate(theta);
    }
    this.cubes[center].rotate(theta);

    //fix positions of cubes after rotation
    this.updateCubePositionsAfterRotation(
      edgesArray,
      cornersArray,
      isClockwise
    );
    this.recompute();

    console.log(this.cubes);
  }

  rotateDown(isClockwise = 1, theta = [0, 90, 0]) {
    //Select all cubes need to be rotated
    var edgesArray = [1, 9, 18, 11];
    var cornersArray = [0, 17, 19, 2];
    var center = 10;

    //TODO rotate all cubes w.r.t x direction

    for (let i = 0; i < 4; i++) {
      this.cubes[edgesArray[i]].rotate(theta);
      this.cubes[cornersArray[i]].rotate(theta);
    }
    this.cubes[center].rotate(theta);

    //fix positions of cubes after rotation
    this.updateCubePositionsAfterRotation(
      edgesArray,
      cornersArray,
      isClockwise
    );
    this.recompute();
  }

  rotateLeft(isClockwise = 1, theta = [90, 0, 0]) {
    //Select all cubes need to be rotated
    var edgesArray = [3, 1, 5, 7];
    var cornersArray = [6, 0, 2, 8];
    var center = 4;

    //TODO rotate all cubes w.r.t x direction

    for (let i = 0; i < 4; i++) {
      this.cubes[edgesArray[i]].rotate(theta);
      this.cubes[cornersArray[i]].rotate(theta);
    }
    this.cubes[center].rotate(theta);

    //fix positions of cubes after rotation
    this.updateCubePositionsAfterRotation(
      edgesArray,
      cornersArray,
      isClockwise
    );
    this.recompute();
    console.log(this.cubes);
  }

  rotateFront(isClockwise = 1, theta = [0, 0, 90]) {
    //Select all cubes need to be rotated
    var edgesArray = [20, 9, 3, 14];
    var cornersArray = [23, 17, 0, 6];
    var center = 12;

    //TODO rotate all cubes w.r.t x direction

    for (let i = 0; i < 4; i++) {
      this.cubes[edgesArray[i]].rotate(theta);
      this.cubes[cornersArray[i]].rotate(theta);
    }
    this.cubes[center].rotate(theta);

    //fix positions of cubes after rotation
    this.updateCubePositionsAfterRotation(
      edgesArray,
      cornersArray,
      isClockwise
    );
    this.recompute();
  }

  rotateBack(isClockwise = 1, theta = [0, 0, 90]) {
    //Select all cubes need to be rotated
    var edgesArray = [16, 5, 11, 22];
    var cornersArray = [25, 8, 2, 19];
    var center = 13;

    //TODO rotate all cubes w.r.t x direction
    for (let i = 0; i < 4; i++) {
      this.cubes[edgesArray[i]].rotate(theta);
      this.cubes[cornersArray[i]].rotate(theta);
    }
    this.cubes[center].rotate(theta);

    //fix positions of cubes after rotation
    this.updateCubePositionsAfterRotation(
      edgesArray,
      cornersArray,
      isClockwise
    );
    this.recompute();
  }

  rotateMiddleRight(isClockwise = 1, theta = [90, 0, 0]) {
    //Select all cubes need to be rotated
    var centersArray = [12, 15, 13, 10];
    var cornersArray = [9, 14, 16, 11];

    //TODO rotate all cubes w.r.t x direction

    for (let i = 0; i < 4; i++) {
      this.cubes[edgesArray[i]].rotate(theta);
      this.cubes[cornersArray[i]].rotate(theta);
    }

    //fix positions of cubes after rotation
    this.updateCubePositionsAfterRotation(
      edgesArray,
      cornersArray,
      isClockwise
    );
    this.recompute();
  }

  rotateMiddleFront(isClockwise = 1, theta = [0, 0, 90]) {
    //Select all cubes need to be rotated
    var centersArray = [4, 15, 21, 10];
    var cornersArray = [1, 7, 24, 18];

    //TODO rotate all cubes w.r.t x direction

    for (let i = 0; i < 4; i++) {
      this.cubes[edgesArray[i]].rotate(theta);
      this.cubes[cornersArray[i]].rotate(theta);
    }

    //fix positions of cubes after rotation
    this.updateCubePositionsAfterRotation(
      edgesArray,
      cornersArray,
      isClockwise
    );
    this.recompute();
  }

  rotateMiddleUp(isClockwise = 1, theta = [0, 90, 0]) {
    //Select all cubes need to be rotated
    var centersArray = [12, 4, 13, 21];
    var cornersArray = [3, 5, 22, 20];

    //TODO rotate all cubes w.r.t x direction

    for (let i = 0; i < 4; i++) {
      this.cubes[edgesArray[i]].rotate(theta);
      this.cubes[cornersArray[i]].rotate(theta);
    }

    //fix positions of cubes after rotation
    this.updateCubePositionsAfterRotation(
      edgesArray,
      cornersArray,
      isClockwise
    );
    this.recompute();
  }

  render() {
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 36 * this.cubes.length);
  }
}
