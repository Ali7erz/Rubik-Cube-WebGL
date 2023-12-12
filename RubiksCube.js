var canvas;
var gl;

var NumVertices = 36;

var lastMouseX = 0;
var lastMouseY = 0;
var dragging = false;
var cameraXrot = -25;
var cameraYrot = -15;
var modelView;

const RIGHT = 0;
const UP = 1;
const LEFT = 2;
const DOWN = 3;
const FRONT = 4;
const BACK = 5;
const MIDDLE_FRONT = 6;
const MIDDLE_RIGHT = 7;
const MIDDLE_UP = 8;

const ALLUP = 9;
const ALLRIGHT = 10;
const ALLLEFT = 11;
const ALLDOWN = 12;

var flag = true;
var heldToRtoate = false;
var cube, rubiksCube;
var x = 0,
  y = 0,
  z = 0;

var direction = 1;
var isRotateing = false;

var isAnimating = true;
var toggleBack = false;
const ANIMATION_SPEED = 10;

var thetIncrement = ANIMATION_SPEED;
var currentRotatingDegree = 0;
var rotateFun;

var isExploding = false;
var currentOffset = 0;
const OFFSET = 0.2;
const OFFSET_INCREMENTER = 0.035;
var offset_incrementer = -OFFSET_INCREMENTER;
var offset_acc = -OFFSET_INCREMENTER / 10;

let shuffleList = [];

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

  canvas.addEventListener("mousedown", function (event) {
    dragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  });

  canvas.addEventListener("mouseup", function () {
    dragging = false;
  });

  canvas.addEventListener("mousemove", function (event) {
    if (dragging) {
      var deltaX = event.clientX - lastMouseX;
      var deltaY = event.clientY - lastMouseY;

      if (cameraYrot - deltaY / 5 <= 90 && cameraYrot - deltaY / 5 >= -90) {
        cameraYrot -= deltaY / 5; // Update x based on vertical mouse movement

        if (cameraYrot >= 89) {
          twist(ALLUP, false);
          cameraYrot = 0;
          toggleBack = true; // To get the previous value of isAnimating.
        } else if (cameraYrot <= -89) {
          twist(ALLDOWN, false);
          cameraYrot = 0;
          toggleBack = true;
        }
      }

      if (cameraXrot - deltaX / 5 <= 90 && cameraXrot - deltaX / 5 >= -90) {
        cameraXrot -= deltaX / 5; // Update y based on horizontal mouse movement
        if (cameraXrot >= 89) {
          twist(ALLLEFT, false);
          cameraXrot = 0;
          toggleBack = true;
        } else if (cameraXrot <= -89) {
          twist(ALLRIGHT, false);
          cameraXrot = 0;
          toggleBack = true;
        }
      }

      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    }
  });
  // event listeners for keyboards

  document.addEventListener("keydown", function (event) {
    var key = event.key.toLowerCase();

    switch (key) {
      case "shift":
        if (!isRotateing) direction *= -1;
        break;
      case "f":
        console.log("rotate right " + direction);
        twist(FRONT, isAnimating);
        break;
      case "u":
        console.log("rotate up " + direction);
        twist(UP, isAnimating);
        break;
      case "l":
        console.log("rotate left " + direction);
        twist(LEFT, isAnimating);
        break;
      case "r":
        console.log("rotate right " + direction);
        twist(RIGHT, isAnimating);
        break;
      case "d":
        console.log("rotate down " + direction);
        twist(DOWN, isAnimating);
        break;
      case "b":
        console.log("rotate back " + direction);
        twist(BACK, isAnimating);
        break;
      case "arrowup":
        console.log("arrow up");
        twist(ALLUP, isAnimating);

        break;
      case "arrowdown":
        console.log("arrow down");
        twist(ALLDOWN, isAnimating);
        break;
      case "arrowleft":
        console.log("arrow left");
        twist(ALLLEFT, isAnimating);
        break;
      case "arrowright":
        console.log("arrow right");
        twist(ALLRIGHT, isAnimating);
        break;
    }
  });

  //event listeners for buttons
  document.getElementById("reverse").onclick = function () {
    direction *= -1;
  };
  document.getElementById("reset").onclick = function () {
    rubiksCube = new RubiksCube(gl, program);
  };
  document.getElementById("rotateRight").onclick = function () {
    console.log("roate right " + direction);
    twist(RIGHT, isAnimating);
  };
  document.getElementById("rotateUp").onclick = function () {
    console.log("roate up " + direction);
    twist(UP, isAnimating);
  };
  document.getElementById("rotateDown").onclick = function () {
    console.log("roate down " + direction);
    twist(DOWN, isAnimating);
  };
  document.getElementById("rotateLeft").onclick = function () {
    console.log("roate left " + direction);
    twist(LEFT, isAnimating);
  };
  document.getElementById("rotateFront").onclick = function () {
    console.log("roate front " + direction);
    twist(FRONT, isAnimating);
  };
  document.getElementById("shufffle").onclick = function () {
    console.log("shufffle " + direction);

    for (let i = 0; i < 10; i++) {
      let rot = Math.floor(Math.random() * 13);
      shuffleList.push(rot);
    }
  };
  document.getElementById("rotateFront").onclick = function () {
    console.log("roate front " + direction);
    twist(FRONT, isAnimating);
  };
  document.getElementById("animation").onclick = function () {
    console.log("animation " + isAnimating + " to " + !isAnimating);
    isAnimating = !isAnimating;
  };
  document.getElementById("explode").onclick = function () {
    console.log("explode " + direction);

    if (!isExploding && !isRotateing) {
      offset_incrementer *= -1;
      offset_acc *= -1;
      isExploding = true;
    }
  };

  render();
};

