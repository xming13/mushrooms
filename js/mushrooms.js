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
        SINGLE: "single",
        DOUBLE: "double",
        POISON: "poison"
    };

    this.init = function() {
        window.addEventListener("resize", this.onResize.bind(this), false);
        this.initGame();
    };

    this.loadData = function() {
        var self = this;

        var htmlTemplate = "<li>" + "<div class='shroom-holder'>" + "<div class='image-holder'>" + "<img class='new-shroom' src='images/transparent.png' />" + "</div>" + "</div>" + "</li>";

        var htmlArray = [];
        _.times(16, function(available) {
            htmlArray.push(htmlTemplate);
        });

        $(".game-grid").html("");
        _.each(htmlArray, function(html) {
            $(".game-grid").append(html);
        });
        this.onResize();
        $('html, body').scrollTop($("#panel-container").offset().top);

        remainingTime = 60;

        (function popupRandomShroom() {
            var randomNumber = _.random(1, 4);
            _.each(_.sample($(".image-holder"), randomNumber), function(imageHolder) {
                if (!$(imageHolder).data("type")) {
                    var randomType = _.sample(SHROOM_TYPE);
                    $(imageHolder).data("type", randomType);
                    $(imageHolder).find('img')
                        .attr("src", imageObj[randomType]);
                }
            });

            _.each(_.filter($(".image-holder"), function(imageHolder) {
                return $(imageHolder).data("type") && !$(imageHolder).data("hasStarted") && !$(imageHolder).data("hasStopped");
            }), function(imageHolder) {
                var $imageHolder = $(imageHolder);
                var liHeight = $imageHolder.parent().parent("li").height();
                $imageHolder
                    .css("top", liHeight + "px")
                    .data("hasStarted", true)
                    .animate({
                        top: "0px"
                    }, {
                        duration: 500,
                        complete: function() {
                            var $this = $(this);
                            setTimeout(function() {
                                if (!$this.data("hasStopped")) {
                                    $this.animate({
                                        top: liHeight + "px"
                                    }, {
                                        duration: 500,
                                        complete: function() {
                                            $this.css("top", liHeight + "px")
                                                .data("type", "")
                                                .data("isClicked", "")
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

        $(".image-holder").click(function() {
            var $this = $(this);

            if ($this.data("type") && !$this.data("hasStopped")) {

                var thisType = $this.data("type");

                var img = $this.find('img');
                var $scorePopup;

                var isClickedOnce = false;

                switch (thisType) {
                    case SHROOM_TYPE.SINGLE:
                        img.attr("src", imageObj[thisType + "-clicked"]);
                        score++;
                        $scorePopup = $("<div class='score-popup animated bounceIn'>+1</div>");
                        break;

                    case SHROOM_TYPE.DOUBLE:
                        if ($this.data("isClicked")) {
                            img.attr("src", imageObj[thisType + "-clicked-twice"]);
                            score += 2;
                            $scorePopup = $("<div class='score-popup animated bounceIn'>+2</div>");
                        } else {
                            $this.data("isClicked", true);
                            img.attr("src", imageObj[thisType + "-clicked-once"]);
                            isClickedOnce = true;
                        }
                        break;
                    case SHROOM_TYPE.POISON:
                        img.attr("src", imageObj[thisType + "-clicked"]);
                        score--;
                        $scorePopup = $("<div class='score-popup penalty animated bounceIn'>-1</div>");
                        break;
                }

                if (!isClickedOnce) {
                    $("#score-value").html(score);

                    $this.data("hasStopped", true)
                        .stop();

                    var $parentLi = $this.parent().parent("li");
                    var $imagePopup = $("<img src='images/mushroom-small.png' class='popup' />");
                    $scorePopup.prepend($imagePopup);
                    $parentLi.prepend($scorePopup);
                    $scorePopup.css('top', (this.offsetTop - $imagePopup.height()) + "px");

                    $(".score-popup").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                        $scorePopup.remove();
                    });

                    setTimeout(function() {
                        $scorePopup.remove();
                        $this.css("top", $parentLi.height() + "px")
                            .data("type", "")
                            .data("isClicked", "")
                            .data("hasStarted", "")
                            .data("hasStopped", "");
                    }, 500);
                }
            }
        });

        (function countdown() {
            remainingTime -= 1.0;
            $("#timer-value").html(Math.ceil(remainingTime));
            $("#timer-value").addClass("animated fadeIn");

            if (remainingTime <= 0) {
                clearTimeout(gameTimer);

                $("#result-content")
                    .html("Time's up!")
                    .addClass('animated bounceIn')
                    .css("color", "rgba(17, 189, 255, 255)");
                $("#timer-value").removeClass("animated fadeIn");

                self.endGame();
            } else {
                gameTimer = setTimeout(countdown, 1000);
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
            $(li).find('.content:not(.last)').css('line-height', maxWidth + "px");
        });
    };

    this.preloadImage = function() {
        var imgSingle = new Image();
        imgSingle.src = "images/mushroom.png";
        imageObj[SHROOM_TYPE.SINGLE] = imgSingle.src;

        var imgSingleClicked = new Image();
        imgSingleClicked.src = "images/mushroom-clicked.png"
        imageObj[SHROOM_TYPE.SINGLE + "-clicked"] = imgSingleClicked.src;

        var imgDouble = new Image();
        imgDouble.src = "images/mushroom-double.png";
        imageObj[SHROOM_TYPE.DOUBLE] = imgDouble.src;

        var imgDoubleClickedOnce = new Image();
        imgDoubleClickedOnce.src = "images/mushroom-double-clicked-once.png"
        imageObj[SHROOM_TYPE.DOUBLE + "-clicked-once"] = imgDoubleClickedOnce.src;

        var imgDoubleClickedTwice = new Image();
        imgDoubleClickedTwice.src = "images/mushroom-double-clicked-twice.png"
        imageObj[SHROOM_TYPE.DOUBLE + "-clicked-twice"] = imgDoubleClickedTwice.src;

        var imgPoison = new Image();
        imgPoison.src = "images/mushroom-poison.png";
        imageObj[SHROOM_TYPE.POISON] = imgPoison.src;

        var imgPoisonClicked = new Image();
        imgPoisonClicked.src = "images/mushroom-poison-clicked.png";
        imageObj[SHROOM_TYPE.POISON + "-clicked"] = imgPoisonClicked.src;
    };

    // game status operation
    this.initGame = function() {
        gameState = GAME_STATE_ENUM.INITIAL;
        this.preloadImage();
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

        var html = "<li><div class='content'><img src='images/mushroom.png' /></div></li>";
        html += "<li><div class='content'><img src='images/mushroom-clicked.png' /></div></li>";
        html += "<li><div class='content'><img src='images/mushroom-poison.png' /></div></li>";
        html += "<li><div class='content'><img src='images/mushroom-poison-clicked.png' /></div></li>";

        html += "<li><div class='content'>G</div></li>";
        html += "<li><div class='content'>A</div></li>";
        html += "<li><div class='content'>M</div></li>";
        html += "<li><div class='content'>E</div></li>";

        html += "<li><div class='content'>O</div></li>";
        html += "<li><div class='content'>V</div></li>";
        html += "<li><div class='content'>E</div></li>";
        html += "<li><div class='content'>R</div></li>";

        html += "<li><div class='content'><img src='images/mushroom-double.png' /></div></li>";
        html += "<li><div class='content'><img src='images/mushroom-double-clicked-once.png' /></div></li>";
        html += "<li><div class='content'><img src='images/mushroom-double-clicked-twice.png' /></div></li>";
        html += "<li><div class='content last'><img src='images/mushroom-small.png' class='small' /></div></li>";

        $(".game-grid").html(html);
        $("#timer").hide();
        $("#replay").show();
        $("#score-value").html(score);
        this.onResize();
        $('html, body').scrollTop($("#panel-container").offset().top);

        alert('Congratulations!\nYour score is ' + score + '!\nThanks for playing!');
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