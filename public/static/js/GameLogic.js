// requires Game.js, DOM.js, Config.js

var highestScore = 0;

var newGame = function() {

  var game = new Game();

  var canvas = document.getElementById("gameplay");
  game.ctx = canvas.getContext("2d");

  game.setupPositions();
  game.draw();

  DOM.updateScoreText(0);
  DOM.hideGameOverText();

  var makeNewGame = function(e) {
    if(e.keyCode == Key.ENTER) {
      $("body").unbind("keydown", makeNewGame);
      newGame();
    }
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
      $("body").keydown(makeNewGame);
      cancelAnimationFrame(myReq);
      game.ctx.fillStyle = 'rgba(250, 200, 200, 0.5)';
      DOM.fillRect(game.ctx, 0, 0, Geometry.CANVAS_WIDTH, Geometry.CANVAS_HEIGHT);
      if(game.score > highestScore) {
        highestScore = game.score;
        DOM.updateHighScore(highestScore);
      }
      DOM.updateTweetBox("I got a score of " + game.score + " in Stacks! ");
    }
  }

  var switchHandler = function(e) {
    e.preventDefault();
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
  $("#trigger-help").click(function() {
    cancelAnimationFrame(myReq);
    $(".help").show();
    $("#trigger-hide").click(function() {
      if(!game.lost) {
        myReq = requestAnimationFrame(gameLoop);
      }
      $(".help").hide();
    })
  });
}

$(function() {
  $(".help").hide();
  $(".gameplay").hide();
  $(".begin").click(function() {
    var isChrome = !!window.chrome && !!window.chrome.webstore;
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);
    if(!isChrome && !isSafari) {
      $("#status").text("This game is only supported on Google Chrome and Safari for now.");
    }
    else {
      $("#explanation").remove();
      $("footer").remove();
      $(".gameplay").show();
      Config.adjustWindow();
      newGame();
    }
  });
})
