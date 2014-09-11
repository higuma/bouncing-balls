(function() {
  var BALL_R_MAX, BALL_R_MIN, BALL_SIZE_MAX, BALL_SIZE_MIN, BALL_SIZE_RANGE_MAX, BALL_SIZE_RANGE_MIN, BALL_SIZE_STEP, Ball, BallSpace, ELASTICITY, ELASTICITY_MAX, ELASTICITY_MIN, ELASTICITY_SCALE, ELASTICITY_SCALED, ELASTICITY_STEP, FRAMES_PER_SECOND, GRAVITY, GRAVITY_MAX, GRAVITY_MIN, GRAVITY_SCALE, GRAVITY_SCALED, GRAVITY_STEP, HEIGHT, HEIGHT_MAX, HEIGHT_MIN, HEIGHT_STEP, INITIAL_SPEED_MAX, INITIAL_SPEED_MAX_SCALED, INITIAL_SPEED_MIN, INITIAL_SPEED_MIN_SCALED, INITIAL_SPEED_RANGE_MAX, INITIAL_SPEED_RANGE_MIN, INITIAL_SPEED_SCALE, INITIAL_SPEED_STEP, N_BALLS, N_BALLS_MAX, N_BALLS_MIN, N_BALLS_STEP, RESISTANCE, RESISTANCE_MAX, RESISTANCE_MIN, RESISTANCE_SCALE, RESISTANCE_SCALED, RESISTANCE_STEP, TWOPI, WIDTH, WIDTH_MAX, WIDTH_MIN, WIDTH_STEP, atan2, balls, brightness, canvas, cos, darken, dc, getRand, intervalFunc, intervalId, random, reset, resetSimulation, resize, setBallSize, setElasticity, setGravity, setHeight, setInitialSpeed, setNBalls, setResistance, setWidth, sin, sqrt, startSimulation, stopSimulation;

  random = Math.random;

  sqrt = Math.sqrt;

  sin = Math.sin;

  cos = Math.cos;

  atan2 = Math.atan2;

  TWOPI = Math.PI * 2;

  getRand = function(min, max) {
    return random() * (max - min) + min;
  };

  brightness = function(c) {
    return ((c & 0xFF) + ((c >> 8) & 0xFF) + ((c >> 16) & 0xFF)) / 765;
  };

  darken = function(col, amount) {
    var a, b, g, r;
    a = 1 - amount;
    r = (col & 0xFF) * a;
    g = ((col >> 8) & 0xFF) * a;
    b = ((col >> 16) & 0xFF) * a;
    return (r << 0) + (g << 8) + (b << 16);
  };

  WIDTH = 800;

  WIDTH_MIN = 400;

  WIDTH_MAX = 1600;

  WIDTH_STEP = 50;

  HEIGHT = 400;

  HEIGHT_MIN = 200;

  HEIGHT_MAX = 1000;

  HEIGHT_STEP = 50;

  N_BALLS = 10;

  N_BALLS_MIN = 1;

  N_BALLS_MAX = 40;

  N_BALLS_STEP = 1;

  BALL_R_MIN = 10;

  BALL_R_MAX = 40;

  BALL_SIZE_MIN = 20;

  BALL_SIZE_MAX = 80;

  BALL_SIZE_RANGE_MIN = 10;

  BALL_SIZE_RANGE_MAX = 100;

  BALL_SIZE_STEP = 1;

  INITIAL_SPEED_MIN = 20;

  INITIAL_SPEED_MAX = 80;

  INITIAL_SPEED_RANGE_MIN = 0;

  INITIAL_SPEED_RANGE_MAX = 100;

  INITIAL_SPEED_STEP = 5;

  INITIAL_SPEED_SCALE = 0.1;

  INITIAL_SPEED_MIN_SCALED = INITIAL_SPEED_MIN * INITIAL_SPEED_SCALE;

  INITIAL_SPEED_MAX_SCALED = INITIAL_SPEED_MAX * INITIAL_SPEED_SCALE;

  GRAVITY = 0;

  GRAVITY_MIN = 0;

  GRAVITY_MAX = 50;

  GRAVITY_STEP = 1;

  GRAVITY_SCALE = 0.02;

  GRAVITY_SCALED = GRAVITY_SCALE * GRAVITY;

  ELASTICITY = 50;

  ELASTICITY_MIN = 0;

  ELASTICITY_MAX = 50;

  ELASTICITY_STEP = 1;

  ELASTICITY_SCALE = 0.02;

  ELASTICITY_SCALED = ELASTICITY_SCALE * ELASTICITY;

  RESISTANCE = 0;

  RESISTANCE_MIN = 0;

  RESISTANCE_MAX = 40;

  RESISTANCE_STEP = 1;

  RESISTANCE_SCALE = 0.01;

  RESISTANCE_SCALED = RESISTANCE_SCALE * RESISTANCE;

  FRAMES_PER_SECOND = 30;

  Ball = (function() {
    function Ball(owner) {
      var angle, vel, _ref;
      this.owner = owner;
      this.r = getRand(BALL_SIZE_MIN, BALL_SIZE_MAX) / 2;
      _ref = this.owner.getSpace(this.r), this.x = _ref[0], this.y = _ref[1];
      vel = getRand(INITIAL_SPEED_MIN_SCALED, INITIAL_SPEED_MAX_SCALED);
      angle = getRand(0, TWOPI);
      this.vx = vel * cos(angle);
      this.vy = vel * sin(angle);
      this.m = this.r / BALL_R_MAX;
      this.owner.addBall(this);
      this.initRandomColor();
      this;
    }

    Ball.prototype.initRandomColor = function() {
      var innerCol, innerRgb, outerCol, outerRgb;
      innerCol = 0;
      while (brightness(innerCol) < 0.75) {
        innerCol = random() * 0xffffff >> 0;
      }
      outerCol = darken(innerCol, 0.5);
      innerRgb = innerCol.toString(16);
      outerRgb = outerCol.toString(16);
      this.innerColor = '#000000'.slice(0, 7 - innerRgb.length) + innerRgb;
      this.outerColor = '#000000'.slice(0, 7 - outerRgb.length) + outerRgb;
      return this;
    };

    Ball.prototype.speed = function() {
      return sqrt(this.vx * this.vx + this.vy * this.vy);
    };

    Ball.prototype.rotate = function(angle) {
      var c, s, vx, vy;
      vx = this.vx;
      vy = this.vy;
      c = cos(angle);
      s = sin(angle);
      this.vx = vx * c - vy * s;
      this.vy = vx * s + vy * c;
      return this;
    };

    Ball.prototype.draw = function(dc) {
      var grad;
      dc.beginPath();
      grad = dc.createRadialGradient(this.x, this.y, this.r, this.x - this.r / 4, this.y - this.r / 4, this.r / 8);
      grad.addColorStop(0, this.outerColor);
      grad.addColorStop(1, this.innerColor);
      dc.fillStyle = grad;
      dc.arc(this.x, this.y, this.r, 0, TWOPI);
      dc.fill();
      dc.closePath();
      return this;
    };

    return Ball;

  })();

  BallSpace = (function() {
    function BallSpace() {
      this.balls = [];
      this;
    }

    BallSpace.prototype.addBall = function(ball) {
      this.balls.push(ball);
      return this;
    };

    BallSpace.prototype.draw = function(dc) {
      var ball, _i, _len, _ref;
      this.drawBackground(dc);
      _ref = this.balls;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ball = _ref[_i];
        ball.draw(dc);
      }
      return this;
    };

    BallSpace.prototype.drawBackground = function(dc) {
      dc.fillStyle = '#fafafa';
      dc.fillRect(0, 0, WIDTH, HEIGHT);
      return this;
    };

    BallSpace.prototype.isntOverlap = function(x, y, r) {
      var ball, dx, dy, rr, _i, _len, _ref;
      _ref = this.balls;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ball = _ref[_i];
        rr = r + ball.r;
        dx = x - ball.x;
        dy = y - ball.y;
        if (dx * dx + dy * dy < rr * rr) {
          return false;
        }
      }
      return true;
    };

    BallSpace.prototype.getSpace = function(r) {
      var i, x, y, _i;
      for (i = _i = 0; _i < 1000; i = ++_i) {
        x = getRand(r, WIDTH - r);
        y = getRand(r, HEIGHT - r);
        if (this.isntOverlap(x, y, r)) {
          return [x, y];
        }
      }
      throw "Cannot keep space";
    };

    BallSpace.prototype.moveBalls = function() {
      var a, ball, vy0, y0, _i, _len, _ref;
      _ref = this.balls;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ball = _ref[_i];
        ball.vx *= 1 - RESISTANCE_SCALED;
        ball.x += ball.vx;
        if (ball.x < ball.r) {
          ball.vx = -ball.vx * ELASTICITY_SCALED;
          ball.x = 2 * ball.r - ball.x;
        } else if (ball.x >= WIDTH - ball.r) {
          ball.vx = -ball.vx * ELASTICITY_SCALED;
          ball.x = 2 * (WIDTH - ball.r) - ball.x;
        }
        vy0 = ball.vy *= 1 - RESISTANCE_SCALED;
        ball.vy += GRAVITY_SCALED;
        y0 = ball.y;
        ball.y += ball.vy;
        if (ball.y >= HEIGHT - ball.r) {
          a = (HEIGHT - ball.r - y0) / (ball.y - y0) * GRAVITY_SCALED;
          ball.vy = -(vy0 + a) * ELASTICITY_SCALED;
          ball.y = HEIGHT - ball.r;
        } else if (ball.y < ball.r) {
          ball.vy = -ball.vy * ELASTICITY_SCALED;
          ball.y = 2 * ball.r - ball.y;
        }
      }
      return this;
    };

    BallSpace.prototype.bounce = function(b1, b2) {
      var angle, diffA1, diffA2, diffM, totalM, v1, v2, vx1, vx2;
      angle = atan2(b1.y - b2.y, b1.x - b2.x);
      v1 = b1.speed() * ELASTICITY_SCALED;
      v2 = b2.speed() * ELASTICITY_SCALED;
      diffA1 = atan2(b1.vy, b1.vx) - angle;
      diffA2 = atan2(b2.vy, b2.vx) - angle;
      vx1 = v1 * cos(diffA1);
      vx2 = v2 * cos(diffA2);
      b1.vy = v1 * sin(diffA1);
      b2.vy = v2 * sin(diffA2);
      totalM = b1.m + b2.m;
      diffM = b1.m - b2.m;
      b1.vx = (diffM * vx1 + 2 * b2.m * vx2) / totalM;
      b2.vx = (-diffM * vx2 + 2 * b1.m * vx1) / totalM;
      b1.rotate(angle);
      b2.rotate(angle);
      return this;
    };

    BallSpace.prototype.bounceAll = function() {
      var a, b1, b2, d, dd, dx, dy, i, j, rr, _i, _j, _ref, _ref1, _ref2;
      for (i = _i = 0, _ref = this.balls.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        b1 = this.balls[i];
        for (j = _j = _ref1 = i + 1, _ref2 = this.balls.length; _ref1 <= _ref2 ? _j < _ref2 : _j > _ref2; j = _ref1 <= _ref2 ? ++_j : --_j) {
          b2 = this.balls[j];
          dx = b2.x - b1.x;
          dy = b2.y - b1.y;
          rr = b1.r + b2.r;
          if ((dd = dx * dx + dy * dy) < rr * rr) {
            d = sqrt(dd);
            a = (b1.r + b2.r - d) / d;
            b1.x -= dx * a;
            b1.y -= dy * a;
            this.bounce(b1, b2);
          }
        }
      }
      return this;
    };

    return BallSpace;

  })();

  balls = null;

  reset = function() {
    var i, _i;
    balls = new BallSpace;
    for (i = _i = 0; 0 <= N_BALLS ? _i < N_BALLS : _i > N_BALLS; i = 0 <= N_BALLS ? ++_i : --_i) {
      new Ball(balls);
    }
    balls.draw(dc);
  };

  resize = function() {
    $('#canvas').attr({
      width: WIDTH,
      height: HEIGHT
    });
    reset();
  };

  canvas = document.getElementById('canvas');

  dc = canvas.getContext('2d');

  resize();

  intervalFunc = function() {
    balls.moveBalls();
    balls.bounceAll();
    balls.draw(dc);
  };

  intervalId = null;

  startSimulation = function() {
    if (intervalId == null) {
      intervalId = window.setInterval(intervalFunc, 1000 / FRAMES_PER_SECOND);
    }
  };

  stopSimulation = function() {
    if (intervalId != null) {
      window.clearInterval(intervalId);
    }
    intervalId = null;
  };

  resetSimulation = function() {
    stopSimulation();
    return reset();
  };

  setWidth = function(w) {
    WIDTH = w;
    $('#widthValue').html(WIDTH);
    return resize();
  };

  setHeight = function(h) {
    HEIGHT = h;
    $('#heightValue').html(HEIGHT);
    return resize();
  };

  setNBalls = function(n) {
    N_BALLS = n;
    $('#nBallsValue').html(N_BALLS);
    return reset();
  };

  setBallSize = function(szMin, szMax) {
    BALL_SIZE_MIN = szMin;
    BALL_SIZE_MAX = szMax;
    $('#ballSizeValue').html("" + BALL_SIZE_MIN + "-" + BALL_SIZE_MAX);
    return reset();
  };

  setInitialSpeed = function(spMin, spMax) {
    INITIAL_SPEED_MIN = spMin;
    INITIAL_SPEED_MAX = spMax;
    INITIAL_SPEED_MIN_SCALED = INITIAL_SPEED_MIN * INITIAL_SPEED_SCALE;
    INITIAL_SPEED_MAX_SCALED = INITIAL_SPEED_MAX * INITIAL_SPEED_SCALE;
    $('#initialSpeedValue').html("" + (INITIAL_SPEED_MIN_SCALED.toFixed(1)) + "-" + (INITIAL_SPEED_MAX_SCALED.toFixed(1)));
    return reset();
  };

  setGravity = function(g) {
    GRAVITY = g;
    GRAVITY_SCALED = GRAVITY * GRAVITY_SCALE;
    $('#gravityValue').html(GRAVITY_SCALED.toFixed(2));
  };

  setElasticity = function(e) {
    ELASTICITY = e;
    ELASTICITY_SCALED = ELASTICITY * ELASTICITY_SCALE;
    $('#elasticityValue').html(ELASTICITY_SCALED.toFixed(2));
  };

  setResistance = function(r) {
    RESISTANCE = r;
    RESISTANCE_SCALED = RESISTANCE * RESISTANCE_SCALE;
    $('#resistanceValue').html(RESISTANCE_SCALED.toFixed(2));
  };

  $('#widthValue').html(WIDTH);

  $('#widthSlider').slider({
    min: WIDTH_MIN,
    max: WIDTH_MAX,
    value: WIDTH,
    step: WIDTH_STEP,
    slide: function(event, ui) {
      return setWidth(ui.value);
    }
  });

  $('#heightValue').html(HEIGHT);

  $('#heightSlider').slider({
    min: HEIGHT_MIN,
    max: HEIGHT_MAX,
    value: HEIGHT,
    step: HEIGHT_STEP,
    slide: function(event, ui) {
      return setHeight(ui.value);
    }
  });

  $('#nBallsValue').html(N_BALLS);

  $('#nBallsSlider').slider({
    min: N_BALLS_MIN,
    max: N_BALLS_MAX,
    value: N_BALLS,
    step: N_BALLS_STEP,
    slide: function(event, ui) {
      return setNBalls(ui.value);
    }
  });

  $('#ballSizeValue').html("" + BALL_SIZE_MIN + "-" + BALL_SIZE_MAX);

  $('#ballSizeSlider').slider({
    min: BALL_SIZE_RANGE_MIN,
    max: BALL_SIZE_RANGE_MAX,
    range: true,
    values: [BALL_SIZE_MIN, BALL_SIZE_MAX],
    step: BALL_SIZE_STEP,
    slide: function(event, ui) {
      return setBallSize(ui.values[0], ui.values[1]);
    }
  });

  $('#initialSpeedValue').html("" + (INITIAL_SPEED_MIN_SCALED.toFixed(1)) + "-" + (INITIAL_SPEED_MAX_SCALED.toFixed(1)));

  $('#initialSpeedSlider').slider({
    min: INITIAL_SPEED_RANGE_MIN,
    max: INITIAL_SPEED_RANGE_MAX,
    range: true,
    values: [INITIAL_SPEED_MIN, INITIAL_SPEED_MAX],
    step: INITIAL_SPEED_STEP,
    slide: function(event, ui) {
      return setInitialSpeed(ui.values[0], ui.values[1]);
    }
  });

  $('#gravityValue').html(GRAVITY_SCALED.toFixed(2));

  $('#gravitySlider').slider({
    min: GRAVITY_MIN,
    max: GRAVITY_MAX,
    value: GRAVITY,
    step: GRAVITY_STEP,
    slide: function(event, ui) {
      return setGravity(ui.value);
    }
  });

  $('#elasticityValue').html(ELASTICITY_SCALED.toFixed(2));

  $('#elasticitySlider').slider({
    min: ELASTICITY_MIN,
    max: ELASTICITY_MAX,
    value: ELASTICITY,
    step: ELASTICITY_STEP,
    slide: function(event, ui) {
      return setElasticity(ui.value);
    }
  });

  $('#resistanceValue').html(RESISTANCE_SCALED.toFixed(2));

  $('#resistanceSlider').slider({
    min: RESISTANCE_MIN,
    max: RESISTANCE_MAX,
    value: RESISTANCE,
    step: RESISTANCE_STEP,
    slide: function(event, ui) {
      return setResistance(ui.value);
    }
  });

  $('#resetButton').button({
    text: true,
    icons: {
      primary: 'ui-icon-seek-start'
    }
  }).click(function() {
    return resetSimulation();
  });

  $('#startButton').button({
    text: true,
    icons: {
      primary: 'ui-icon-play'
    }
  }).click(function() {
    return startSimulation();
  });

  $('#stopButton').button({
    text: true,
    icons: {
      primary: 'ui-icon-stop'
    }
  }).click(function() {
    console.log("STOP");
    return stopSimulation();
  });

  resetSimulation();

}).call(this);
