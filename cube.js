class Cube {
  constructor(x, y, z, size, id) {
    this.id = id;
    this.center = [x, y, z];
    this.size = size;
    this.theta = [0, 0, 0]; // in degree.

    this.points = [];
    this.colors = [];

    // For textures.
    this.normals = [];
    this.texCoordsArray = [];

    this.texCoord = [vec2(0, 0), vec2(0, 1), vec2(1, 1), vec2(1, 0)];

    var red = [1.0, 0.0, 0.0, 1.0];
    var blue = [0.0, 0.0, 1.0, 1.0];
    var green = [0.0, 1.0, 0.0, 1.0];
    var yellow = [1.0, 1.0, 0.0, 1.0];
    var magenta = [1.0, 0.0, 1.0, 1.0];
    var white = [1.0, 1.0, 1.0, 1.0];

    this.upColor = white;
    this.rightColor = green;
    this.bottomColor = yellow;
    this.leftColor = blue;
    this.frontColor = red;
    this.backColor = magenta;

    this.generateColorCube();
  }

  setColors(up, right, bottom, left, front, back) {
    this.upColor = up;
    this.rightColor = right;
    this.bottomColor = bottom;
    this.leftColor = left;
    this.frontColor = front;
    this.backColor = back;

    // Reset the cube.
    this.points = [];
    this.colors = [];
    // For textures.
    this.normals = [];
    this.texCoordsArray = [];

    this.generateColorCube();
  }

  getId() {
    return this.id;
  }

  getInfo() {
    return [
      this.points,
      this.colors, // For textures.
      this.normals,
      this.texCoordsArray,
    ];
  }

  getCenter() {
    return this.center;
  }

  rotateCube(theta) {
    // Define rotation matrices for each axis
    var rotateX = rotate(theta[0], [1, 0, 0]);
    var rotateY = rotate(theta[1], [0, 1, 0]);
    var rotateZ = rotate(theta[2], [0, 0, 1]);

    // Multiply the rotation matrices to get the final rotation matrix
    var rotateMatrix = mult(mult(rotateX, rotateY), rotateZ);

    // Apply the rotation matrix to each point
    for (let i = 0; i < this.points.length; i++) {
      this.points[i] = this.multMat4Vec4(rotateMatrix, this.points[i]);
    }

    this.normals = [];
    for (let i = 0; i < this.points.length; i += 3) {
      let t1 = subtract(this.points[i + 1], this.points[i]);
      let t2 = subtract(this.points[i + 2], this.points[i + 1]);
      let normal = cross(t1, t2);
      normal = vec3(normal);

      for (let j = 0; j < 3; j++) {
        this.normals.push(normal);
      }
    }
  }

  setOffset(offsetx, offsety, offsetz) {
    for (let i = 0; i < this.points.length; i++) {
      // Update each coordinate based on the sign and offset
      this.points[i][0] += offsetx;
      this.points[i][1] += offsety;
      this.points[i][2] += offsetz;
    }
  }

  getSign(number) {
    return number > 0 ? 1 : number < 0 ? -1 : 0;
  }

  generateColorCube() {
    this.quad(1, 0, 3, 2, this.backColor, this.center, this.size); // back side.
    this.quad(2, 3, 7, 6, this.rightColor, this.center, this.size); // right side.
    this.quad(3, 0, 4, 7, this.bottomColor, this.center, this.size); // bottom side.
    this.quad(6, 5, 1, 2, this.upColor, this.center, this.size); // up side.
    this.quad(4, 5, 6, 7, this.frontColor, this.center, this.size); // front side.
    this.quad(5, 4, 0, 1, this.leftColor, this.center, this.size); // left side.
  }

  multMat4Vec4(mat, vec) {
    var result = [];
    for (var i = 0; i < 4; ++i) {
      result[i] = 0.0;
      for (var j = 0; j < 4; ++j) {
        result[i] += mat[i][j] * vec[j];
      }
    }
    return result;
  }

  degreeToRadian(degrees) {
    return (degrees * Math.PI) / 180;
  }

  quad(a, b, c, d, color = -1, center = [0, 0, 0], sideSize = 1) {
    var vertices = [
      vec4(-0.5 * sideSize, -0.5 * sideSize, 0.5 * sideSize, 1.0),
      vec4(-0.5 * sideSize, 0.5 * sideSize, 0.5 * sideSize, 1.0),
      vec4(0.5 * sideSize, 0.5 * sideSize, 0.5 * sideSize, 1.0),
      vec4(0.5 * sideSize, -0.5 * sideSize, 0.5 * sideSize, 1.0),
      vec4(-0.5 * sideSize, -0.5 * sideSize, -0.5 * sideSize, 1.0),
      vec4(-0.5 * sideSize, 0.5 * sideSize, -0.5 * sideSize, 1.0),
      vec4(0.5 * sideSize, 0.5 * sideSize, -0.5 * sideSize, 1.0),
      vec4(0.5 * sideSize, -0.5 * sideSize, -0.5 * sideSize, 1.0),
    ];

    var vertexColors = [
      [0.0, 0.0, 0.0, 1.0], // black 0
      [1.0, 0.0, 0.0, 1.0], // red 1
      [1.0, 1.0, 0.0, 1.0], // yellow 2
      [0.0, 1.0, 0.0, 1.0], // green 3
      [0.0, 0.0, 1.0, 1.0], // blue 4
      [1.0, 0.0, 1.0, 1.0], // magenta
      [0.0, 1.0, 1.0, 1.0], // cyan
      [1.0, 1.0, 1.0, 1.0], // white
    ];

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [a, b, c, a, c, d];

    for (var i = 0; i < indices.length; ++i) {
      // Adjust the vertices based on the center parameter
      var adjustedVertex = add(
        vertices[indices[i]],
        vec4(center[0], center[1], center[2], 0.0)
      );

      this.points.push(adjustedVertex);

      // for solid colored faces use
      if (color === -1) this.colors.push(vertexColors[a]);
      else this.colors.push(color);

      this.normals.push(normal);

      if (i < 4) {
        this.texCoordsArray.push(this.texCoord[i % 3]);
      } else {
        this.texCoordsArray.push(this.texCoord[(i % 3) + 1]);
      }
    }
  }
}
