(function() {
  var BALL_R_MAX, BALL_R_MIN, BALL_V_MAX, Ball, BallSpace, FRAMES_PER_SECOND, FRICTION, GRAVITY, HEIGHT, N_BALLS, TWOPI, WIDTH, atan2, balls, brightness, canvas, cos, darken, dc, getRand, i, intervalFunc, random, sin, sqrt, _i;

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

  WIDTH = 640;

  HEIGHT = 480;

  N_BALLS = 10;

  BALL_R_MIN = 10;

  BALL_R_MAX = 50;

  BALL_V_MAX = 3;

  GRAVITY = 0.5;

  FRICTION = 0.02;

  FRAMES_PER_SECOND = 30;

  Ball = (function() {
    function Ball(owner) {
      var _ref;
      this.owner = owner;
      this.r = getRand(BALL_R_MIN, BALL_R_MAX);
      _ref = this.owner.getSpace(this.r), this.x = _ref[0], this.y = _ref[1];
      this.vx = getRand(-BALL_V_MAX, BALL_V_MAX);
      this.vy = getRand(-BALL_V_MAX, BALL_V_MAX);
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
      var ball, _i, _len, _ref;
      _ref = this.balls;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ball = _ref[_i];
        ball.vx *= 1 - FRICTION;
        ball.vy *= 1 - FRICTION;
        ball.vy += GRAVITY;
        ball.x += ball.vx;
        if (ball.x < ball.r) {
          ball.vx = -ball.vx;
          ball.x = 2 * ball.r - ball.x;
        } else if (ball.x >= WIDTH - ball.r) {
          ball.x = 2 * (WIDTH - ball.r) - ball.x;
          ball.vx = -ball.vx;
        }
        ball.y += ball.vy;
        if (ball.y < ball.r) {
          ball.vy = -ball.vy;
          ball.y = 2 * ball.r - ball.y;
        } else if (ball.y >= HEIGHT - ball.r) {
          ball.y = 2 * (HEIGHT - ball.r) - ball.y;
          ball.vy = -ball.vy;
        }
      }
      return this;
    };

    BallSpace.prototype.bounce = function(b1, b2) {
      var angle, diffA1, diffA2, diffM, totalM, v1, v2, vx1, vx2;
      angle = atan2(b1.y - b2.y, b1.x - b2.x);
      v1 = b1.speed();
      v2 = b2.speed();
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

  canvas = document.getElementById('canvas');

  dc = canvas.getContext('2d');

  balls = new BallSpace;

  for (i = _i = 0; 0 <= N_BALLS ? _i < N_BALLS : _i > N_BALLS; i = 0 <= N_BALLS ? ++_i : --_i) {
    new Ball(balls);
  }

  intervalFunc = function() {
    balls.moveBalls();
    balls.bounceAll();
    balls.draw(dc);
  };

  window.setInterval(intervalFunc, 1000 / FRAMES_PER_SECOND);

}).call(this);
