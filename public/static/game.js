var Color = {
    RED: 1,
    GREEN: 2,
    BLUE: 3
  }

var Element = function(color) {
  this.color = color;
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
  // Pushes an item onto the stack
  this.elements.push(el);
}

Stack.prototype.pop = function() {
  // Pops an item from the stack and returns it
  return this.elements.pop();
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
  for(var i = 0; i < this.elements.length; i++) {
    newElements.push(this.elements[i]);
  }
  this.elements = newElements;
}

var GameState = function() {
  this.stack1 = new Stack();
  this.stack2 = new Stack();
  this.stack3 = new Stack();

  this.stack1.randomlyFill();
  this.stack2.randomlyFill();

}

GameState.prototype.popPush = function(sourceStack, sinkStack) {
  sinkStack.push(sourceStack.pop());
}

GameState.prototype.debug = function() {
  console.log(this.stack1.elements);
  console.log(this.stack2.elements);
  console.log(this.stack3.elements);
}

var state = new GameState();
state.debug();