function twist(num, animation) {
  if (!isRotateing && !isExploding) {
    isRotateing = true;
    rotateFun = num;
    isAnimating = animation;
  }
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (!isAnimating) {
    thetIncrement = 90;
  } else {
    thetIncrement = ANIMATION_SPEED;
  }

  if (!isRotateing && !isExploding && shuffleList.length > 0) {
    console.log(shuffleList);
    direction = Math.floor(Math.random() * 1) - 1;
    twist(shuffleList.shift(), isAnimating);
  }

  if (isRotateing) {
    currentRotatingDegree += thetIncrement;
    if (currentRotatingDegree == 90) {
      currentRotatingDegree = 0;
      isRotateing = false;
    }

    switch (rotateFun) {
      case RIGHT:
        rubiksCube.rotateRight(direction, thetIncrement, !isRotateing);
        break;
      case UP:
        rubiksCube.rotateUp(direction, thetIncrement, !isRotateing);
        break;
      case LEFT:
        rubiksCube.rotateLeft(direction, thetIncrement, !isRotateing);
        break;
      case DOWN:
        rubiksCube.rotateDown(direction, thetIncrement, !isRotateing);
        break;
      case FRONT:
        rubiksCube.rotateFront(direction, thetIncrement, !isRotateing);
        break;
      case MIDDLE_FRONT:
        rubiksCube.rotateMiddleFront(direction, thetIncrement, !isRotateing);
        break;
      case MIDDLE_RIGHT:
        rubiksCube.rotateMiddleRight(direction, thetIncrement, !isRotateing);
        break;
      case MIDDLE_UP:
        rubiksCube.rotateMiddleUp(direction, thetIncrement, !isRotateing);
        break;
      case BACK:
        rubiksCube.rotateBack(direction, thetIncrement, !isRotateing);
        break;
      case ALLUP:
        rubiksCube.rotateMiddleRight(1, thetIncrement, !isRotateing);
        rubiksCube.rotateRight(1, thetIncrement, !isRotateing);
        rubiksCube.rotateLeft(-1, thetIncrement, !isRotateing);
        break;
      case ALLRIGHT:
        rubiksCube.rotateUp(-1, thetIncrement, !isRotateing);
        rubiksCube.rotateMiddleUp(-1, thetIncrement, !isRotateing);
        rubiksCube.rotateDown(1, thetIncrement, !isRotateing);
        break;
      case ALLLEFT:
        rubiksCube.rotateUp(1, thetIncrement, !isRotateing);
        rubiksCube.rotateMiddleUp(1, thetIncrement, !isRotateing);
        rubiksCube.rotateDown(-1, thetIncrement, !isRotateing);
        break;
      case ALLDOWN:
        rubiksCube.rotateMiddleRight(-1, thetIncrement, !isRotateing);
        rubiksCube.rotateRight(-1, thetIncrement, !isRotateing);
        rubiksCube.rotateLeft(1, thetIncrement, !isRotateing);
        break;
    }
    if (toggleBack) {
      isAnimating = !isAnimating;
      toggleBack = false;
    }
  }

  if (isExploding) {
    if (
      (offset_incrementer > 0 && currentOffset > OFFSET) ||
      (offset_incrementer < 0 && currentOffset <= 0)
    ) {
      isExploding = false;
      if (offset_incrementer > 0) {
        offset_incrementer = OFFSET_INCREMENTER;
      } else {
        offset_incrementer = -OFFSET_INCREMENTER;
      }
    } else {
      console.log("Incremented");
      rubiksCube.setDistances(offset_incrementer);
      currentOffset += offset_incrementer;
      offset_incrementer += offset_acc;
    }
  }
  document.getElementById("colorCenter").innerText =
    rubiksCube.getColorCenter();

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
    // For texture and lighting.
    this.rubiksNormals = [];
    this.rubiksTexCoordsArray = [];

    this.sideSize = 1; // temporarily should be 1 until fix.

    var red = [1.0, 0.0, 0.0, 1.0];
    var blue = [0.0, 0.0, 1.0, 1.0];
    var green = [0.0, 1.0, 0.0, 1.0];
    var yellow = [1.0, 1.0, 0.0, 1.0];
    var magenta = [0.8, 0.0, 0.7, 1.0];
    // var orange = [1.0, 0.65, 0.0, 1.0];
    var white = [1.0, 1.0, 1.0, 1.0];
    var black = [0.0, 0.0, 0.0, 1.0];

    this.upColor = white;
    this.rightColor = red;
    this.bottomColor = yellow;
    this.leftColor = magenta;
    this.frontColor = green;
    this.backColor = blue;
    this.hidden = black;

    this.initCubes();
    this.initBuffers();
  }
  initBuffers() {
    this.gl.viewport(0, 0, canvas.width, canvas.height);
    // this.gl.clearColor(0.35, 0.35, 0.35, 1.0); // Set background to black
    this.gl.enable(this.gl.DEPTH_TEST);

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

    var nBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, nBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      flatten(this.rubiksNormals),
      gl.STATIC_DRAW
    );

    var vNormal = this.gl.getAttribLocation(this.program, "vNormal");
    this.gl.vertexAttribPointer(vNormal, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(vNormal);

    var tBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      flatten(this.rubiksTexCoordsArray),
      this.gl.STATIC_DRAW
    );

    var vTexCoord = this.gl.getAttribLocation(this.program, "vTexCoord");
    this.gl.vertexAttribPointer(vTexCoord, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(vTexCoord);

    var image = document.getElementById("texImage");
    this.configureTexture(image);

    var viewerPos = vec3(0.0, 0.0, -20.0);

    var projection = ortho(-1, 1, -1, 1, 100, -100);

    var lightPosition = vec4(-1.0, 1.0, 0.0, 0.0);
    var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0);
    var lightDiffuse = vec4(0.8, 0.8, 0.8, 1.0);
    var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

    var materialAmbient = vec4(0.5, 0.5, 0.5, 1.0);
    var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
    var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
    var materialShininess = 100.0;

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    this.gl.uniform4fv(
      this.gl.getUniformLocation(this.program, "ambientProduct"),
      flatten(ambientProduct)
    );
    this.gl.uniform4fv(
      this.gl.getUniformLocation(this.program, "diffuseProduct"),
      flatten(diffuseProduct)
    );
    this.gl.uniform4fv(
      this.gl.getUniformLocation(this.program, "specularProduct"),
      flatten(specularProduct)
    );
    this.gl.uniform4fv(
      this.gl.getUniformLocation(this.program, "lightPosition"),
      flatten(lightPosition)
    );

    this.gl.uniform1f(
      this.gl.getUniformLocation(this.program, "shininess"),
      materialShininess
    );

    this.gl.uniformMatrix4fv(
      this.gl.getUniformLocation(this.program, "projectionMatrix"),
      false,
      flatten(projection)
    );
  }

  configureTexture(image) {
    var texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGB,
      this.gl.RGB,
      this.gl.UNSIGNED_BYTE,
      image
    );
    if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    } else {
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_S,
        this.gl.CLAMP_TO_EDGE
      );
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_T,
        this.gl.CLAMP_TO_EDGE
      );
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MIN_FILTER,
        this.gl.LINEAR
      );
    }
    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "texture"), 0);
  }

  getColorCenter() {
    var i = this.cubes[12].id;

    switch (i) {
      case 12:
        return "Green";
      case 4:
        return "Magenta";
      case 10:
        return "Yellow";
      case 13:
        return "Blue";
      case 15:
        return "White";
      case 21:
        return "Red";
      default:
        return "Black";
    }
  }

  isPowerOf2(value) {
    return (value & (value - 1)) === 0;
  }

  // This function is used whenever the order of the cubes differ.
  recompute() {
    // console.log(this.cubes);
    this.rubiksPoints = [];
    this.rubiksColors = [];

    this.rubiksNormals = [];
    this.rubiksTexCoordsArray = [];
    this.addAllCubesInfo();
    this.initBuffers();
  }

  setTheta(theta) {
    // this.theta = theta;
    for (let i = 0; i < 26; i++) {
      this.cubes[i].rotateCube(theta);
    }

    this.recompute();
  }

  initCubes() {
    let counter = 0;
    for (let x = -this.sideSize; x <= this.sideSize; x++) {
      for (let y = -this.sideSize; y <= this.sideSize; y++) {
        for (let z = -this.sideSize; z <= this.sideSize; z++) {
          if (x == 0 && y == 0 && z == 0) continue;
          this.cubes.push(
            new Cube(
              this.gl,
              this.program,
              x / 3.0 + 0.01 * x,
              y / 3.0 + 0.01 * y,
              z / 3.0 + 0.01 * z,
              1.0 / 3.0,
              counter
            )
          );
          counter++;
        }
      }
    }

    this.setSideColors();

    this.recompute();
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
      this.hidden,
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
      this.hidden,
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

  setDistances(offset) {
    let i = 0;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x == 0 && y == 0 && z == 0) continue;
          this.cubes[i].setOffset(offset * x, offset * y, offset * z);
          i++;
        }
      }
    }

    this.recompute();
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

    this.rubiksNormals = this.rubiksNormals.concat(info[2]);
    this.rubiksTexCoordsArray = this.rubiksTexCoordsArray.concat(info[3]);
  }

  updateCubePositionsAfterRotation(
    needToBeRotated1,
    needToBeRotated2,
    rotationFlag
  ) {
    if (rotationFlag == -1) {
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

    this.recompute();
  }

  rotateRight(isClockwise = 1, theta = 90, changeOrder = true) {
    //Select all cubes need to be rotated
    var edgesArray = [18, 20, 24, 22]; //for 2 colored cubes
    var cornersArray = [17, 23, 25, 19]; //for 3 colored cubes (corners)
    var center = 21; //need to rotate texture

    let thetaLocal = [theta * isClockwise, 0, 0];

    for (let i = 0; i < 4; i++) {
      this.cubes[edgesArray[i]].rotateCube(thetaLocal);
      this.cubes[cornersArray[i]].rotateCube(thetaLocal);
    }
    this.cubes[center].rotateCube(thetaLocal);

    //fix positions of cubes after rotation
    if (changeOrder) {
      this.updateCubePositionsAfterRotation(
        edgesArray,
        cornersArray,
        isClockwise
      );
    }

    this.recompute();
  }

  rotateUp(isClockwise = 1, theta = 90, changeOrder = true) {
    //Select all cubes need to be rotated
    var edgesArray = [14, 7, 16, 24];
    // edgesArray = [7, 14, 24, 16];
    var cornersArray = [23, 6, 8, 25];
    // cornersArray = [6, 23, 25, 8];
    var center = 15;

    let thetaLocal = [0, theta * isClockwise, 0];

    for (let i = 0; i < 4; i++) {
      this.cubes[edgesArray[i]].rotateCube(thetaLocal);
      this.cubes[cornersArray[i]].rotateCube(thetaLocal);
    }
    this.cubes[center].rotateCube(thetaLocal);

    //fix positions of cubes after rotation
    if (changeOrder) {
      this.updateCubePositionsAfterRotation(
        edgesArray,
        cornersArray,
        isClockwise
      );
    }

    this.recompute();
  }

  rotateDown(isClockwise = 1, theta = -90, changeOrder = true) {
    //Select all cubes need to be rotated
    var edgesArray = [1, 9, 18, 11];
    var cornersArray = [0, 17, 19, 2];
    var center = 10;

    //TODO rotate all cubes w.r.t x direction

    let thetaLocal = [0, theta * isClockwise * -1, 0];

    for (let i = 0; i < 4; i++) {
      this.cubes[edgesArray[i]].rotateCube(thetaLocal);
      this.cubes[cornersArray[i]].rotateCube(thetaLocal);
    }
    this.cubes[center].rotateCube(thetaLocal);

    //fix positions of cubes after rotation
    if (changeOrder) {
      this.updateCubePositionsAfterRotation(
        edgesArray,
        cornersArray,
        isClockwise
      );
    }

    this.recompute();
  }

  rotateLeft(isClockwise = 1, theta = -90, changeOrder = true) {
    //Select all cubes need to be rotated
    var edgesArray = [3, 1, 5, 7];
    var cornersArray = [6, 0, 2, 8];
    var center = 4;

    //TODO rotate all cubes w.r.t x direction

    let thetaLocal = [theta * isClockwise * -1, 0, 0];

    for (let i = 0; i < 4; i++) {
      this.cubes[edgesArray[i]].rotateCube(thetaLocal);
      this.cubes[cornersArray[i]].rotateCube(thetaLocal);
    }
    this.cubes[center].rotateCube(thetaLocal);

    //fix positions of cubes after rotation
    if (changeOrder) {
      this.updateCubePositionsAfterRotation(
        edgesArray,
        cornersArray,
        isClockwise
      );
    }

    this.recompute();
  }

  rotateFront(isClockwise = 1, theta = -90, changeOrder = true) {
    //Select all cubes need to be rotated
    var edgesArray = [20, 9, 3, 14];
    var cornersArray = [23, 17, 0, 6];
    var center = 12;

    //TODO rotate all cubes w.r.t x direction

    let thetaLocal = [0, 0, theta * isClockwise * -1];

    for (let i = 0; i < 4; i++) {
      this.cubes[edgesArray[i]].rotateCube(thetaLocal);
      this.cubes[cornersArray[i]].rotateCube(thetaLocal);
    }
    this.cubes[center].rotateCube(thetaLocal);

    //fix positions of cubes after rotation
    if (changeOrder) {
      this.updateCubePositionsAfterRotation(
        edgesArray,
        cornersArray,
        isClockwise
      );
    }

    this.recompute();
  }

  rotateBack(isClockwise = 1, theta = 90, changeOrder = true) {
    //Select all cubes need to be rotated
    var edgesArray = [16, 5, 11, 22];
    var cornersArray = [25, 8, 2, 19];
    var center = 13;

    //TODO rotate all cubes w.r.t x direction
    let thetaLocal = [0, 0, theta * isClockwise];

    for (let i = 0; i < 4; i++) {
      this.cubes[edgesArray[i]].rotateCube(thetaLocal);
      this.cubes[cornersArray[i]].rotateCube(thetaLocal);
    }
    this.cubes[center].rotateCube(thetaLocal);

    //fix positions of cubes after rotation
    if (changeOrder) {
      this.updateCubePositionsAfterRotation(
        edgesArray,
        cornersArray,
        isClockwise
      );
    }

    this.recompute();
  }

  rotateMiddleRight(isClockwise = 1, theta = 90, changeOrder = true) {
    //Select all cubes need to be rotated
    var centersArray = [12, 15, 13, 10];
    var cornersArray = [9, 14, 16, 11];

    let thetaLocal = [theta * isClockwise, 0, 0];

    for (let i = 0; i < 4; i++) {
      this.cubes[centersArray[i]].rotateCube(thetaLocal);
      this.cubes[cornersArray[i]].rotateCube(thetaLocal);
    }

    //fix positions of cubes after rotation
    if (changeOrder) {
      this.updateCubePositionsAfterRotation(
        centersArray,
        cornersArray,
        isClockwise
      );
    }

    this.recompute();
  }

  rotateMiddleFront(isClockwise = 1, theta = -90, changeOrder = true) {
    //Select all cubes need to be rotated
    var centersArray = [4, 15, 21, 10];
    var cornersArray = [1, 7, 24, 18];

    let thetaLocal = [0, 0, theta * isClockwise * -1];

    for (let i = 0; i < 4; i++) {
      this.cubes[centersArray[i]].rotateCube(thetaLocal);
      this.cubes[cornersArray[i]].rotateCube(thetaLocal);
    }

    //fix positions of cubes after rotation
    if (changeOrder) {
      this.updateCubePositionsAfterRotation(
        centersArray,
        cornersArray,
        isClockwise
      );
    }

    this.recompute();
  }

  rotateMiddleUp(isClockwise = 1, theta = 90, changeOrder = true) {
    //Select all cubes need to be rotated
    var centersArray = [12, 4, 13, 21];
    var cornersArray = [3, 5, 22, 20];

    //TODO rotate all cubes w.r.t x direction

    let thetaLocal = [0, theta * isClockwise, 0];

    for (let i = 0; i < 4; i++) {
      this.cubes[centersArray[i]].rotateCube(thetaLocal);
      this.cubes[cornersArray[i]].rotateCube(thetaLocal);
    }

    //fix positions of cubes after rotation
    if (changeOrder) {
      this.updateCubePositionsAfterRotation(
        centersArray,
        cornersArray,
        isClockwise
      );
    }

    this.recompute();
  }

  render() {
    var modelView = mat4();
    modelView = mult(modelView, rotate(cameraYrot, [1, 0, 0]));
    modelView = mult(modelView, rotate(cameraXrot, [0, 1, 0]));

    this.gl.uniformMatrix4fv(
      this.gl.getUniformLocation(this.program, "modelViewMatrix"),
      false,
      flatten(modelView)
    );
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 36 * this.cubes.length);
  }
}
