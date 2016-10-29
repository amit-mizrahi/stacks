$(function() {

  var Geometry = {
    ELEMENT_WIDTH: 50,
    ELEMENT_HEIGHT: 50,
    ELEMENT_DIST: 50, // Distance between stacks
    MARKER_HEIGHT: 20, // Height of marker underneath each stack
    CANVAS_WIDTH: 350,
    CANVAS_HEIGHT: 500,
    GROUND_HEIGHT: 100,
    STACK_HEIGHT_THRESHOLD: 7 // Max height of any stack before losing game
  }

  var Physics = {
    GRAVITY: 0.5,
    FLIGHT_TIME: 40
  }

  var Key = {
    LEFT_SELECT: 37,
    RIGHT_SELECT: 39,
    LEFT_POP: 90,
    RIGHT_POP: 88
  }

  var Color = {
    RED: 1,
    YELLOW: 2,
    BLUE: 3,
    GREEN: 4,
    PURPLE: 5,
    ORANGE: 6
  }

  var ColorScore = {
    RED: 1,
    BLUE: 2,
    YELLOW: 5,
    GREEN: 10,
    PURPLE: 50,
    ORANGE: 100
  }

  var CanvasColor = {
    RED: '#AF2001',
    YELLOW: '#F1DE55',
    BLUE: '#5595F1',
    GRAY: '#555555',
    BLACK: '#121212',
    BROWN: '#333333',
    CANCEL_COLOR: '#FFFFCC',
    GREEN: '#009933',
    PURPLE: '#4D004D',
    ORANGE: '#FF9900'
  }

  var State = {
      AT_REST: 1,
      IN_MOTION: 2,
      EVALUATING: 3,
      CANCELING: 4
    }

  var Time = {
    CANCELLATION_TIME: 20,
    RANDOM_TIME_THRESHOLD: 1e-5
  }

  var Element = function(color) {
    this.color = color;
    this.x = null;
    this.y = null;
    this.canceling = false;
  }

  Element.prototype.draw = function(ctx) {
    if(this.canceling) {
      ctx.fillStyle = CanvasColor.CANCEL_COLOR;
    }
    else {
      switch(this.color) {
        case Color.RED:
          ctx.fillStyle = CanvasColor.RED;
          break;
        case Color.YELLOW:
          ctx.fillStyle = CanvasColor.YELLOW;
          break;
        case Color.BLUE:
          ctx.fillStyle = CanvasColor.BLUE;
          break;
        case Color.GREEN:
          ctx.fillStyle = CanvasColor.GREEN;
          break;
        case Color.PURPLE:
          ctx.fillStyle = CanvasColor.PURPLE;
          break;
        case Color.ORANGE:
          ctx.fillStyle = CanvasColor.ORANGE;
          break;
        default:
          break;
      }
    }
    ctx.fillRect(this.x, Geometry.CANVAS_WIDTH - this.y, Geometry.ELEMENT_WIDTH, Geometry.ELEMENT_HEIGHT);
  }

  var randomElement = function() {
    var r = Math.random();
    if(r < 0.30) {
      return new Element(Color.RED);
    }
    else if(0.30 <= r && r <= 0.60) {
      return new Element(Color.YELLOW);
    }
    else if(0.60 <= r && r <= 0.90) {
      return new Element(Color.BLUE);
    }
    else if(0.90 <= r && r <= 0.94) {
      return new Element(Color.PURPLE);
    }
    else if(0.94 <= r && r <= 0.97) {
      return new Element(Color.GREEN);
    }
    else {
      return new Element(Color.ORANGE);
    }
  }

  var Stack = function() {
    // Represents a stack of elements as a list
    // "Top" element is the last element
    // (although this is really a deque whose interface is restricted to act as a stack)
    this.elements = [];
  }

  Stack.prototype.push = function(el) {
    this.elements.push(el);
  }

  Stack.prototype.pop = function() {
    if(this.elements != []) {
      return this.elements.pop();
    }
    else {
      return null;
    }
  }

  Stack.prototype.randomlyFill = function() {
    // Fills the stack with a random number (2 < n < 10) of random elements.
    var numElements = Math.floor((Math.random() * 5) + 2);
    for(var i = 0; i < numElements; i++) {
      this.push(randomElement());
    }
  }

  Stack.prototype.enqueue = function(el) {
    // Only accessible to the game, not to the user. Adds an item to the bottom of the stack.
    var newElements = [];
    newElements.push(el);
    for(var i = 0; i < this.size(); i++) {
      newElements.push(this.elements[i]);
    }
    this.elements = newElements;
  }

  Stack.prototype.size = function() {
    return this.elements.length;
  }

  Stack.prototype.peek = function() {
    return this.elements[this.elements.length - 1];
  }

  Stack.prototype.peekTwice = function() {
    return this.elements[this.elements.length - 2];
  }

  var Game = function() {
    this.stacks = [new Stack(), new Stack(), new Stack()]
    this.currentStack = this.stacks[0];
    this.state = State.AT_REST;

    this.time = 0;
    this.score = 0;
    this.lost = false;

    this.motion = {
      sourceStack: null,
      targetStack: null,
      startTime: null
    };
    this.cancellation = {
      startTime: null,
      stack: null
    }

    for(var i = 0; i < this.stacks.length; i++) {
      this.stacks[i].randomlyFill();
    }
  }

  Game.prototype.setupPositions = function() {
    for(var i = 0; i < this.stacks.length; i++) {
      for(var j = 0; j < this.stacks[i].size(); j++) {
        var element = this.stacks[i].elements[j];
        element.x = Geometry.ELEMENT_DIST*(i+1) + Geometry.ELEMENT_WIDTH*i;
        element.y = Geometry.MARKER_HEIGHT + Geometry.ELEMENT_HEIGHT*j;
      }
    }
  }

  Game.prototype.randomlyEnqueue = function() {
    var r = Math.floor(Math.abs(Math.random()*3 - 0.01));
    var randomStack = this.stacks[r];
    randomStack.enqueue(randomElement());
    this.setupPositions();
  }

  Game.prototype.setState = function(state) {
    if(state == State.AT_REST || state == State.IN_MOTION || state == State.CANCELING_OUT) {
      this.state = state;
    }
  }

  Game.prototype.beginMotion = function() {
      this.setState(State.IN_MOTION);
      this.motion.startTime = this.time;
  }

  Game.prototype.drawStacks = function(ctx) {
    // Draws a stack given whether the canvas context, the stack,
    // the "x offset" of the stack, and whether the stack is selected.

    ctx.fillStyle = CanvasColor.BROWN;
    ctx.fillRect(
      0,
      Geometry.CANVAS_HEIGHT - Geometry.GROUND_HEIGHT,
      Geometry.CANVAS_WIDTH,
      Geometry.GROUND_HEIGHT
    );

    for(var i = 0; i < this.stacks.length; i++) {
      var stack = this.stacks[i];
      if(this.currentStack == stack) {
        ctx.fillStyle = CanvasColor.GRAY;
      }
      else {
        ctx.fillStyle = CanvasColor.BLACK;
      }
      ctx.fillRect(
        Geometry.ELEMENT_DIST*(i+1) + Geometry.ELEMENT_WIDTH*i,
        Geometry.CANVAS_HEIGHT - Geometry.GROUND_HEIGHT - Geometry.MARKER_HEIGHT,
        Geometry.ELEMENT_WIDTH,
        Geometry.MARKER_HEIGHT
      );
      for(var j = 0; j < stack.size(); j++) {
        stack.elements[j].draw(ctx);
      }
    }
  }

  Game.prototype.motionHandler = function() {
    var _this = this;

    function xFlight(stacks, source, target) {
      var s = source.size();
      var r = target.size();
      var g = Physics.GRAVITY;
      var h = Geometry.ELEMENT_HEIGHT;
      var T = Physics.FLIGHT_TIME;

      var theta = Math.PI*timeElapsed/T;

      var timeElapsed = _this.time - _this.motion.startTime;
      var coefficient = stacks.indexOf(target) - stacks.indexOf(source);
      return source.elements[0].x +
        ((coefficient*(Geometry.ELEMENT_WIDTH + Geometry.ELEMENT_DIST)*timeElapsed)/T);
    }

    function yFlight(stacks, source, target) {
      var s = source.size();
      var r = target.size();
      var g = Physics.GRAVITY;
      var h = Geometry.ELEMENT_HEIGHT;
      var T = Physics.FLIGHT_TIME;

      var theta = Math.PI*timeElapsed/T;

      var timeElapsed = _this.time - _this.motion.startTime;
      return source.elements[0].y +
        (-0.5*g*(timeElapsed)**2 +
        (0.5*g*T - (h*s)/T + (h*r)/T)*timeElapsed +
        h*s);
    }

    function isColliding(flyingElement, stackTopX, stackTopY, dy) {
      return Math.abs(flyingElement.x - stackTopX) <= 1 &&
      Math.abs(flyingElement.y - stackTopY) <= 1 + Geometry.ELEMENT_HEIGHT &&
      dy < 0;
    }

    var flyingElement = this.motion.sourceStack.peek();
    var old_x = flyingElement.x;
    var old_y = flyingElement.y;
    var new_x = xFlight(this.stacks, this.motion.sourceStack, this.motion.targetStack);
    var new_y = yFlight(this.stacks, this.motion.sourceStack, this.motion.targetStack);

    flyingElement.x = new_x;
    flyingElement.y = new_y;

    // Collision detection

    // Note: Checking here for downwards y-velocity to make collision detection accurate
    // (only detect collision if moving downward, not up). This covers the edge
    // case of popping onto the same stack.
    var dy = new_y - old_y;

    // Check whether the source and target stacks are equal

    if(this.motion.sourceStack == this.motion.targetStack) {
      stackTop = this.motion.targetStack.peekTwice();
    }
    else {
      stackTop = this.motion.targetStack.peek();
    }

    if(stackTop) {
      stackTopX = stackTop.x;
      stackTopY = stackTop.y;
    }
    else {
      var stackIndex = this.stacks.indexOf(this.motion.targetStack);
      stackTopY = Geometry.MARKER_HEIGHT;
      stackTopX = Geometry.ELEMENT_DIST*(stackIndex+1) + Geometry.ELEMENT_WIDTH*stackIndex;
    }

    if(isColliding(flyingElement, stackTopX, stackTopY, dy)) {
      // stop motion, set to AT_REST, push onto new stack
      this.state = State.EVALUATING;
      this.motion.targetStack.push(this.motion.sourceStack.pop());
      if(this.losing()) {
        this.gameOver();
      }
    }
  }

  Game.prototype.evalHandler = function() {
    if(this.motion.targetStack.peekTwice()) {
      if(this.motion.targetStack.peek().color == this.motion.targetStack.peekTwice().color) {
        this.motion.targetStack.peek().canceling = true;
        this.motion.targetStack.peekTwice().canceling = true;
        this.state = State.CANCELING;
      }
      else {
        this.motion.sourceStack = null;
        this.motion.targetStack = null;
        this.state = State.AT_REST;
      }
    }
  }

  Game.prototype.cancelHandler = function() {

    var determineScore = function(block) {
      if(block.color == Color.RED ||
        block.color == Color.BLUE ||
        block.color == Color.YELLOW) {
        return 2;
      }
      else {
        return 0;
      }
    }

    if(this.cancellation.startTime == null) {
      this.cancellation.stack = this.motion.targetStack;
      this.motion.sourceStack = null;
      this.motion.targetStack = null;
      this.cancellation.startTime = this.time;
    }
    else if(this.time - this.cancellation.startTime == Time.CANCELLATION_TIME) {
      this.cancellation.startTime = null;
      var top = this.cancellation.stack.pop();
      var second = this.cancellation.stack.pop();
      this.score += determineScore(top);
      updateScoreText(this.score);
      this.state = State.AT_REST;
    }
  }

  Game.prototype.losing = function() {
    var result = false;
    for(var i = 0; i < this.stacks.length; i++) {
      result = result || this.stacks[i].size() > Geometry.STACK_HEIGHT_THRESHOLD;
    }
    return result;
  }

  Game.prototype.gameOver = function() {
    this.lost = true;
  }

  Game.prototype.showGameOverMessage = function() {
    ctx.clearRect(0, 0, 1000, 1000);
    ctx.font = "16px Share Tech Mono";
    ctx.fillStyle = '#222222';
    ctx.fillText("Game over!", 70, 250);
    ctx.fillText("Press ENTER to play again.", 70, 280);
  }

  Game.prototype.update = function() {
    this.time++;

    if(this.state == State.AT_REST) {
      r = Math.random();
      if(r < Math.sqrt((this.score+1)*Time.RANDOM_TIME_THRESHOLD)) {
        this.randomlyEnqueue();
        if(this.losing()) {
          this.gameOver();
        }
      }
    }
    else if(this.state == State.IN_MOTION) {
      this.motionHandler();
    }
    else if(this.state == State.EVALUATING) {
      this.evalHandler();
    }
    else if(this.state == State.CANCELING) {
      this.cancelHandler();
    }
  }

  Game.prototype.draw = function() {
    var canvas = document.getElementById("gameplay");
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 1000, 1000);
    this.drawStacks(ctx);
  }

  var updateScoreText = function(score) {
    $("#score").text(score);
  }

  var newGame = function() {

    var game = new Game();
    game.setupPositions();
    game.draw();

    var gameLoop = function() {
      if(!game.lost) {
        game.update();
        game.draw();
        requestAnimationFrame(gameLoop);
      }
      else {
        game.showGameOverMessage();
        $("body").keydown(function(e) {
          if(e.keyCode == 13) {
            newGame();
          }
        });
      }
    }

    var switchHandler = function(e) {
      var currentIndex = game.stacks.indexOf(game.currentStack);
      if(e.keyCode == Key.LEFT_SELECT) {
        if(currentIndex > 0) {
          game.currentStack = game.stacks[currentIndex - 1];
          return true;
        }
        return false;
      }
      else if(e.keyCode == Key.RIGHT_SELECT) {
        if(currentIndex < 2) {
          game.currentStack = game.stacks[currentIndex + 1];
          return true;
        }
        return false;
      }
      return false;
    }

    var motionKeyHandler = function(e) {
      var currentIndex = game.stacks.indexOf(game.currentStack);
      targetStack = null;
      if(e.keyCode == Key.LEFT_POP) {
        if(currentIndex > 0) {
          targetStack = game.stacks[currentIndex - 1];
        }
      }
      else if(e.keyCode == Key.RIGHT_POP) {
        if(currentIndex < 2) {
          targetStack = game.stacks[currentIndex + 1];
        }
      }
      if(targetStack) {
        game.motion.sourceStack = game.currentStack;
        game.motion.targetStack = targetStack;
        game.beginMotion();
        return true;
      }
      return false;
    }

    $("body").keydown(function(e) {
      if(game.state == State.AT_REST) {
        var result = switchHandler(e) || motionKeyHandler(e);
        if(result) {
          game.update();
          game.draw();
        }
      }
    });

    requestAnimationFrame(gameLoop);
  }

  newGame();

});
