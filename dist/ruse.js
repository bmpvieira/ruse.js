// Generated by CoffeeScript 1.6.3
(function() {
  var Ruse, Shaders,
    __slice = [].slice;

  Ruse = (function() {
    Ruse.prototype._loadShader = function(gl, source, type) {
      var compiled, lastError, shader;
      shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (!compiled) {
        lastError = gl.getShaderInfoLog(shader);
        throw "Error compiling shader " + shader + ": " + lastError;
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    Ruse.prototype._createProgram = function(gl, vertexShader, fragmentShader) {
      var linked, program;
      vertexShader = this._loadShader(gl, vertexShader, gl.VERTEX_SHADER);
      fragmentShader = this._loadShader(gl, fragmentShader, gl.FRAGMENT_SHADER);
      program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      linked = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (!linked) {
        throw "Error in program linking: " + (gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      gl.useProgram(program);
      program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
      gl.enableVertexAttribArray(program.vertexPositionAttribute);
      program.uPMatrix = gl.getUniformLocation(program, "uPMatrix");
      program.uMVMatrix = gl.getUniformLocation(program, "uMVMatrix");
      return program;
    };

    Ruse.prototype._setMatrices = function(program) {
      this.gl.useProgram(program);
      this.gl.uniformMatrix4fv(program.uPMatrix, false, this.pMatrix);
      return this.gl.uniformMatrix4fv(program.uMVMatrix, false, this.mvMatrix);
    };

    Ruse.prototype._toRadians = function(deg) {
      return deg * 0.017453292519943295;
    };

    Ruse.prototype._setupMouseControls = function() {
      var _this = this;
      this.drag = false;
      this.xOldOffset = null;
      this.yOldOffset = null;
      this.xOffset = 0;
      this.yOffset = 0;
      this.axesCanvas.onmousedown = function(e) {
        _this.drag = true;
        _this.xOldOffset = e.clientX;
        return _this.yOldOffset = e.clientY;
      };
      this.axesCanvas.onmouseup = function(e) {
        return _this.drag = false;
      };
      this.axesCanvas.onmousemove = function(e) {
        var delta, deltaX, deltaXP, deltaY, deltaYP, x, y;
        if (!_this.drag) {
          return;
        }
        x = e.clientX;
        y = e.clientY;
        deltaX = x - _this.xOldOffset;
        deltaY = y - _this.yOldOffset;
        deltaXP = _this.x2xp(deltaX);
        deltaYP = _this.y2yp(deltaY);
        delta = [deltaXP, deltaYP, 0.0];
        mat4.translate(_this.mvMatrix, _this.mvMatrix, delta);
        _this.xOldOffset = x;
        _this.yOldOffset = y;
        _this.draw();
        _this.xOffset += deltaX;
        _this.yOffset += deltaY;
        return _this.drawAxes();
      };
      this.axesCanvas.onmouseout = function(e) {
        return _this.drag = false;
      };
      return this.axesCanvas.onmouseover = function(e) {
        return _this.drag = false;
      };
    };

    function Ruse(arg, width, height) {
      var s, shaders;
      s = arg.constructor.toString();
      if (s.indexOf('WebGLRenderingContext') > -1 || s.indexOf('rawgl') > -1) {
        this.gl = arg;
        this.canvas = arg.canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.canvas.style.position = 'absolute';
      } else {
        this.width = width;
        this.height = height;
        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute('width', this.width);
        this.canvas.setAttribute('height', this.height);
        this.canvas.setAttribute('class', 'ruse');
        this.canvas.style.position = 'absolute';
        this.gl = this.canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!this.gl) {
          return null;
        }
        arg.appendChild(this.canvas);
      }
      this.axesCanvas = document.createElement('canvas');
      this.axesCanvas.setAttribute('width', this.width);
      this.axesCanvas.setAttribute('height', this.height);
      this.axesCanvas.setAttribute('class', 'ruse axes');
      this.axesCanvas.style.position = 'absolute';
      this.gl.canvas.parentElement.appendChild(this.axesCanvas);
      shaders = this.constructor.Shaders;
      this.programs = {};
      this.programs["ruse"] = this._createProgram(this.gl, shaders.vertex, shaders.fragment);
      this.pMatrix = mat4.create();
      this.mvMatrix = mat4.create();
      this.rotationMatrix = mat4.create();
      mat4.perspective(45.0, this.canvas.width / this.canvas.height, 0.1, 100.0, this.pMatrix);
      mat4.identity(this.rotationMatrix);
      mat4.identity(this.mvMatrix);
      mat4.translate(this.mvMatrix, this.mvMatrix, [0.0, 0.0, 0.0]);
      this._setMatrices(this.programs.ruse);
      this.gl.viewport(0, 0, this.width, this.height);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.gl.clearDepth(-50.0);
      this.gl.depthFunc(this.gl.GEQUAL);
      this.plotBuffer = this.gl.createBuffer();
      this.margin = 0.02;
      this.lineWidth = 0.005;
      this.fontSize = 10;
      this.fontFamily = "Helvetica";
      this.axisPadding = 4;
      this.xTicks = 6;
      this.yTicks = 6;
      this.xTickSize = 4;
      this.yTickSize = 4;
      this.targetBinWidth = 1;
      this.bins = null;
      this.drawMode = null;
      this._setupMouseControls();
    }

    Ruse.prototype.draw = function() {
      this._setMatrices(this.programs.ruse);
      return this.gl.drawArrays(this.drawMode, 0, this.plotBuffer.numItems);
    };

    Ruse.prototype.x2xp = function(x) {
      return 2 / this.width * x;
    };

    Ruse.prototype.y2yp = function(y) {
      return -2 / this.height * y;
    };

    Ruse.prototype.xp2x = function(xp) {
      return xp * this.width / 2;
    };

    Ruse.prototype.yp2y = function(yp) {
      return yp * this.height / 2;
    };

    Ruse.prototype.xy2xpyp = function(x, y) {
      var xp, yp;
      xp = 2 / this.width * x - 1;
      yp = -2 / this.height * y + 1;
      return [xp, yp];
    };

    Ruse.prototype.xpyp2xy = function(xp, yp) {
      var x, y;
      x = this.width / 2 * (xp + 1);
      y = -this.height / 2 * (yp - 1);
      return [x, y];
    };

    Ruse.prototype.isArray = function(obj) {
      var type;
      type = Object.prototype.toString.call(obj);
      if (type.indexOf('Array') > -1) {
        return true;
      } else {
        return false;
      }
    };

    Ruse.prototype.isObject = function(obj) {
      var type;
      type = Object.prototype.toString.call(obj);
      if (type.indexOf('Object') > -1) {
        return true;
      } else {
        return false;
      }
    };

    Ruse.prototype.linspace = function(start, stop, num) {
      var range, step, steps;
      range = stop - start;
      step = range / (num - 1);
      steps = new Float32Array(num);
      while (num--) {
        steps[num] = start + num * step;
      }
      return steps;
    };

    Ruse.prototype.getExtent = function(arr) {
      var index, max, min, value;
      index = arr.length;
      while (index--) {
        value = arr[index];
        if (isNaN(value)) {
          continue;
        }
        min = max = value;
        break;
      }
      while (index--) {
        value = arr[index];
        if (isNaN(value)) {
          continue;
        }
        if (value < min) {
          min = value;
        }
        if (value > max) {
          max = value;
        }
      }
      return [min, max];
    };

    Ruse.prototype.getHistogram = function(arr, min, max, bins) {
      var dx, h, i, index, range, value;
      range = max - min;
      h = new Uint32Array(bins);
      dx = range / bins;
      i = arr.length;
      while (i--) {
        value = arr[i];
        index = ~~((value - min) / dx);
        h[index] += 1;
      }
      h.dx = dx;
      return h;
    };

    Ruse.prototype.histogram = function(data) {
      var clipspaceBinWidth, clipspaceLower, clipspaceSize, clipspaceUpper, datum, h, histMax, histMin, i, index, key, margin, max, min, nVertices, value, vertices, width, x, y, y0, _i, _len, _ref, _ref1;
      datum = data[0];
      if (this.isObject(datum)) {
        key = Object.keys(datum)[0];
        data = data.map(function(d) {
          return d[key];
        });
      }
      _ref = this.getExtent(data), min = _ref[0], max = _ref[1];
      if (!this.bins) {
        width = this.width - this.getMargin() * this.width;
        this.bins = Math.floor(width / this.targetBinWidth);
      }
      h = this.getHistogram(data, min, max, this.bins);
      margin = this.getMargin();
      clipspaceSize = 2.0 - 2 * margin;
      clipspaceLower = -1.0 + margin;
      clipspaceUpper = 1.0 - margin;
      clipspaceBinWidth = clipspaceSize / this.bins;
      _ref1 = this.getExtent(h), histMin = _ref1[0], histMax = _ref1[1];
      nVertices = 6 * this.bins;
      vertices = new Float32Array(2 * nVertices);
      x = -1.0 + margin;
      y = y0 = -1.0 + margin;
      for (index = _i = 0, _len = h.length; _i < _len; index = ++_i) {
        value = h[index];
        i = 12 * index;
        vertices[i + 0] = x;
        vertices[i + 1] = y0;
        vertices[i + 2] = x;
        vertices[i + 3] = (clipspaceUpper - clipspaceLower) * value / histMax + clipspaceLower;
        vertices[i + 4] = x + clipspaceBinWidth;
        vertices[i + 5] = y0;
        vertices[i + 6] = vertices[i + 4];
        vertices[i + 7] = vertices[i + 5];
        vertices[i + 8] = vertices[i + 4];
        vertices[i + 9] = vertices[i + 3];
        vertices[i + 10] = vertices[i + 2];
        vertices[i + 11] = vertices[i + 3];
        x += clipspaceBinWidth;
      }
      this.gl.useProgram(this.programs.ruse);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.plotBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
      this.plotBuffer.itemSize = 2;
      this.plotBuffer.numItems = nVertices;
      this.gl.vertexAttribPointer(this.programs.ruse.vertexPositionAttribute, this.plotBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
      this.drawMode = this.gl.TRIANGLES;
      return this.draw();
    };

    Ruse.prototype.plot = function() {
      var arg, args, datum, dimensions, keys;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length === 1) {
        arg = args[0];
        if (this.isArray(arg)) {
          datum = arg[0];
          if (this.isObject(datum)) {
            keys = Object.keys(datum);
            dimensions = keys.length;
            switch (dimensions) {
              case 1:
                this.histogram(arg);
                return;
              case 2:
                this.scatter2D(arg);
                return;
              case 3:
                this.scatter3D(arg);
                return;
            }
          } else {
            this.histogram(arg);
            return;
          }
        }
      }
      switch (args.length) {
        case 2:
          this.scatter2D.apply(this, args);
          return;
        case 3:
          this.scatter3D.apply(this, args);
          return;
      }
      throw "Input data not recognized by Ruse.";
    };

    Ruse.prototype.getMargin = function() {
      return this.margin + (this.fontSize + this.axisPadding) * 2 / this.height;
    };

    Ruse.prototype.drawAxes = function() {
      var context, i, key1width, key2width, lineWidth, lineWidthX, lineWidthY, margin, value, vertices, x, x1, x2, xTick, xTicks, xp, y, y1, y2, yTick, yTicks, yp, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;
      this.axesCanvas.width = this.axesCanvas.width;
      context = this.axesCanvas.getContext('2d');
      context.imageSmoothingEnabled = false;
      context.lineWidth = 1;
      context.translate(this.xOffset, this.yOffset);
      lineWidth = context.lineWidth;
      lineWidthX = lineWidth * 2 / this.width;
      lineWidthY = lineWidth * 2 / this.height;
      margin = this.getMargin();
      vertices = new Float32Array([-1.0 + margin - lineWidthX, 1.0, -1.0 + margin - lineWidthX, -1.0, -1.0, -1.0 + margin - lineWidthY, 1.0, -1.0 + margin - lineWidthY]);
      for (i = _i = 0, _len = vertices.length; _i < _len; i = _i += 2) {
        value = vertices[i];
        xp = vertices[i];
        yp = vertices[i + 1];
        _ref = this.xpyp2xy(xp, yp), x = _ref[0], y = _ref[1];
        vertices[i] = x;
        vertices[i + 1] = y;
      }
      context.beginPath();
      context.moveTo(vertices[0], vertices[1]);
      context.lineTo(vertices[2], vertices[3]);
      context.closePath();
      context.stroke();
      context.beginPath();
      context.moveTo(vertices[4], vertices[5]);
      context.lineTo(vertices[6], vertices[7]);
      context.closePath();
      context.stroke();
      _ref1 = this.xpyp2xy(-1.0 + margin, -1.0 + margin), x1 = _ref1[0], y1 = _ref1[1];
      _ref2 = this.xpyp2xy(1.0 - margin, 1.0 - margin), x2 = _ref2[0], y2 = _ref2[1];
      xTicks = this.linspace(x1, x2, this.xTicks + 1).subarray(1);
      yTicks = this.linspace(y1, y2, this.yTicks + 1).subarray(1);
      for (_j = 0, _len1 = xTicks.length; _j < _len1; _j++) {
        xTick = xTicks[_j];
        context.beginPath();
        context.moveTo(xTick, y1);
        context.lineTo(xTick, y1 - this.xTickSize);
        context.stroke();
      }
      for (_k = 0, _len2 = yTicks.length; _k < _len2; _k++) {
        yTick = yTicks[_k];
        context.beginPath();
        context.moveTo(x1 - 1, yTick);
        context.lineTo(x1 - 1 + this.yTickSize, yTick);
        context.stroke();
      }
      context.font = "" + this.fontSize + "px " + this.fontFamily;
      key1width = context.measureText(this.key1).width;
      key2width = context.measureText(this.key2).width;
      _ref3 = this.xpyp2xy(1.0 - margin, -1.0 + margin), x = _ref3[0], y = _ref3[1];
      x -= key1width;
      y += this.fontSize + 4;
      context.fillText("" + this.key1, x, y);
      context.save();
      context.rotate(-Math.PI / 2);
      x = -1 * (margin * this.height / 2 + key2width);
      y = margin * this.width / 2 - this.fontSize;
      context.fillText("" + this.key2, x, y);
      return context.restore();
    };

    Ruse.prototype.scatter2D = function(data) {
      var datum, i, index, margin, max1, max2, min1, min2, nVertices, range1, range2, val1, val2, vertices, _i, _len, _ref;
      this.gl.useProgram(this.programs.ruse);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.plotBuffer);
      margin = this.getMargin();
      nVertices = data.length;
      vertices = new Float32Array(2 * nVertices);
      _ref = Object.keys(data[0]), this.key1 = _ref[0], this.key2 = _ref[1];
      i = nVertices;
      min1 = max1 = data[i - 1][this.key1];
      min2 = max2 = data[i - 1][this.key2];
      while (i--) {
        val1 = data[i][this.key1];
        val2 = data[i][this.key2];
        if (val1 < min1) {
          min1 = val1;
        }
        if (val1 > max1) {
          max1 = val1;
        }
        if (val2 < min2) {
          min2 = val2;
        }
        if (val2 > max2) {
          max2 = val2;
        }
      }
      range1 = max1 - min1;
      range2 = max2 - min2;
      for (index = _i = 0, _len = data.length; _i < _len; index = ++_i) {
        datum = data[index];
        i = 2 * index;
        val1 = datum[this.key1];
        val2 = datum[this.key2];
        vertices[i] = 2 * (1 - margin) / range1 * (val1 - min1) - 1 + margin;
        vertices[i + 1] = 2 * (1 - margin) / range2 * (val2 - min2) - 1 + margin;
      }
      this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
      this.plotBuffer.itemSize = 2;
      this.plotBuffer.numItems = nVertices;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.plotBuffer);
      this.gl.vertexAttribPointer(this.programs.ruse.vertexPositionAttribute, this.plotBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
      this.drawMode = this.gl.POINTS;
      this.draw();
      return this.drawAxes();
    };

    Ruse.prototype.scatter3D = function(data) {
      var nVertices, vertices;
      throw "scatter3D not yet implemented";
      this.gl.useProgram(this.programs.ruse);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.plotBuffer);
      nVertices = 1;
      vertices = new Float32Array([0.0, 0.0, 1.0]);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
      this.plotBuffer.itemSize = 3;
      this.plotBuffer.numItems = nVertices;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.plotBuffer);
      this.gl.vertexAttribPointer(this.programs.ruse.vertexPositionAttribute, this.plotBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
      this.drawMode = this.gl.POINTS;
      this.draw();
      return this.drawAxes();
    };

    return Ruse;

  })();

  if (this.astro == null) {
    this.astro = {};
  }

  this.astro.Ruse = Ruse;

  this.astro.Ruse.version = '0.1.0';

  Shaders = {
    vertex: ["attribute vec3 aVertexPosition;", "uniform mat4 uMVMatrix;", "uniform mat4 uPMatrix;", "void main(void) {", "gl_PointSize = 1.25;", "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);", "}"].join("\n"),
    fragment: ["precision mediump float;", "void main(void) {", "gl_FragColor = vec4(0.0, 0.4431, 0.8980, 1.0);", "}"].join("\n")
  };

  this.astro.Ruse.Shaders = Shaders;

}).call(this);
