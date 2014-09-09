# utility functions

random = Math.random
TWOPI = Math.PI * 2

getRand = (min, max) ->
  random() * (max - min) + min

WIDTH = 640
HEIGHT = 480

N_BALLS = 20
BALL_R_MIN = 5
BALL_R_MAX = 50
BALL_V_MAX = 10

class Ball
  constructor: (@owner) ->
    @r = getRand BALL_R_MIN, BALL_R_MAX
    [@x, @y] = @owner.getSpace @r
    @vx = getRand -BALL_V_MAX, BALL_V_MAX
    @vy = getRand -BALL_V_MAX, BALL_V_MAX
    @owner.addBall @
    return

  draw: (dc) ->
    dc.beginPath()
    dc.fillStyle = '#aaa'
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



