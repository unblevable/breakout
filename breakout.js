(function () {
    var FRAMES_PER_SECOND = 30,
    PADDLE_VERTICAL_OFFSET = 40,
    BRICK_ROWS = 5,
    BRICK_COLUMNS = 10,
    SCORE_HORIZONTAL_OFFSET = 12,
    SCORE_VERTICAL_OFFSET = 12,
    COLOR_BLACK = '#2a363b',
    START_VELOCITY = 6.5,

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

    document.addEventListener('DOMContentLoaded', function () {
        initialize();
    }, false);
    document.addEventListener('keydown', function (event) {
        activeKeys[event.keyCode] = true;
    }, false);
    document.addEventListener('keyup', function (event) {
        activeKeys[event.keyCode] = false;
    }, false);

    // constructors ---------------------------------------------------------------

    function Ball () {
        // origin at center of object
        this.x = 0;
        this.y = 0;

        // velocity
        this.vx = 6.5;
        this.vy = -6.5;

        this.radius = 2;

        // for convenience
        this.width = this.radius * 2;
        this.height = this.radius * 2;

        this.color = COLOR_BLACK;

        this.draw = function (canvas) {
            canvas.beginPath();
            canvas.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
            canvas.fillStyle = this.color;
            canvas.fill();
        }

        this.move = function () {
            this.x += this.vx;
            this.y += this.vy;
        }
    }

    function Paddle () {
        this.x = 0;
        this.y = 0;
        this.vx = 5;
        this.width = 35;
        this.height = 4;
        this.color = COLOR_BLACK;

        this.draw = function (canvas) {
            canvas.beginPath();
            canvas.rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
            canvas.fillStyle = this.color;
            canvas.fill();
        }
    }

    function Brick (color) {
        this.x = 0;
        this.y = 0;
        this.width = 40;
        this.height = 20;
        this.broken = false;
        this.color = color;

        this.draw = function (canvas) {
            if (!this.broken) {
                canvas.beginPath();
                canvas.rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

                canvas.fillStyle = this.color;
                canvas.fill();
            }
        }
    }


    // other functions ------------------------------------------------------------

    function initialize () {
        canvasElement = document.getElementsByTagName('canvas')[0];
        canvas = canvasElement.getContext('2d');
        width = canvasElement.offsetWidth;
        height = canvasElement.offsetHeight;

        activeKeys = {};
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
                var color;

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
                brick = new Brick(color);
                brick.x = j * brick.width + brick.width / 2;
                brick.y = i * brick.height + brick.height / 2;
                bricks[i][j] = brick;

            }
        }

        // start game loop and set frame rate to 60 fps
        loop = setInterval(function () {
                update();
                draw();
                }, 1000 / FRAMES_PER_SECOND);
    }

    // update game logic each frame
    function update () {
        // handle keyboard input
        if (activeKeys['37'] && paddle.x - paddle.width / 2 > 0) {
            paddle.x -= paddle.vx;
        } else if (activeKeys['39'] && paddle.x + paddle.width / 2 < width) {
            paddle.x += paddle.vx;
        }

        // check ball-paddle collision
        if (isColliding(ball, paddle)) {
            ball.vy *= -1;
        }

        // check ball-brick collision
        for (var i = 0; i < BRICK_ROWS; i++) {
            for (var j = 0; j < BRICK_COLUMNS; j++) {
                var brick = bricks[i][j];

                if (!brick.broken) {
                    if (isColliding(ball, brick)) {
                        brick.broken = true;
                        ball.vy *= -1;
                        score++;
                    }
                }
            }
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

        ball.move();
    }

    // render canvas graphics each frame
    function draw () {
        clear();

        // ball
        ball.draw(canvas);

        // paddle
        paddle.draw(canvas);

        // bricks
        for (var i = 0; i < BRICK_ROWS; i++) {
            for (var j = 0; j < BRICK_COLUMNS; j++) {
                if (!bricks[i][j].broken) {
                    bricks[i][j].draw(canvas);
                }
            }
        }

        // score
        canvas.font = 'bold 8px "Courier New"';
        canvas.fillStyle = COLOR_BLACK;
        canvas.fillText(score, SCORE_HORIZONTAL_OFFSET, height - SCORE_VERTICAL_OFFSET);
    }

    // initialize canvas to background color each frame
    function clear () {
        canvas.fillStyle = '#eeeeee';
        canvas.fillRect(0, 0, width, height);
    }

    // bounding-box collision detection
    function isColliding (a, b) {
        return ball.x - a.width / 2 < b.x + b.width / 2 &&
                            a.x + a.width / 2 > b.x - b.width / 2 &&
                            a.y - a.height / 2 < b.y + b.height &&
                            a.y + a.height / 2 > b.y - b.height;
    }
})();

