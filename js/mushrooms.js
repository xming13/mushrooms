var XMing = XMing || {};

XMing.GameStateManager = new function() {

    var gameState;
    var score = 0;
    var gameTimer;
    var remainingTime;
    var imageObj = {};

    // declare CONSTANTS
    var GAME_STATE_ENUM = {
        INITIAL: "initial",
        START: "start",
        PAUSE: "pause",
        END: "end"
    };

    var SHROOM_TYPE = {
        NORMAL: "normal",
        DOUBLE: "double",
        ENEMY: "enemy"
    };

    this.init = function() {
        window.addEventListener("resize", this.onResize.bind(this), false);
        this.initGame();
    };

    this.loadData = function() {
        var self = this;

        var htmlArray = [];
        _.times(16, function(available) {
            htmlArray.push("<li><img class='new-shroom' src='images/transparent.png' /></li>");
        });

        $(".game-grid").html("");
        _.each(htmlArray, function(html) {
            $(".game-grid").append(html);
        });
        this.onResize();
        $('html, body').scrollTop($("#panel-container").offset().top);

        remainingTime = 60.5;

        (function popupRandomShroom() {
            var randomNumber = _.random(1, 3);
            _.each(_.sample($(".new-shroom"), randomNumber), function(shroom) {
                if (!$(shroom).data("type")) {
                    $(shroom).data("type", "single")
                        .attr("src", _.sample(imageObj));
                }
            });

            _.each(_.filter($(".new-shroom"), function(shroom) {
                return $(shroom).data("type") && !$(shroom).data("hasStarted") && !$(shroom).data("hasStopped");
            }), function(newShroom) {
                var $newShroom = $(newShroom);
                var liHeight = $newShroom.parent("li").height();
                $newShroom
                    .css("top", liHeight + "px")
                    .data("hasStarted", true)
                    .animate({
                        top: "0px"
                    }, {
                        duration: 500,
                        complete: function() {
                            var that = $(this);
                            setTimeout(function() {
                                if (!that.data("hasStopped")) {
                                    that.animate({
                                        top: liHeight + "px"
                                    }, {
                                        duration: 500,
                                        complete: function() {
                                            that.css("top", liHeight + "px");
                                            that.data("type", "")
                                                .data("hasStarted", "");
                                        }
                                    });
                                }
                            }, 1000);
                        }
                    });
            });

            if (!self.isGameStateEnd()) {
                setTimeout(popupRandomShroom, 2000);
            }
        })();

        $(".new-shroom").click(function() {
            if ($(this).data("type")) {
                var that = $(this);
                var liHeight = $(this).parent("li").height();

                $(this).attr("src", "images/white.png")
                    .data("hasStopped", true)
                    .stop();

                score++;

                setTimeout(function() {
                    that.css("top", liHeight + "px");
                    that.data("type", "")
                        .data("hasStarted", "")
                        .data("hasStopped", "");
                }, 500);
            }
        });

        (function countdown() {
            remainingTime -= 0.5;
            $("#timer-value").html(Math.ceil(remainingTime));
            $("#timer-value").addClass("animated fadeIn");
            $("#score-value").html(score);

            if (remainingTime <= 0) {
                clearTimeout(gameTimer);

                $("#result-content")
                    .html("Time's up!")
                    .addClass('animated bounceIn')
                    .css("color", "rgba(17, 189, 255, 255)");
                $("#timer-value").removeClass("animated fadeIn");

                self.endGame();
            } else {
                gameTimer = setTimeout(countdown, 500);
            }
        })();
    };

    this.onResize = function(event) {
        var lis = $(".game-grid").children("li");

        var liMaxWidth = _.max(lis, function(li) {
            return $(li).width();
        });
        var maxWidth = $(liMaxWidth).width();

        _.each(lis, function(li) {
            $(li).height(maxWidth)
        });
    };

    // game status operation
    this.initGame = function() {
        gameState = GAME_STATE_ENUM.INITIAL;
        var img = new Image();
        img.src = "images/red.png";
        imageObj["red"] = img.src;
        img.src = "images/green.png";
        imageObj["green"] = img.src;
        img.src = "images/blue.png";
        imageObj["blue"] = img.src;
    };

    this.startGame = function() {
        gameState = GAME_STATE_ENUM.START;
        score = 0;
        $("#timer").show();
        $("#replay").hide();

        this.loadData();
    };

    this.endGame = function() {
        gameState = GAME_STATE_ENUM.END;

        var html = "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";

        html += "<li><div class='content'>G</div></li>";
        html += "<li><div class='content'>A</div></li>";
        html += "<li><div class='content'>M</div></li>";
        html += "<li><div class='content'>E</div></li>";

        html += "<li><div class='content'>O</div></li>";
        html += "<li><div class='content'>V</div></li>";
        html += "<li><div class='content'>E</div></li>";
        html += "<li><div class='content'>R</div></li>";

        html += "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";

        $(".game-grid").html(html);
        $("#timer").hide();
        $("#replay").show();
        $("#score-value").html(score);
        this.onResize();
        $('html, body').scrollTop($("#panel-container").offset().top);

        alert('Congratulations!\rYour score is ' + score + '!\rThanks for playing!');
        $(".icon-repeat").click(function() {
            XMing.GameStateManager.startGame();
        });
    };

    // check game state
    this.isGameStateInitial = function() {
        return gameState == GAME_STATE_ENUM.INITIAL;
    };

    this.isGameStateStart = function() {
        return gameState == GAME_STATE_ENUM.START;
    };

    this.isGameStateEnd = function() {
        return gameState == GAME_STATE_ENUM.END;
    };
};