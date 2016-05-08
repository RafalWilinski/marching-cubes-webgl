import { Matrix, Vector } from 'sylvester';

Matrix.Translation = (v) => {
  if (v.elements.length === 2) {
    const r = Matrix.I(3);
    r.elements[2][0] = v.elements[0];
    r.elements[2][1] = v.elements[1];
    return r;
  }

  if (v.elements.length === 3) {
    const r = Matrix.I(4);
    r.elements[0][3] = v.elements[0];
    r.elements[1][3] = v.elements[1];
    r.elements[2][3] = v.elements[2];
    return r;
  }

  throw new Error('Invalid length for Translation');
};

Matrix.prototype.flatten = () => {
  const result = [];
  if (this.elements.length === 0) {
    return [];
  }


  for (let j = 0; j < this.elements[0].length; j++) {
    for (let i = 0; i < this.elements.length; i++) {
      result.push(this.elements[i][j]);
    }
  }
  return result;
};

Matrix.prototype.ensure4x4 = () => {
  if (this.elements.length === 4 &&
      this.elements[0].length === 4) {
    return this;
  }

  if (this.elements.length > 4 ||
      this.elements[0].length > 4) {
    return null;
  }

  for (let i = 0; i < this.elements.length; i++) {
    for (let j = this.elements[i].length; j < 4; j++) {
      if (i === j) {
        this.elements[i].push(1);
      } else {
        this.elements[i].push(0);
      }
    }
  }

  for (let i = this.elements.length; i < 4; i++) {
    if (i === 0) {
      this.elements.push([1, 0, 0, 0]);
    } else if (i === 1) {
      this.elements.push([0, 1, 0, 0]);
    } else if (i === 2) {
      this.elements.push([0, 0, 1, 0]);
    } else if (i === 3) {
      this.elements.push([0, 0, 0, 1]);
    }
  }

  return this;
};

Matrix.prototype.make3x3 = function () {
  if (this.elements.length !== 4 ||
      this.elements[0].length !== 4)
    return null;

  return Matrix.create([[this.elements[0][0], this.elements[0][1], this.elements[0][2]],
    [this.elements[1][0], this.elements[1][1], this.elements[1][2]],
    [this.elements[2][0], this.elements[2][1], this.elements[2][2]]]);
};

Vector.prototype.flatten = function () {
  return this.elements;
};

function mht(m) {
  let s = "";
  if (m.length === 16) {
    for (let i = 0; i < 4; i++) {
      s += "<span style='font-family: monospace'>[" + m[i * 4 + 0].toFixed(4) + "," + m[i * 4 + 1].toFixed(4) + "," + m[i * 4 + 2].toFixed(4) + "," + m[i * 4 + 3].toFixed(4) + "]</span><br>";
    }
  } else if (m.length === 9) {
    for (let i = 0; i < 3; i++) {
      s += "<span style='font-family: monospace'>[" + m[i * 3 + 0].toFixed(4) + "," + m[i * 3 + 1].toFixed(4) + "," + m[i * 3 + 2].toFixed(4) + "]</font><br>";
    }
  } else {
    return m.toString();
  }
  return s;
}

//
// gluLookAt
//
export const makeLookAt = (ex, ey, ez,
                           cx, cy, cz,
                           ux, uy, uz) => {
  const eye = Vector([ex, ey, ez]);
  const center = Vector([cx, cy, cz]);
  const up = Vector([ux, uy, uz]);

  const z = eye.subtract(center).toUnitVector();
  const x = up.cross(z).toUnitVector();
  const y = z.cross(x).toUnitVector();

  const m = Matrix([[x.e(1), x.e(2), x.e(3), 0],
    [y.e(1), y.e(2), y.e(3), 0],
    [z.e(1), z.e(2), z.e(3), 0],
    [0, 0, 0, 1]]);

  const t = Matrix([[1, 0, 0, -ex],
    [0, 1, 0, -ey],
    [0, 0, 1, -ez],
    [0, 0, 0, 1]]);
  return m.x(t);
};

//
// glOrtho
//
export const makeOrtho = (left, right,
                          bottom, top,
                          znear, zfar) => {
  const tx = -(right + left) / (right - left);
  const ty = -(top + bottom) / (top - bottom);
  const tz = -(zfar + znear) / (zfar - znear);

  return Matrix([[2 / (right - left), 0, 0, tx],
    [0, 2 / (top - bottom), 0, ty],
    [0, 0, -2 / (zfar - znear), tz],
    [0, 0, 0, 1]]);
};

//
// glFrustum
//
export const makeFrustum = (left, right,
                            bottom, top,
                            znear, zfar) => {
  const X = 2 * znear / (right - left);
  const Y = 2 * znear / (top - bottom);
  const A = (right + left) / (right - left);
  const B = (top + bottom) / (top - bottom);
  const C = -(zfar + znear) / (zfar - znear);
  const D = -2 * zfar * znear / (zfar - znear);

  return Matrix([[X, 0, A, 0],
    [0, Y, B, 0],
    [0, 0, C, D],
    [0, 0, -1, 0]]);
};

//
// gluPerspective
//
export const makePerspective = (fovy, aspect, znear, zfar) => {
  const ymax = znear * Math.tan(fovy * Math.PI / 360.0);
  const ymin = -ymax;
  const xmin = ymin * aspect;
  const xmax = ymax * aspect;

  return makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
};

