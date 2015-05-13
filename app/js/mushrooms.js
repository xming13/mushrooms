var XMing = XMing || {};

XMing.GameStateManager = new function() {

    var gameState;
    var userData;
    var score = 0;
    var gameTimer;
    var shroomTimer;
    var remainingTime;
    var imageObj = {};

    var VERSION_NUMBER = 1;
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

    this.setupGameNode = function() {
        var self = this;

        var liTemplate = "<li>" + "<div class='shroom-holder'>" + "<div class='image-holder'>" + "<img class='new-shroom' src='images/transparent.png' />" + "</div>" + "</div>" + "</li>";

        $(".game-grid").html("");
        _.times(16, function() {
            $(".game-grid").append(liTemplate);
        });

        this.onResize();
        $('html, body').scrollTop($(".panel-container").offset().top);

        (function countdown() {
            remainingTime -= 1.0;
            $("#timer-value").html(remainingTime);

            if (remainingTime <= 0) {
                self.endGame();
            } else {
                gameTimer = setTimeout(countdown, 1000);
            }
        })();

        (function popupRandomShroom() {
            var randomNumber = _.random(2, 5);
            _.each(_.sample($(".image-holder"), randomNumber), function(imageHolder) {
                if (!$(imageHolder).data("type")) {
                    var randomType = _.sample(SHROOM_TYPE);
                    $(imageHolder).data("type", randomType);
                    $(imageHolder).find('img')
                        .attr("src", imageObj[randomType]);
                }
            });

            _.each($(".image-holder"), function(imageHolder) {
                var $imageHolder = $(imageHolder);
                if ($imageHolder.data("type") && !$imageHolder.data("hasStarted") && !$imageHolder.data("hasStopped")) {
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
                }
            });

            if (!self.isGameStateEnd()) {
                shroomTimer = setTimeout(popupRandomShroom, 2000);
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
                        img.addClass("animated fadeOut");
                        img.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                            img.removeClass("animated fadeOut");
                        });
                        score++;
                        $scorePopup = $("<div class='score-popup animated bounceIn'>+1</div>");
                        break;

                    case SHROOM_TYPE.DOUBLE:
                        if ($this.data("isClicked")) {
                            img.attr("src", imageObj[thisType + "-clicked-twice"]);
                            img.addClass("animated fadeOut");
                            img.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                                img.removeClass("animated fadeOut");
                            });
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
    };

    this.preloadImage = function() {
        var imgSingle = new Image();
        imgSingle.src = "images/mushroom.png";
        imageObj[SHROOM_TYPE.SINGLE] = imgSingle.src;

        var imgSingleClicked = new Image();
        imgSingleClicked.src = "images/mushroom-clicked.png"
        imageObj[SHROOM_TYPE.SINGLE + "-clicked"] = imgSingleClicked.src;

        var imgDouble = new Image();
        imgDouble.src = "images/mushroom-double-small.png";
        imageObj[SHROOM_TYPE.DOUBLE] = imgDouble.src;

        var imgDoubleClickedOnce = new Image();
        imgDoubleClickedOnce.src = "images/mushroom-double-small-clicked-once.png"
        imageObj[SHROOM_TYPE.DOUBLE + "-clicked-once"] = imgDoubleClickedOnce.src;

        var imgDoubleClickedTwice = new Image();
        imgDoubleClickedTwice.src = "images/mushroom-double-small-clicked-twice.png"
        imageObj[SHROOM_TYPE.DOUBLE + "-clicked-twice"] = imgDoubleClickedTwice.src;

        var imgPoison = new Image();
        imgPoison.src = "images/mushroom-poison.png";
        imageObj[SHROOM_TYPE.POISON] = imgPoison.src;

        var imgPoisonClicked = new Image();
        imgPoisonClicked.src = "images/mushroom-poison-clicked.png";
        imageObj[SHROOM_TYPE.POISON + "-clicked"] = imgPoisonClicked.src;

        var imgPig = new Image();
        imgPig.src = "images/pig.png";

        var imgPigShroomCap = new Image();
        imgPigShroomCap.src = "images/pig-mushroom-cap.png";

        var imgWildboar = new Image();
        imgWildboar.src = "images/wildboar.png";

        var imgWildboarShroomCap = new Image();
        imgWildboarShroomCap.src = "images/wildboar-mushroom-cap.png";

        var imgOrangeEgg = new Image();
        imgOrangeEgg.src = "images/orange-egg.png";

        var imgBlueEgg = new Image();
        imgBlueEgg.src = "images/blue-egg.png";

        var imgNinjaEgg = new Image();
        imgNinjaEgg.src = "images/ninja-egg.png";

        var imgLove = new Image();
        imgLove.src = "images/love.png";
    };
    this.onResize = function() {
        var lis = $(".game-grid").children("li");

        if (lis.length == 0) {
            return;
        }

        var liMaxWidth = _.max(lis, function(li) {
            return $(li).width();
        });
        var maxWidth = $(liMaxWidth).width();

        _.each(lis, function(li) {
            $(li).height(maxWidth)
            $(li).find('.content:not(.last)').css('line-height', maxWidth + "px");
        });
    };

    // Game status operation
    this.initGame = function() {
        var self = this;
        gameState = GAME_STATE_ENUM.INITIAL;

        FastClick.attach(document.body, {
            tapDelay: 100
        });

        window.addEventListener("resize", this.onResize.bind(this), false);

        this.preloadImage();

        userData = this.loadData();

        swal.setDefaults({
            confirmButtonColor: '#FD9E3D'
        });

        $(".mfb-component__button--main").click(function() {
            if ($(this).parent().parent().attr('data-mfb-state') === "open") {
                $(".overlay").addClass("active");
            } else {
                $(".overlay").removeClass("active");
            }
        });

        $(".btn-play").click(function() {
            $(".panel-main").hide();
            $(".panel-game").fadeIn();
            $('html, body').animate({
                scrollTop: $(".panel-container").offset().top
            }, 'fast');

            self.startGame();
        });

        $(".btn-leaderboard").click(function() {
            self.showLeaderboard();
        });

        $(".icon-back").click(function() {
            $(".panel-game, .panel-leaderboard").hide();
            $(".panel-main").fadeIn();
        });

        $(".icon-repeat").click(function() {
            self.startGame();
        });

        this.checkPlayedEasterEgg();
    };
    this.startGame = function() {
        gameState = GAME_STATE_ENUM.START;
        score = 0;
        $("#score-value").html(score);
        remainingTime = 61;
        $("#timer-value").html(remainingTime);
        $("#timer").fadeIn();
        $(".icon-wrapper").hide();

        this.setupGameNode();
    };
    this.endGame = function() {
        var self = this;
        gameState = GAME_STATE_ENUM.END;

        clearTimeout(gameTimer);
        clearTimeout(shroomTimer);

        var html = "<li><div class='content end-mushroom'><img src='images/mushroom.png' class='animated tada' /></div></li>";
        html += "<li><div class='content'><img src='images/mushroom-clicked.png' /></div></li>";
        html += "<li><div class='content end-mushroom-poison'><img src='images/mushroom-poison.png' class='animated tada' /></div></li>";
        html += "<li><div class='content'><img src='images/mushroom-poison-clicked.png' /></div></li>";

        html += "<li><div class='content'>G</div></li>";
        html += "<li><div class='content'>A</div></li>";
        html += "<li><div class='content'>M</div></li>";
        html += "<li><div class='content'>E</div></li>";

        html += "<li><div class='content'>O</div></li>";
        html += "<li><div class='content'>V</div></li>";
        html += "<li><div class='content'>E</div></li>";
        html += "<li><div class='content'>R</div></li>";

        html += "<li><div class='content'><img src='images/mushroom-double-small.png' /></div></li>";
        html += "<li><div class='content'><img src='images/mushroom-double-small-clicked-once.png' /></div></li>";
        html += "<li><div class='content'><img src='images/mushroom-double-small-clicked-twice.png' /></div></li>";
        html += "<li><div class='content last'><img src='images/mushroom-small.png' class='small animated' /></div></li>";

        $(".game-grid").html(html);
        $("#timer").hide();
        $(".icon-wrapper").fadeIn();
        $("#score-value").html(score);
        this.onResize();
        $('html, body').scrollTop($(".panel-container").offset().top);

        swal({
            title: "Well Done!",
            text: "You have collected " + score + " mushrooms! :D",
            imageUrl: "images/mushroom-small.png",
            closeOnConfirm: false
        }, function() {
            var postingInProgress = false;
            swal({
                title: "Thanks for playing!!!",
                imageUrl: "images/love.png",
                type: "input",
                text: "Write your name here! It will appear in the leaderboard!",
                closeOnConfirm: false
            }, function(playerName) {
                if (playerName == "") {
                    swal.showInputError("You need to write something! A nickname is fine too!");
                    return false;
                }
                if (postingInProgress) {
                    return false;
                } else {
                    postingInProgress = true;
                    $.ajax({
                        method: "POST",
                        url: 'http://weiseng.redairship.com/leaderboard/api/1/highscore.json',
                        contentType: "application/json",
                        data: JSON.stringify({
                            game_id: 3,
                            username: playerName,
                            score: score
                        })
                    }).success(function(data) {
                        swal("Congratulations!", "You are currently ranked " + data.rank_text + "!", "success");
                        userData.username = playerName;
                        self.saveData(userData);
                    }).fail(function() {
                        swal("Oops...", "Something went wrong!", "error");
                    });
                }
            });
            $('.sweet-alert input[type=text]:first').val(userData.username);
        });

        // Easter egg
        var imagePigs = ["images/mushroom.png", "images/pig-mushroom-cap.png", "images/pig.png"];
        var imageWildboars = ["images/mushroom-poison.png", "images/wildboar-mushroom-cap.png", "images/wildboar.png"];

        var showPig = false;
        var showWildboar = false;

        var loadNextImage = function(li, array) {
            var currentImage = $(li).find('img').attr('src');
            var index = _.indexOf(array, currentImage);
            index = (index + 1) % array.length;
            $(li).find('img').attr('src', array[index]);

            if (!userData.easterEgg.mushrooms) {
                if (index === 2) {
                    if (array[0] === imagePigs[0]) {
                        showPig = true;
                    } else if (array[0] === imageWildboars[0]) {
                        showWildboar = true;
                    }

                    if (showPig && showWildboar) {
                        userData.easterEgg.mushrooms = true;
                        self.saveData(userData);
                        swal({
                            title: 'Congratulations!',
                            text: 'You have found the Orange Egg!',
                            imageUrl: 'images/orange-egg.png'
                        });
                        $.ajax({
                            method: "POST",
                            url: 'http://weiseng.redairship.com/leaderboard/api/1/highscore.json',
                            contentType: "application/json",
                            data: JSON.stringify({
                                game_id: 10,
                                username: userData.uid,
                                score: 1
                            })
                        });
                    }
                }
            }
        };

        $(".end-mushroom").click(function() {
            loadNextImage(this, imagePigs);
        });
        $(".end-mushroom-poison").click(function() {
            loadNextImage(this, imageWildboars);
        });
        $(".small").click(function() {
            $(this).toggleClass("rubberBand");
        });

        if (!userData.played.mushrooms) {
            userData.played.mushrooms = true;
            this.saveData(userData);
        }
    };
    this.showLeaderboard = function() {
        $(".panel-main").hide();
        $(".panel-leaderboard, .icon-back, .loader").fadeIn();

        $(".highscore-list").html("");

        if (!userData.leaderboard.mushrooms) {
            userData.leaderboard.mushrooms = true;
            this.saveData(userData);
            this.checkLeaderboardEasterEgg();
        }

        $.get("http://weiseng.redairship.com/leaderboard/api/1/highscore.json?game_id=3", function(data) {
            $(".loader").fadeOut(700);

            var numDummyData = 10 - data.length;
            for (var i = 0; i < numDummyData; i++) {
                data.push({
                    username: '----------',
                    score: 0
                });
            }

            _.each(data, function(highscore, index) {
                setTimeout(function() {
                    $(".highscore-list").append('<li class="animated slideInUp">' + (index + 1) + ': ' + highscore.username + ' - ' + highscore.score + '</li>');
                }, index * 200);
            });
        }).fail(function() {
            swal("Oops...", "Something went wrong!", "error");
        });
    };

    // Check game state
    this.isGameStateInitial = function() {
        return gameState == GAME_STATE_ENUM.INITIAL;
    };
    this.isGameStateStart = function() {
        return gameState == GAME_STATE_ENUM.START;
    };
    this.isGameStateEnd = function() {
        return gameState == GAME_STATE_ENUM.END;
    };

    // Easter Egg
    this.checkPlayedEasterEgg = function() {
        if (!userData.easterEgg.allGames) {
            if (_.every(userData.played)) {
                userData.easterEgg.allGames = true;
                this.saveData(userData);
                swal({
                    title: 'Congratulations!',
                    text: 'You have found the Blue Egg!',
                    imageUrl: 'images/blue-egg.png'
                });
                $.ajax({
                    method: "POST",
                    url: 'http://weiseng.redairship.com/leaderboard/api/1/highscore.json',
                    contentType: "application/json",
                    data: JSON.stringify({
                        game_id: 13,
                        username: userData.uid,
                        score: 1
                    })
                });
            }
        }
    };
    this.checkLeaderboardEasterEgg = function() {
        if (!userData.easterEgg.allLeaderboard) {
            if (_.every(userData.leaderboard)) {
                userData.easterEgg.allLeaderboard = true;
                this.saveData(userData);
                swal({
                    title: 'Congratulations!',
                    text: 'You have found the Ninja Egg!',
                    imageUrl: 'images/ninja-egg.png'
                });
                $.ajax({
                    method: "POST",
                    url: 'http://weiseng.redairship.com/leaderboard/api/1/highscore.json',
                    contentType: "application/json",
                    data: JSON.stringify({
                        game_id: 15,
                        username: userData.uid,
                        score: 1
                    })
                });
            }
        }
    };

    // Local storage
    this.saveData = function(userData) {
        if (window.localStorage) {
            window.localStorage.setItem('data', btoa(encodeURIComponent(JSON.stringify(userData))));
        }
    };
    this.loadData = function() {
        if (window.localStorage) {
            var data = window.localStorage.getItem('data');
            if (data) {
                var parsedData = JSON.parse(decodeURIComponent(atob(data)));
                // make sure version is the same
                if (parsedData.version === VERSION_NUMBER) {
                    return parsedData;
                }
            }
        }

        var uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        var data = {
            played: {
                bunny: false,
                specialOne: false,
                mushrooms: false,
                word: false,
                numbers: false,
                squirrel: false
            },
            leaderboard: {
                bunny: false,
                specialOne: false,
                mushrooms: false,
                word: false,
                numbers: false,
                squirrel: false
            },
            squirrel: {
                level: 0,
                inHallOfFame: false
            },
            easterEgg: {
                allGames: false,
                allLeaderboard: false,
                word: false,
                numbers: false,
                specialOne: false,
                mushrooms: false,
                squirrel: false
            },
            collectAll: false,
            uid: uid,
            username: '',
            version: VERSION_NUMBER
        };

        this.saveData(data);

        return data;
    };
};

$(function() {
    XMing.GameStateManager.initGame();
});
