# utility functions

random = Math.random
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

N_BALLS = 25
BALL_R_MIN = 5
BALL_R_MAX = 40
BALL_V_MAX = 10

class Ball
  constructor: (@owner) ->
    @r = getRand BALL_R_MIN, BALL_R_MAX
    [@x, @y] = @owner.getSpace @r
    @vx = getRand -BALL_V_MAX, BALL_V_MAX
    @vy = getRand -BALL_V_MAX, BALL_V_MAX
    @owner.addBall @
    @initRandomColor()

  initRandomColor: ->
    innerCol = 0
    while brightness(innerCol) < 0.5
      innerCol = random() * 0xffffff >> 0
    outerCol = darken innerCol, 0.4

    innerRgb = innerCol.toString 16
    outerRgb = outerCol.toString 16
    @innerColor = '#000000'.slice(0, 7 - innerRgb.length) + innerRgb
    @outerColor = '#000000'.slice(0, 7 - outerRgb.length) + outerRgb
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

class BallContainer
  constructor: ->
    @balls = []
    @

  addBall: (ball) ->
    @balls.push ball
    @

  draw: (dc) ->
    ball.draw dc for ball in @balls
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

canvas = document.getElementById 'canvas'
dc = canvas.getContext '2d'

dc.fillStyle = '#fafafa'
dc.fillRect 0, 0, WIDTH, HEIGHT

balls = new BallContainer
new Ball balls for i in [0...N_BALLS]

balls.draw(dc)



