(function () {
    var FRAMES_PER_SECOND = 60,
    PADDLE_VERTICAL_OFFSET = 40,
    BRICK_ROWS = 5,
    BRICK_COLUMNS = 10,
    SCORE_HORIZONTAL_OFFSET = 12,
    SCORE_VERTICAL_OFFSET = 12,
    COLOR_BLACK = '#2a363b',

    canvasElement,

    // 2d canvas context
    canvas,

    // canvas width
    width,

    // canvas height
    height,

    // game loop
    loop,

    // array of keys for which an element is true if pressed
    activeKeys,

    // game objects
    ball,
    paddle,
    bricks,

    score;

    // event listeners ------------------------------------------------------------

    $(document).on({
            'ready': initialize,
            'keydown' : function (event) {
            activeKeys[event.which] = true;
            },
            'keyup' : function (event) {
            activeKeys[event.which] = false;
            }
            });

    // constructors ---------------------------------------------------------------

    function Ball () {
        // origin at center of object
        this.x = 0;
        this.y = 0;

        // velocity
        this.vx = 9;
        this.vy = -9;

        this.radius = 2;
        this.color = COLOR_BLACK;
    }

    function Paddle () {
        this.x = 0;
        this.y = 0;
        this.vx = 5;
        this.width = 35;
        this.height = 4;
        this.color = COLOR_BLACK;
    }

    function Brick () {
        this.x = 0;
        this.y = 0;
        this.width = 40;
        this.height = 20;
        this.broken = false;
    }


    // other functions ------------------------------------------------------------

    function initialize () {
        canvasElement = $('canvas');
        canvas = canvasElement.get(0).getContext('2d');
        width = $('canvas').width();
        height = $('canvas').height();

        activeKeys = {},
                ball = {};
        paddle = {};
        bricks = [];
        score = 0;

        // initialize canvas
        clear();

        ball = new Ball();
        paddle = new Paddle();

        // position ball
        ball.x = width / 2 - ball.radius;
        ball.y = height - PADDLE_VERTICAL_OFFSET - ball.radius - paddle.height;

        // position paddle
        paddle.x = width / 2;
        paddle.y = height - PADDLE_VERTICAL_OFFSET;

        // create and position bricks
        for (var i = 0; i < BRICK_ROWS; i++) {
            bricks[i] = [];
            for (var j = 0; j < BRICK_COLUMNS; j++) {
                brick = new Brick();
                brick.x = j * brick.width + brick.width / 2;
                brick.y = i * brick.height + brick.height / 2;
                bricks[i][j] = brick;
            }
        }

        // start game loop and set frame rate to 60 fps
        loop = setInterval(function () {
                update();
                draw();
                }, FRAMES_PER_SECOND);
    }

    // update game logic each frame
    function update () {
        // handle keyboard input
        if (activeKeys['37'] && paddle.x - paddle.width / 2 > 0) {
            paddle.x -= paddle.vx;
        } else if (activeKeys['39'] && paddle.x + paddle.width / 2 < width) {
            paddle.x += paddle.vx;
        }

        // check edge collisions
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > width) {
            ball.vx *= -1;
        }
        if (ball.y - ball.radius < 0) {
            ball.vy *= -1
        } else if (ball.y + ball.radius > height) {
            clearInterval(loop);
            initialize();
        }

        // check ball-paddle collision
        if (ball.x - ball.radius + ball.vx < paddle.x + paddle.width / 2 &&
                ball.x + ball.radius + ball.vx > paddle.x - paddle.width / 2 &&
                // ball.y - ball.radius < paddle.y + paddle.height / 2 &&
                ball.y + ball.radius + ball.vy> paddle.y - paddle.height / 2) {
            ball.vy *= -1;
        }

        // check ball-brick collision
        for (var i = 0; i < BRICK_ROWS; i++) {
            for (var j = 0; j < BRICK_COLUMNS; j++) {
                var brick = bricks[i][j];

                if (!brick.broken) {
                    if (ball.x - ball.radius < brick.x + brick.width / 2 &&
                            ball.x + ball.radius > brick.x - brick.width / 2 &&
                            ball.y - ball.radius < brick.y + brick.height &&
                            ball.y + ball.radius > brick.y - brick.height) {
                        bricks[i][j].broken = true;
                        ball.vy *= -1;
                        score++;
                    }
                }
            }
        }

        ball.x += ball.vx;
        ball.y += ball.vy;
    }

    // render canvas graphics each frame
    function draw () {
        clear();

        // ball
        canvas.beginPath();
        canvas.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI, false);
        canvas.fillStyle = ball.color;
        canvas.fill();

        // paddle
        canvas.beginPath();
        canvas.rect(paddle.x - paddle.width / 2, paddle.y - paddle.height / 2, paddle.width, paddle.height);
        canvas.fillStyle = paddle.color;
        canvas.fill();

        // bricks
        for (var i = 0; i < BRICK_ROWS; i++) {
            for (var j = 0; j < BRICK_COLUMNS; j++) {
                if (!bricks[i][j].broken) {
                    var brickWidth = bricks[i][j].width,
                        brickHeight= bricks[i][j].height,
                        color;

                    // The color of a brick depends on its row.
                    switch(i) {
                        case 0:
                            color = COLOR_BLACK;
                            break;
                        case 1:
                            color = '#e84a5f';
                            break;
                        case 2:
                            color = '#ff847c';
                            break;
                        case 3:
                            color = '#fece78';
                            break;
                        default:
                            color = '#99b898';
                            break;
                    }


                    canvas.beginPath();
                    canvas.rect(bricks[i][j].x - brickWidth / 2, bricks[i][j].y - brickHeight / 2, brickWidth, brickHeight);

                    canvas.fillStyle = color;
                    canvas.fill();
                }
            }
        }

        // score
        canvas.font = 'bold 8px "Courier New"';
        canvas.fillStyle = COLOR_BLACK;
        canvas.fillText(score, SCORE_HORIZONTAL_OFFSET, height - SCORE_VERTICAL_OFFSET);
    }

    // initialize canvas to background color each frame
    function clear() {
        canvas.fillStyle = '#eeeeee';
        canvas.fillRect(0, 0, width, height);
    }
})();
