$(function() {

  var Geometry = {
    ELEMENT_WIDTH: 50,
    ELEMENT_HEIGHT: 50,
    ELEMENT_DIST: 50, // Distance between stacks
    MARKER_HEIGHT: 20, // Height of marker underneath each stack
    CANVAS_WIDTH: 500,
    CANVAS_HEIGHT: 500
  }

  var Physics = {
    GRAVITY: 0.1
  }

  var Key = {
    LEFT_STACK_SELECT: 65,
    MID_STACK_SELECT: 83,
    RIGHT_STACK_SELECT: 68,
    POP_ONTO_LEFT: 74,
    POP_ONTO_MID: 75,
    POP_ONTO_RIGHT: 76
  }

  var Color = {
      RED: 1,
      GREEN: 2,
      BLUE: 3
  }

  var State = {
      AT_REST: 1,
      IN_MOTION: 2,
      CANCELING_OUT: 3
  }

  var Element = function(color) {
    this.color = color;
    this.x = null;
    this.y = null;
  }

  Element.prototype.draw = function(ctx) {
    if(this.color == Color.RED) {
      ctx.fillStyle = '#FF0000';
    }
    else if(this.color == Color.GREEN) {
      ctx.fillStyle = '#00FF00';
    }
    else if(this.color == Color.BLUE) {
      ctx.fillStyle = '#0000FF';
    }
    ctx.fillRect(this.x, Geometry.CANVAS_WIDTH - this.y, Geometry.ELEMENT_WIDTH, Geometry.ELEMENT_HEIGHT);
  }

  var randomElement = function() {
    var r = Math.random();
    if(r < 0.33) {
      return new Element(Color.RED);
    }
    else if(0.33 <= r && r <= 0.66) {
      return new Element(Color.GREEN);
    }
    else {
      return new Element(Color.BLUE);
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
    var numElements = Math.floor((Math.random() * 12) - 2);
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

  var Game = function() {
    this.stacks = [new Stack(), new Stack(), new Stack()]
    this.currentStack = this.stacks[0];
    this.state = State.AT_REST;
    this.time = 0;
    this.motion = {
      sourceStack: null,
      targetStack: null,
      startTime: null
    };

    this.stacks[0].randomlyFill();
    this.stacks[1].randomlyFill();
  }

  Game.prototype.setupPositions = function() {
    for(var i = 0; i < this.stacks.length; i++) {
      for(var j = 0; j < this.stacks[i].size(); j++) {
        var element = this.stacks[i].elements[j];
        element.x = Geometry.ELEMENT_DIST*(i+1) + Geometry.ELEMENT_WIDTH*i;
        element.y = 3.5*Geometry.MARKER_HEIGHT + Geometry.ELEMENT_HEIGHT*j;
      }
    }
  }

  Game.prototype.setState = function(state) {
    if(state == State.AT_REST || state == State.IN_MOTION || state == State.CANCELING_OUT) {
      this.state = state;
    }
  }

  Game.prototype.popPush = function(sourceStack, targetStack) {
    if(targetStack) {
      var popped = sourceStack.pop();
      if(popped) {
        targetStack.push(popped);
      }
    }
  }

  Game.prototype.debug = function() {
    console.log(this.stacks[0].elements);
    console.log(this.stacks[1].elements);
    console.log(this.stacks[2].elements);
  }

  Game.prototype.beginMotion = function() {
      game.setState(State.IN_MOTION);
      game.motion.startTime = game.time;
  }

  Game.prototype.drawStacks = function(ctx) {
    // Draws a stack given whether the canvas context, the stack,
    // the "x offset" of the stack, and whether the stack is selected.

    for(var i = 0; i < this.stacks.length; i++) {
      var stack = this.stacks[i];
      if(this.currentStack == stack) {
        ctx.fillStyle = '#777777';
      }
      else {
        ctx.fillStyle = '#000000';
      }
      ctx.fillRect(
        Geometry.ELEMENT_DIST*(i+1) + Geometry.ELEMENT_WIDTH*i,
        Geometry.CANVAS_HEIGHT - Geometry.MARKER_HEIGHT,
        Geometry.ELEMENT_WIDTH,
        Geometry.MARKER_HEIGHT
      );
      for(var j = 0; j < stack.size(); j++) {
        stack.elements[j].draw(ctx);
      }
    }
  }

  Game.prototype.update = function() {

    game.time += 1;

    function dxFlight(stacks, source, target) {
      var k_s = source.size();
      var k_t = target.size();
      var g = Physics.GRAVITY;
      var h = Geometry.ELEMENT_HEIGHT;
      var timeElapsed = game.time - game.motion.startTime;
      var totalFlightTime = (Math.sqrt(3*g*k_t*h) + Math.sqrt(3*g*k_t*h + 2*g*(k_s*h - k_t*h)))/g;
      var coefficient = stacks.indexOf(target) - stacks.indexOf(source);
      return
        (coefficient*(Geometry.ELEMENT_WIDTH + Geometry.ELEMENT_DIST)*timeElapsed)
        /totalFlightTime;
    }

    function dyFlight(stacks, source, target) {
      var k_t = target.size();
      var g = Physics.GRAVITY;
      var h = Geometry.ELEMENT_HEIGHT;
      var timeElapsed = game.time - game.motion.startTime;
      return -0.5*g*(timeElapsed)**2 + Math.sqrt(3*g*k_t*h)*timeElapsed;
    }

    if(this.state == State.IN_MOTION) {
      var flyingElement = this.motion.sourceStack.elements[
        this.motion.sourceStack.size() - 1];
      flyingElement.x =
        flyingElement.x + dxFlight(this.stacks, this.motion.sourceStack, this.motion.targetStack);
      flyingElement.y =
        flyingElement.y + dyFlight(this.stacks, this.motion.sourceStack, this.motion.targetStack);
    }
    else if(this.state == State.CANCELING_OUT) {

    }
  }

  Game.prototype.toBeCanceled = function() {
    return this.stacks[0].needsCanceling ||
    this.stacks[1].needsCanceling ||
    this.stacks[2].needsCanceling;
  }

  Game.prototype.draw = function() {
    var canvas = document.getElementById("gameplay");
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 1000, 1000);
    this.drawStacks(ctx);
  }

  var game = new Game();
  game.setupPositions();
  game.draw();
  game.debug();

  var switchHandler = function(e) {
    var keys = [Key.LEFT_STACK_SELECT, Key.MID_STACK_SELECT, Key.RIGHT_STACK_SELECT];
    var keyPos = keys.indexOf(e.keyCode);
    if(keyPos >= 0) {
      game.currentStack = game.stacks[keyPos];
      return true;
    }
    return false;
  }

  var motionHandler = function(e) {
    var keys = [Key.POP_ONTO_LEFT, Key.POP_ONTO_MID, Key.POP_ONTO_RIGHT];
    var keyPos = keys.indexOf(e.keyCode);
    if(keyPos >= 0) {
      game.motion.sourceStack = game.currentStack;
      game.motion.targetStack = game.stacks[keyPos];
      game.beginMotion();
      return true;
      // game.popPush(game.motion.sourceStack, game.motion.targetStack);
    }
    return false;
  }

  $("body").keydown(function(e) {
    var result = switchHandler(e) || motionHandler(e);
    if(result) {
      game.update();
      game.draw();
    }
  });

  var gameLoop = function() {
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);

});
