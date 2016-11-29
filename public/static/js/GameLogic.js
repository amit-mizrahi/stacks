// requires Game.js, DOM.js, Config.js

var newGame = function() {

  window.game = new Game();

  var canvas = document.getElementById("gameplay");
  game.ctx = canvas.getContext("2d");

  game.setupPositions();
  game.draw();

  DOM.updateScoreText(0);
  DOM.hideGameOverText();

  var makeNewGame = function(e) {
    newGame();
    $("body").unbind("keydown", makeNewGame);
  }

  var keyHandler = function(e) {
    var result = switchHandler(e);
    if(game.state == State.AT_REST) {
      result = result || motionKeyHandler(e);
    }
    return result;
  }

  $("body").keydown(keyHandler);

  var gameLoop = function() {
    if(!game.lost) {
      game.update();
      game.draw();
      myReq = requestAnimationFrame(gameLoop);
    }
    else {
      $("body").unbind("keydown", keyHandler);
      $("body").click(makeNewGame);
      cancelAnimationFrame(myReq);
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
      if(game.motion.sourceStack.peek()) {
        game.beginMotion();
        return true;
      }
      return false;
    }
    return false;
  }

  var myReq = requestAnimationFrame(gameLoop);
}

$(function() {
  $(".gameplay").hide();
  $(".begin").click(function() {
    $(this).parent().parent().parent().parent().remove();
    $("footer").remove();
    $(".gameplay").show();
    Config.adjustWindow();
    newGame();
  });
})
