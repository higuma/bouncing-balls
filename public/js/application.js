(function() {
  var BALL_R_MAX, BALL_R_MIN, BALL_V_MAX, Ball, BallContainer, HEIGHT, N_BALLS, TWOPI, WIDTH, balls, canvas, dc, getRand, i, random, _i;

  random = Math.random;

  TWOPI = Math.PI * 2;

  getRand = function(min, max) {
    return random() * (max - min) + min;
  };

  WIDTH = 640;

  HEIGHT = 480;

  N_BALLS = 20;

  BALL_R_MIN = 5;

  BALL_R_MAX = 50;

  BALL_V_MAX = 10;

  Ball = (function() {
    function Ball(owner) {
      var _ref;
      this.owner = owner;
      this.r = getRand(BALL_R_MIN, BALL_R_MAX);
      _ref = this.owner.getSpace(this.r), this.x = _ref[0], this.y = _ref[1];
      this.vx = getRand(-BALL_V_MAX, BALL_V_MAX);
      this.vy = getRand(-BALL_V_MAX, BALL_V_MAX);
      this.owner.addBall(this);
      return;
    }

    Ball.prototype.draw = function(dc) {
      dc.beginPath();
      dc.fillStyle = '#aaa';
      dc.arc(this.x, this.y, this.r, 0, TWOPI);
      dc.fill();
      dc.closePath();
      return this;
    };

    return Ball;

  })();

  BallContainer = (function() {
    function BallContainer() {
      this.balls = [];
      this;
    }

    BallContainer.prototype.addBall = function(ball) {
      this.balls.push(ball);
      return this;
    };

    BallContainer.prototype.draw = function(dc) {
      var ball, _i, _len, _ref;
      _ref = this.balls;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ball = _ref[_i];
        ball.draw(dc);
      }
      return this;
    };

    BallContainer.prototype.isntOverlap = function(x, y, r) {
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

    BallContainer.prototype.getSpace = function(r) {
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

    return BallContainer;

  })();

  canvas = document.getElementById('canvas');

  dc = canvas.getContext('2d');

  dc.fillStyle = '#fafafa';

  dc.fillRect(0, 0, WIDTH, HEIGHT);

  balls = new BallContainer;

  for (i = _i = 0; 0 <= N_BALLS ? _i < N_BALLS : _i > N_BALLS; i = 0 <= N_BALLS ? ++_i : --_i) {
    new Ball(balls);
  }

  balls.draw(dc);

}).call(this);
