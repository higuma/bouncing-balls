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

# parameters and ranges
WIDTH = 800
WIDTH_MIN = 400
WIDTH_MAX = 1600
WIDTH_STEP = 50

HEIGHT = 400
HEIGHT_MIN = 200
HEIGHT_MAX = 1000
HEIGHT_STEP = 50

N_BALLS = 10
N_BALLS_MIN = 1
N_BALLS_MAX = 40
N_BALLS_STEP = 1

BALL_R_MIN = 10
BALL_R_MAX = 40

BALL_SIZE_MIN = 20
BALL_SIZE_MAX = 80
BALL_SIZE_RANGE_MIN = 10
BALL_SIZE_RANGE_MAX = 100
BALL_SIZE_STEP = 1

INITIAL_SPEED_MIN = 20
INITIAL_SPEED_MAX = 80
INITIAL_SPEED_RANGE_MIN = 0
INITIAL_SPEED_RANGE_MAX = 100
INITIAL_SPEED_STEP = 5
INITIAL_SPEED_SCALE = 0.1
INITIAL_SPEED_MIN_SCALED = INITIAL_SPEED_MIN * INITIAL_SPEED_SCALE
INITIAL_SPEED_MAX_SCALED = INITIAL_SPEED_MAX * INITIAL_SPEED_SCALE

GRAVITY = 0
GRAVITY_MIN = 0
GRAVITY_MAX = 50
GRAVITY_STEP = 1
GRAVITY_SCALE = 0.02
GRAVITY_SCALED = GRAVITY_SCALE * GRAVITY

ELASTICITY = 50
ELASTICITY_MIN = 0
ELASTICITY_MAX = 50
ELASTICITY_STEP = 1
ELASTICITY_SCALE = 0.02
ELASTICITY_SCALED = ELASTICITY_SCALE * ELASTICITY

RESISTANCE = 0
RESISTANCE_MIN = 0
RESISTANCE_MAX = 40
RESISTANCE_STEP = 1
RESISTANCE_SCALE = 0.01
RESISTANCE_SCALED = RESISTANCE_SCALE * RESISTANCE

FRAMES_PER_SECOND = 30

class Ball
  constructor: (@owner) ->
    @r = getRand(BALL_SIZE_MIN, BALL_SIZE_MAX) / 2
    [@x, @y] = @owner.getSpace @r
    vel = getRand INITIAL_SPEED_MIN_SCALED, INITIAL_SPEED_MAX_SCALED
    angle = getRand 0, TWOPI
    @vx = vel * cos(angle)
    @vy = vel * sin(angle)
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
      ball.vx *= 1 - RESISTANCE_SCALED
      ball.x += ball.vx
      if ball.x < ball.r
        ball.vx = -ball.vx * ELASTICITY_SCALED
        ball.x = 2 * ball.r - ball.x
      else if ball.x >= WIDTH - ball.r
        ball.vx = -ball.vx * ELASTICITY_SCALED
        ball.x = 2 * (WIDTH - ball.r) - ball.x

      vy0 = ball.vy *= 1 - RESISTANCE_SCALED
      ball.vy += GRAVITY_SCALED
      y0 = ball.y
      ball.y += ball.vy
      if ball.y >= HEIGHT - ball.r      # bound on the ground
        a = (HEIGHT - ball.r - y0) / (ball.y - y0) * GRAVITY_SCALED
        ball.vy = -(vy0 + a) * ELASTICITY_SCALED
        ball.y = HEIGHT - ball.r
      else if ball.y < ball.r
        ball.vy = -ball.vy * ELASTICITY_SCALED
        ball.y = 2 * ball.r - ball.y
    @

  bounce: (b1, b2) ->
    angle = atan2 b1.y - b2.y, b1.x - b2.x
    v1 = b1.speed() * ELASTICITY_SCALED
    v2 = b2.speed() * ELASTICITY_SCALED
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

# simulator
balls = null

reset = ->
  balls = new BallSpace
  new Ball balls for i in [0...N_BALLS]
  balls.draw dc
  return

resize = ->
  $('#canvas').attr width: WIDTH, height: HEIGHT
  reset()
  return

canvas = document.getElementById 'canvas'
dc = canvas.getContext '2d'
resize()

intervalFunc = ->
  balls.moveBalls()
  balls.bounceAll()
  balls.draw dc
  return

intervalId = null

startSimulation = ->
  unless intervalId?
    intervalId = window.setInterval intervalFunc, 1000 / FRAMES_PER_SECOND
  return

stopSimulation = ->
  window.clearInterval intervalId if intervalId?
  intervalId = null
  return

resetSimulation = ->
  stopSimulation()
  reset()

# parameter setters
setWidth = (w) ->
  WIDTH = w
  $('#widthValue').html WIDTH
  resize()

setHeight = (h) ->
  HEIGHT = h
  $('#heightValue').html HEIGHT
  resize()

