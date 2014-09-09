random = Math.random
sqrt = Math.sqrt
sin = Math.sin
cos = Math.cos
atan2 = Math.atan2
TWOPI = Math.PI * 2

getRand = (min, max) ->
  random() * (max - min) + min

brightness = (c) ->
  # 765 = 255 * 3
  ((c & 0xFF) + ((c >> 8) & 0xFF) + ((c >> 16) & 0xFF)) / 765

darken = (col, amount) ->
  a = 1 - amount
  r = (col & 0xFF) * a
  g = ((col >> 8) & 0xFF) * a
  b = ((col >> 16) & 0xFF) * a
  (r << 0) + (g << 8) + (b << 16)

WIDTH = 640
HEIGHT = 480

N_BALLS = 10
BALL_R_MIN = 10
BALL_R_MAX = 50
BALL_V_MAX = 3

GRAVITY = 0.5
FRICTION = 0.02

FRAMES_PER_SECOND = 30

class Ball
  constructor: (@owner) ->
    @r = getRand BALL_R_MIN, BALL_R_MAX
    [@x, @y] = @owner.getSpace @r
    @vx = getRand -BALL_V_MAX, BALL_V_MAX
    @vy = getRand -BALL_V_MAX, BALL_V_MAX
    @m = @r / BALL_R_MAX
    @owner.addBall @
    @initRandomColor()
    @

  initRandomColor: ->
    innerCol = 0
    while brightness(innerCol) < 0.75
      innerCol = random() * 0xffffff >> 0
    outerCol = darken innerCol, 0.5

    innerRgb = innerCol.toString 16
    outerRgb = outerCol.toString 16
    @innerColor = '#000000'.slice(0, 7 - innerRgb.length) + innerRgb
    @outerColor = '#000000'.slice(0, 7 - outerRgb.length) + outerRgb
    @

  speed: -> sqrt @vx * @vx + @vy * @vy

  rotate: (angle) ->
    vx = @vx
    vy = @vy
    c = cos angle
    s = sin angle
    @vx = vx * c - vy * s
    @vy = vx * s + vy * c
    @

  draw: (dc) ->
    dc.beginPath()
    grad = dc.createRadialGradient @x, @y, @r, @x - @r/4, @y - @r/4, @r/8
    grad.addColorStop 0, @outerColor
    grad.addColorStop 1, @innerColor
    dc.fillStyle = grad
    dc.arc @x, @y, @r, 0, TWOPI
    dc.fill()
    dc.closePath()
    @

class BallSpace
  constructor: ->
    @balls = []
    @

  addBall: (ball) ->
    @balls.push ball
    @

  draw: (dc) ->
    @drawBackground dc
    ball.draw dc for ball in @balls
    @

  drawBackground: (dc) ->
    dc.fillStyle = '#fafafa'
    dc.fillRect 0, 0, WIDTH, HEIGHT
    @

  isntOverlap: (x, y, r) ->
    for ball in @balls
      rr = r + ball.r
      dx = x - ball.x
      dy = y - ball.y
      return false if dx * dx + dy * dy < rr * rr
    true

  getSpace: (r) ->
    for i in [0...1000]
      x = getRand r, WIDTH - r
      y = getRand r, HEIGHT - r
      return [x, y] if @isntOverlap x, y, r
    throw "Cannot keep space"

  moveBalls: ->
    for ball in @balls
      ball.vx *= 1 - FRICTION
      ball.vy *= 1 - FRICTION
      ball.vy += GRAVITY
      ball.x += ball.vx
      if ball.x < ball.r
        ball.vx = -ball.vx
        ball.x = 2 * ball.r - ball.x
      else if ball.x >= WIDTH - ball.r
        ball.x = 2 * (WIDTH - ball.r) - ball.x
        ball.vx = -ball.vx
      ball.y += ball.vy
      if ball.y < ball.r
        ball.vy = -ball.vy
        ball.y = 2 * ball.r - ball.y
      else if ball.y >= HEIGHT - ball.r
        ball.y = 2 * (HEIGHT - ball.r) - ball.y
        ball.vy = -ball.vy
    @

  bounce: (b1, b2) ->
    angle = atan2 b1.y - b2.y, b1.x - b2.x
    v1 = b1.speed()
    v2 = b2.speed()
    diffA1 = atan2(b1.vy, b1.vx) - angle
    diffA2 = atan2(b2.vy, b2.vx) - angle
    vx1 = v1 * cos diffA1
    vx2 = v2 * cos diffA2
    b1.vy = v1 * sin diffA1
    b2.vy = v2 * sin diffA2
    totalM = b1.m + b2.m
    diffM = b1.m - b2.m
    b1.vx = ( diffM * vx1 + 2 * b2.m * vx2) / totalM
    b2.vx = (-diffM * vx2 + 2 * b1.m * vx1) / totalM
    b1.rotate angle
    b2.rotate angle
    @

  bounceAll: ->
    for i in [0 ... @balls.length]
      b1 = @balls[i]
      for j in [i + 1 ... @balls.length]
        b2 = @balls[j]
        dx = b2.x - b1.x
        dy = b2.y - b1.y
        rr = b1.r + b2.r
        if (dd = dx * dx + dy * dy) < rr * rr
          d = sqrt dd
          a = (b1.r + b2.r - d) / d
          b1.x -= dx * a
          b1.y -= dy * a
          @bounce b1, b2
    @

canvas = document.getElementById 'canvas'
dc = canvas.getContext '2d'

balls = new BallSpace
new Ball balls for i in [0...N_BALLS]

intervalFunc = ->
  balls.moveBalls()
  balls.bounceAll()
  balls.draw dc
  return

window.setInterval intervalFunc, 1000 / FRAMES_PER_SECOND
