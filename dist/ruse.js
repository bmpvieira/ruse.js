// Generated by CoffeeScript 1.6.3
(function() {
  var Ruse, Shaders,
    __slice = [].slice;

  Ruse = (function() {
    Ruse.prototype._loadShader = function(gl, source, type) {
      var compiled, shader;
      shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (!compiled) {
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
        gl.deleteProgram(program);
        return null;
      }
      gl.useProgram(program);
      program.aVertexPosition1 = gl.getAttribLocation(program, "aVertexPosition1");
      gl.enableVertexAttribArray(program.aVertexPosition1);
      program.aVertexPosition2 = gl.getAttribLocation(program, "aVertexPosition2");
      gl.enableVertexAttribArray(program.aVertexPosition2);
      program.uPMatrix = gl.getUniformLocation(program, "uPMatrix");
      program.uMVMatrix = gl.getUniformLocation(program, "uMVMatrix");
      return program;
    };

    Ruse.prototype._createProgramAxes = function(gl, vertexShader, fragmentShader) {
      var linked, program;
      vertexShader = this._loadShader(gl, vertexShader, gl.VERTEX_SHADER);
      fragmentShader = this._loadShader(gl, fragmentShader, gl.FRAGMENT_SHADER);
      program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      linked = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (!linked) {
        gl.deleteProgram(program);
        return null;
      }
      gl.useProgram(program);
      program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
      gl.enableVertexAttribArray(program.aVertexPosition);
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
        var deltaX, deltaY, rotationMatrix, x, y;
        if (!_this.drag) {
          return;
        }
        x = e.clientX;
        y = e.clientY;
        deltaX = x - _this.xOldOffset;
        deltaY = y - _this.yOldOffset;
        rotationMatrix = mat4.create();
        mat4.identity(rotationMatrix);
        mat4.rotateY(rotationMatrix, rotationMatrix, _this._toRadians(deltaX / 4));
        mat4.rotateX(rotationMatrix, rotationMatrix, _this._toRadians(deltaY / 4));
        mat4.multiply(_this.rotationMatrix, rotationMatrix, _this.rotationMatrix);
        _this.xOldOffset = x;
        _this.yOldOffset = y;
        return _this.draw();
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
      this.margin = 0.02;
      this.fontSize = 10;
      this.tickFontSize = 9;
      this.fontFamily = "Helvetica";
      this.axisPadding = 4;
      this.xTicks = 6;
      this.yTicks = 6;
      this.xTickSize = 4;
      this.yTickSize = 4;
      this.tickDecimals = 3;
      this.targetBinWidth = 1;
      this.bins = null;
      this.drawMode = null;
      this.extents = null;
      this.hasData = false;
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
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
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
      this.programs["axes"] = this._createProgramAxes(this.gl, shaders.axesVertex, shaders.fragment);
      this.uMinimum1 = this.gl.getUniformLocation(this.programs.ruse, "uMinimum1");
      this.uMaximum1 = this.gl.getUniformLocation(this.programs.ruse, "uMaximum1");
      this.uMinimum2 = this.gl.getUniformLocation(this.programs.ruse, "uMinimum2");
      this.uMaximum2 = this.gl.getUniformLocation(this.programs.ruse, "uMaximum2");
      this.uZComponent = this.gl.getUniformLocation(this.programs.ruse, "uZComponent");
      this.uTime = this.gl.getUniformLocation(this.programs.ruse, "uTime");
      this.uMargin = this.gl.getUniformLocation(this.programs.ruse, "uMargin");
      this.gl.useProgram(this.programs.ruse);
      this.gl.uniform1f(this.uMargin, this.getMargin());
      this.pMatrix = mat4.create();
      this.mvMatrix = mat4.create();
      this.rotationMatrix = mat4.create();
      this._setMatrices(this.programs.ruse);
      this.gl.viewport(0, 0, this.width, this.height);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.dataBuffer1 = this.gl.createBuffer();
      this.dataBuffer2 = this.gl.createBuffer();
      this.axesBuffer = this.gl.createBuffer();
      this["switch"] = 0;
      this.state = null;
      this.isAnimating = false;
    }

    Ruse.prototype.draw = function() {
      this.gl.useProgram(this.programs.ruse);
      mat4.identity(this.mvMatrix);
      mat4.translate(this.mvMatrix, this.mvMatrix, this.translateBy);
      mat4.multiply(this.mvMatrix, this.mvMatrix, this.rotationMatrix);
      this._setMatrices(this.programs.ruse);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      return this.gl.drawArrays(this.drawMode, 0, this.dataBuffer1.numItems);
    };

    Ruse.prototype.removeAxes = function() {
      return this.axesCanvas.width = this.axesCanvas.width;
    };

    Ruse.prototype.setupAxes3d = function() {
      var vertices;
      vertices = new Float32Array([-1.0, -0.1, 0.0, 1.0, -0.1, 0.0, -1.0, -0.1, 0.0]);
      this.axesBuffer.itemSize = 3;
      this.axesBuffer.numItems = 1;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.axesBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
      return this.gl.vertexAttribPointer(this.programs.axes.aVertexPosition, this.axesBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    };

    Ruse.prototype.drawAxes3d = function() {
      this.gl.useProgram(this.programs.axes);
      console.log('drawAxes3d');
      mat4.identity(this.mvMatrix);
      mat4.translate(this.mvMatrix, this.mvMatrix, this.translateBy);
      mat4.multiply(this.mvMatrix, this.mvMatrix, this.rotationMatrix);
      this._setMatrices(this.programs.axes);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      return this.dl.drawArrays(this.gl.TRIANGLES, 0, this.axesBuffer.numItems);
    };

    Ruse.prototype.drawAxes = function() {
      var context, i, index, key1width, key2width, lineWidth, lineWidthX, lineWidthY, margin, textWidth, value, vertices, x, x1, x2, xTick, xTickValues, xTicks, xp, y, y1, y2, yTick, yTickValues, yTicks, yp, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;
      this.axesCanvas.width = this.axesCanvas.width;
      context = this.axesCanvas.getContext('2d');
      context.imageSmoothingEnabled = false;
      context.lineWidth = 1;
      context.font = "" + this.fontSize + "px " + this.fontFamily;
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
      if (this.extents != null) {
        context.font = "" + this.tickFontSize + "px " + this.fontFamily;
        xTickValues = this.linspace(this.extents.xmin, this.extents.xmax, this.xTicks + 1).subarray(1);
        yTickValues = this.linspace(this.extents.ymin, this.extents.ymax, this.yTicks + 1).subarray(1);
      }
      for (index = _j = 0, _len1 = xTicks.length; _j < _len1; index = ++_j) {
        xTick = xTicks[index];
        context.beginPath();
        context.moveTo(xTick, y1);
        context.lineTo(xTick, y1 - this.xTickSize);
        context.stroke();
        if (xTickValues != null) {
          value = xTickValues[index].toFixed(this.tickDecimals);
          textWidth = context.measureText(value).width;
          context.fillText("" + value, xTick - textWidth + 1, y1 + this.fontSize + 2);
        }
      }
      for (index = _k = 0, _len2 = yTicks.length; _k < _len2; index = ++_k) {
        yTick = yTicks[index];
        context.beginPath();
        context.moveTo(x1 - 1, yTick);
        context.lineTo(x1 - 1 + this.yTickSize, yTick);
        context.stroke();
        if (yTickValues != null) {
          value = yTickValues[index].toFixed(this.tickDecimals);
          textWidth = context.measureText(value).width;
          context.save();
          context.rotate(-Math.PI / 2);
          context.fillText("" + value, -1 * (yTick + textWidth - 1), x1 - this.fontSize);
          context.restore();
        }
      }
      context.font = "" + this.fontSize + "px " + this.fontFamily;
      key1width = context.measureText(this.key1).width;
      key2width = context.measureText(this.key2).width;
      _ref3 = this.xpyp2xy(1.0 - margin, -1.0 + margin), x = _ref3[0], y = _ref3[1];
      x -= key1width;
      y += 2 * this.fontSize + 8;
      context.fillText("" + this.key1, x, y);
      context.save();
      context.rotate(-Math.PI / 2);
      x = -1 * (margin * this.height / 2 + key2width);
      y = margin * this.width / 2 - 2 * this.fontSize - 8;
      context.fillText("" + this.key2, x, y);
      return context.restore();
    };

    Ruse.prototype.getMargin = function() {
      return this.margin + (2 * this.fontSize + this.axisPadding) * 2 / this.height;
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

    Ruse.prototype.getExtentFromObjects = function(data) {
      var i, index, key, keys, maximums, minimums, val, _i, _j, _len, _len1;
      keys = Object.keys(data[0]);
      i = data.length;
      minimums = [];
      maximums = [];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        minimums.push(data[i - 1][key]);
        maximums.push(data[i - 1][key]);
      }
      while (i--) {
        for (index = _j = 0, _len1 = keys.length; _j < _len1; index = ++_j) {
          key = keys[index];
          val = data[i][key];
          if (val < minimums[index]) {
            minimums[index] = val;
          }
          if (val > maximums[index]) {
            maximums[index] = val;
          }
        }
      }
      return [minimums, maximums];
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
      if (index === -1) {
        return [NaN, NaN];
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

    Ruse.prototype.animate = function() {
      var i,
        _this = this;
      if (this.isAnimating) {
        clearInterval(this.intervalId);
      }
      i = 0;
      this.isAnimating = true;
      return this.intervalId = setInterval(function() {
        var uTime;
        i += 1;
        uTime = _this["switch"] === 1 ? i / 45 : 1 - i / 45;
        _this.gl.uniform1f(_this.uTime, uTime);
        _this.draw();
        if (i === 45) {
          clearInterval(_this.intervalId);
          return _this.isAnimating = false;
        }
      }, 1000 / 60);
    };

    return Ruse;

  })();

  if (this.astro == null) {
    this.astro = {};
  }

  this.astro.Ruse = Ruse;

  this.astro.Ruse.version = '0.1.0';

  Ruse = this.astro.Ruse;

  Ruse.prototype.setFontSize = function(value) {
    this.fontSize = value;
    return this.drawAxes();
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
    var clipspaceBinWidth, clipspaceLower, clipspaceSize, clipspaceUpper, countMax, countMin, datum, finalAttribute, finalBuffer, h, histMax, histMin, i, index, initialAttribute, initialBuffer, key, margin, max, min, nVertices, value, vertexSize, vertices, width, x, y, y0, _i, _len, _ref, _ref1, _ref2, _ref3;
    if (this.state !== "histogram") {
      this["switch"] = 0;
      this.hasData = false;
    }
    this.state = "histogram";
    datum = data[0];
    if (this.isObject(datum)) {
      key = Object.keys(datum)[0];
      this.key1 = key;
      this.key2 = "";
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
    _ref1 = this.getExtent(h), countMin = _ref1[0], countMax = _ref1[1];
    this.extents = {
      xmin: min,
      xmax: max,
      ymin: countMin,
      ymax: countMax
    };
    margin = this.getMargin();
    clipspaceSize = 2.0 - 2 * margin;
    clipspaceLower = -1.0 + margin;
    clipspaceUpper = 1.0 - margin;
    clipspaceBinWidth = clipspaceSize / this.bins;
    _ref2 = this.getExtent(h), histMin = _ref2[0], histMax = _ref2[1];
    vertexSize = 2;
    nVertices = 6 * this.bins;
    vertices = new Float32Array(vertexSize * nVertices);
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
    _ref3 = this.delegateBuffers(), initialBuffer = _ref3[0], initialAttribute = _ref3[1], finalBuffer = _ref3[2], finalAttribute = _ref3[3];
    if (!this.hasData) {
      this.setInitialBuffer(initialBuffer, initialAttribute, vertexSize, nVertices, vertices);
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, finalBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    finalBuffer.itemSize = vertexSize;
    finalBuffer.numItems = nVertices;
    this.gl.vertexAttribPointer(finalAttribute, finalBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    this.hasData = true;
    this.drawMode = this.gl.TRIANGLES;
    this.drawAxes();
    return this.animate();
  };

  Ruse = this.astro.Ruse;

  Ruse.prototype.scatter2D = function(data) {
    var datum, i, index, initialVertices, margin, max1, max2, min1, min2, nVertices, range1, range2, vertexSize, vertices, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
    if (this.state !== "scatter2D") {
      this["switch"] = 0;
      this.hasData = false;
    }
    this.state = "scatter2D";
    this.gl.uniform1f(this.uZComponent, 0.0);
    mat4.identity(this.pMatrix);
    mat4.identity(this.mvMatrix);
    mat4.identity(this.rotationMatrix);
    this.translateBy = [0.0, 0.0, 0.0];
    margin = this.getMargin();
    vertexSize = 2;
    nVertices = data.length;
    vertices = new Float32Array(vertexSize * nVertices);
    _ref = Object.keys(data[0]), this.key1 = _ref[0], this.key2 = _ref[1];
    _ref1 = this.getExtentFromObjects(data), (_ref2 = _ref1[0], min1 = _ref2[0], min2 = _ref2[1]), (_ref3 = _ref1[1], max1 = _ref3[0], max2 = _ref3[1]);
    range1 = max1 - min1;
    range2 = max2 - min2;
    for (index = _i = 0, _len = data.length; _i < _len; index = ++_i) {
      datum = data[index];
      i = vertexSize * index;
      vertices[i] = datum[this.key1];
      vertices[i + 1] = datum[this.key2];
    }
    if (!this.hasData) {
      initialVertices = new Float32Array(vertexSize * nVertices);
      for (index = _j = 0, _len1 = data.length; _j < _len1; index = ++_j) {
        datum = data[index];
        i = vertexSize * index;
        initialVertices[i] = datum[this.key1];
        initialVertices[i + 1] = min2;
      }
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.dataBuffer1);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, initialVertices, this.gl.STATIC_DRAW);
      this.extents = {
        xmin: min1,
        xmax: max1,
        ymin: min2,
        ymax: max2
      };
      this.hasData = true;
    }
    this.dataBuffer1.itemSize = vertexSize;
    this.dataBuffer1.numItems = nVertices;
    this.dataBuffer2.itemSize = vertexSize;
    this.dataBuffer2.numItems = nVertices;
    if (this["switch"] === 0) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.dataBuffer1);
      this.gl.vertexAttribPointer(this.programs.ruse.aVertexPosition1, this.dataBuffer1.itemSize, this.gl.FLOAT, false, 0, 0);
      this.gl.uniform3f(this.uMinimum1, this.extents.xmin, this.extents.ymin, 0);
      this.gl.uniform3f(this.uMaximum1, this.extents.xmax, this.extents.ymax, 1);
      this.gl.uniform3f(this.uMinimum2, min1, min2, 0);
      this.gl.uniform3f(this.uMaximum2, max1, max2, 1);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.dataBuffer2);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
      this.gl.vertexAttribPointer(this.programs.ruse.aVertexPosition2, this.dataBuffer2.itemSize, this.gl.FLOAT, false, 0, 0);
      this["switch"] = 1;
    } else {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.dataBuffer1);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
      this.gl.vertexAttribPointer(this.programs.ruse.aVertexPosition1, this.dataBuffer1.itemSize, this.gl.FLOAT, false, 0, 0);
      this.gl.uniform3f(this.uMinimum1, min1, min2, 0);
      this.gl.uniform3f(this.uMaximum1, max1, max2, 1);
      this.gl.uniform3f(this.uMinimum2, this.extents.xmin, this.extents.ymin, 0);
      this.gl.uniform3f(this.uMaximum2, this.extents.xmax, this.extents.ymax, 1);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.dataBuffer2);
      this.gl.vertexAttribPointer(this.programs.ruse.aVertexPosition2, this.dataBuffer2.itemSize, this.gl.FLOAT, false, 0, 0);
      this["switch"] = 0;
    }
    this.extents = {
      xmin: min1,
      xmax: max1,
      ymin: min2,
      ymax: max2
    };
    this.drawAxes();
    this.drawMode = this.gl.POINTS;
    this.axesCanvas.onmousemove = null;
    return this.animate();
  };

  Ruse = this.astro.Ruse;

  Ruse.prototype.scatter3D = function(data) {
    var datum, i, index, initialVertices, max1, max2, max3, min1, min2, min3, nVertices, range1, range2, range3, vertexSize, vertices, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
    if (this.state !== "scatter3D") {
      this["switch"] = 0;
      this.hasData = false;
    }
    this.state = "scatter3D";
    mat4.perspective(this.pMatrix, 45.0, 1.0, 0.1, 100.0);
    this.translateBy = [0.0, 0.0, -4.0];
    this.gl.uniform1f(this.uZComponent, 1.0);
    vertexSize = 3;
    nVertices = data.length;
    vertices = new Float32Array(vertexSize * nVertices);
    _ref = Object.keys(data[0]), this.key1 = _ref[0], this.key2 = _ref[1], this.key3 = _ref[2];
    _ref1 = this.getExtentFromObjects(data), (_ref2 = _ref1[0], min1 = _ref2[0], min2 = _ref2[1], min3 = _ref2[2]), (_ref3 = _ref1[1], max1 = _ref3[0], max2 = _ref3[1], max3 = _ref3[2]);
    range1 = max1 - min1;
    range2 = max2 - min2;
    range3 = max3 - min3;
    for (index = _i = 0, _len = data.length; _i < _len; index = ++_i) {
      datum = data[index];
      i = vertexSize * index;
      vertices[i] = datum[this.key1];
      vertices[i + 1] = datum[this.key2];
      vertices[i + 2] = datum[this.key3];
    }
    if (!this.hasData) {
      initialVertices = new Float32Array(vertexSize * nVertices);
      for (index = _j = 0, _len1 = data.length; _j < _len1; index = ++_j) {
        datum = data[index];
        i = vertexSize * index;
        initialVertices[i] = datum[this.key1];
        initialVertices[i + 1] = datum[this.key2];
        initialVertices[i + 2] = 0;
      }
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.dataBuffer1);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, initialVertices, this.gl.STATIC_DRAW);
      this.extents = {
        xmin: min1,
        xmax: max1,
        ymin: min2,
        ymax: max2,
        zmin: min3,
        zmax: max3
      };
      this.hasData = true;
    }
    this.dataBuffer1.itemSize = vertexSize;
    this.dataBuffer1.numItems = nVertices;
    this.dataBuffer2.itemSize = vertexSize;
    this.dataBuffer2.numItems = nVertices;
    if (this["switch"] === 0) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.dataBuffer1);
      this.gl.vertexAttribPointer(this.programs.ruse.aVertexPosition1, this.dataBuffer1.itemSize, this.gl.FLOAT, false, 0, 0);
      this.gl.uniform3f(this.uMinimum1, this.extents.xmin, this.extents.ymin, this.extents.zmin);
      this.gl.uniform3f(this.uMaximum1, this.extents.xmax, this.extents.ymax, this.extents.zmax);
      this.gl.uniform3f(this.uMinimum2, min1, min2, min3);
      this.gl.uniform3f(this.uMaximum2, max1, max2, max3);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.dataBuffer2);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
      this.gl.vertexAttribPointer(this.programs.ruse.aVertexPosition2, this.dataBuffer2.itemSize, this.gl.FLOAT, false, 0, 0);
      this["switch"] = 1;
    } else {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.dataBuffer1);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
      this.gl.vertexAttribPointer(this.programs.ruse.aVertexPosition1, this.dataBuffer1.itemSize, this.gl.FLOAT, false, 0, 0);
      this.gl.uniform3f(this.uMinimum1, min1, min2, min3);
      this.gl.uniform3f(this.uMaximum1, max1, max2, max3);
      this.gl.uniform3f(this.uMinimum2, this.extents.xmin, this.extents.ymin, this.extents.zmin);
      this.gl.uniform3f(this.uMaximum2, this.extents.xmax, this.extents.ymax, this.extents.zmax);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.dataBuffer2);
      this.gl.vertexAttribPointer(this.programs.ruse.aVertexPosition2, this.dataBuffer2.itemSize, this.gl.FLOAT, false, 0, 0);
      this["switch"] = 0;
    }
    this.extents = {
      xmin: min1,
      xmax: max1,
      ymin: min2,
      ymax: max2,
      zmin: min3,
      zmax: max3
    };
    this._setupMouseControls();
    this.removeAxes();
    this.drawMode = this.gl.POINTS;
    return this.animate();
  };

  Shaders = {
    vertex: ["attribute vec3 aVertexPosition1;", "attribute vec3 aVertexPosition2;", "uniform mat4 uMVMatrix;", "uniform mat4 uPMatrix;", "uniform float uMargin;", "uniform float uZComponent;", "uniform vec3 uMinimum1;", "uniform vec3 uMaximum1;", "uniform vec3 uMinimum2;", "uniform vec3 uMaximum2;", "uniform float uTime;", "void main(void) {", "gl_PointSize = 1.25;", "float scaleComponent = 2.0 * (1.0 - uMargin);", "float offsetComponent = (uMargin - 1.0);", "vec3 scale = vec3(scaleComponent, scaleComponent, uZComponent * scaleComponent);", "vec3 offset = vec3(offsetComponent, offsetComponent, uZComponent * offsetComponent);", "vec3 range1 = uMaximum1 - uMinimum1;", "vec3 range2 = uMaximum2 - uMinimum2;", "vec3 vertexPosition1 = scale / range1 * (aVertexPosition1 - uMinimum1) + offset;", "vec3 vertexPosition2 = scale / range2 * (aVertexPosition2 - uMinimum2) + offset;", "vec3 vertexPosition = (1.0 - uTime) * vertexPosition1 + uTime * vertexPosition2;", "gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);", "}"].join("\n"),
    axesVertex: ["attribute vec3 aVertexPosition;", "uniform mat4 uMVMatrix;", "uniform mat4 uPMatrix;", "void main(void) {", "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);", "}"].join("\n"),
    fragment: ["precision mediump float;", "void main(void) {", "gl_FragColor = vec4(0.0, 0.4431, 0.8980, 1.0);", "}"].join("\n")
  };

  this.astro.Ruse.Shaders = Shaders;

}).call(this);