setNBalls = (n) ->
  N_BALLS = n
  $('#nBallsValue').html N_BALLS
  reset()

setBallSize = (szMin, szMax) ->
  BALL_SIZE_MIN = szMin
  BALL_SIZE_MAX = szMax
  $('#ballSizeValue').html "#{BALL_SIZE_MIN}-#{BALL_SIZE_MAX}"
  reset()

setInitialSpeed = (spMin, spMax) ->
  INITIAL_SPEED_MIN = spMin
  INITIAL_SPEED_MAX = spMax
  INITIAL_SPEED_MIN_SCALED = INITIAL_SPEED_MIN * INITIAL_SPEED_SCALE
  INITIAL_SPEED_MAX_SCALED = INITIAL_SPEED_MAX * INITIAL_SPEED_SCALE
  $('#initialSpeedValue').html "#{INITIAL_SPEED_MIN_SCALED.toFixed(1)}-#{INITIAL_SPEED_MAX_SCALED.toFixed(1)}"
  reset()

setGravity= (g) ->
  GRAVITY = g
  GRAVITY_SCALED = GRAVITY * GRAVITY_SCALE
  $('#gravityValue').html GRAVITY_SCALED.toFixed(2)
  return

setElasticity = (e) ->
  ELASTICITY = e
  ELASTICITY_SCALED = ELASTICITY * ELASTICITY_SCALE
  $('#elasticityValue').html ELASTICITY_SCALED.toFixed(2)
  return

setResistance = (r) ->
  RESISTANCE = r
  RESISTANCE_SCALED = RESISTANCE * RESISTANCE_SCALE
  $('#resistanceValue').html RESISTANCE_SCALED.toFixed(2)
  return

# setup jQuery UI widgets
$('#widthValue').html WIDTH
$('#widthSlider').slider
  min: WIDTH_MIN
  max: WIDTH_MAX
  value: WIDTH
  step: WIDTH_STEP
  slide: (event, ui) -> setWidth ui.value

$('#heightValue').html HEIGHT
$('#heightSlider').slider
  min: HEIGHT_MIN
  max: HEIGHT_MAX
  value: HEIGHT
  step: HEIGHT_STEP
  slide: (event, ui) -> setHeight ui.value

$('#nBallsValue').html N_BALLS
$('#nBallsSlider').slider
  min: N_BALLS_MIN
  max: N_BALLS_MAX
  value: N_BALLS
  step: N_BALLS_STEP
  slide: (event, ui) -> setNBalls ui.value

$('#ballSizeValue').html "#{BALL_SIZE_MIN}-#{BALL_SIZE_MAX}"
$('#ballSizeSlider').slider
  min: BALL_SIZE_RANGE_MIN
  max: BALL_SIZE_RANGE_MAX
  range: true
  values: [BALL_SIZE_MIN, BALL_SIZE_MAX]
  step: BALL_SIZE_STEP
  slide: (event, ui) -> setBallSize ui.values[0], ui.values[1]

$('#initialSpeedValue').html "#{INITIAL_SPEED_MIN_SCALED.toFixed(1)}-#{INITIAL_SPEED_MAX_SCALED.toFixed(1)}"
$('#initialSpeedSlider').slider
  min: INITIAL_SPEED_RANGE_MIN
  max: INITIAL_SPEED_RANGE_MAX
  range: true
  values: [INITIAL_SPEED_MIN, INITIAL_SPEED_MAX]
  step: INITIAL_SPEED_STEP
  slide: (event, ui) -> setInitialSpeed ui.values[0], ui.values[1]

$('#gravityValue').html GRAVITY_SCALED.toFixed(2)
$('#gravitySlider').slider
  min: GRAVITY_MIN
  max: GRAVITY_MAX
  value: GRAVITY
  step: GRAVITY_STEP
  slide: (event, ui) -> setGravity ui.value

$('#elasticityValue').html ELASTICITY_SCALED.toFixed(2)
$('#elasticitySlider').slider
  min: ELASTICITY_MIN
  max: ELASTICITY_MAX
  value: ELASTICITY
  step: ELASTICITY_STEP
  slide: (event, ui) -> setElasticity ui.value

$('#resistanceValue').html RESISTANCE_SCALED.toFixed(2)
$('#resistanceSlider').slider
  min: RESISTANCE_MIN
  max: RESISTANCE_MAX
  value: RESISTANCE
  step: RESISTANCE_STEP
  slide: (event, ui) -> setResistance ui.value

$('#resetButton')
  .button
    text: true
    icons:
      primary: 'ui-icon-seek-start'
  .click -> resetSimulation()

$('#startButton')
  .button
    text: true
    icons:
      primary: 'ui-icon-play'
  .click -> startSimulation()

$('#stopButton')
  .button
    text: true
    icons:
      primary: 'ui-icon-stop'
  .click -> stopSimulation()

# initialize simulation
resetSimulation()
