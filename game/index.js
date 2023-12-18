document.onready = function() {
    const ball = document.querySelector(".ball");
    const score_bar = document.querySelector(".score").getBoundingClientRect();
    const banner = document.querySelector(".banner");
    const score_banner = document.querySelector(".score-banner")
    const screen = {
        top: 0,
        left: 0,
        bottom: document.body.offsetHeight,
        right: document.body.offsetWidth
    };

    const accel = {x:0, y:0.5};
    const velocity = {x:0, y:0};
    const damp = 0.95;
    const traction = 0.8;

    function moveBall() {
        ball.style.setProperty("--top", circle.y+"px");
        ball.style.setProperty("--left", circle.x+"px");
    }
    const circle = {};
    circle.rad = 50;
    circle.x = ball.getBoundingClientRect().x + circle.rad;
    circle.y = ball.getBoundingClientRect().y + circle.rad;
    var obstacles = {};
    document.querySelectorAll(".obstacle").forEach((ele,idx) => {
        var type = ele.classList.contains("circ") ? "circ" : ele.classList.contains("rect") ? "rect" : "";
        var rect = ele.getBoundingClientRect();
        var mid_height = rect.height/2;
        var mid_width = rect.width/2;
        var rad;
        if (type == "circ") rad = mid_height;
        else if (type == "rect") rad = Math.sqrt(Math.pow(mid_height,2) + Math.pow(mid_width,2));
        obstacles[idx] = {
            x: rect.x + mid_width,
            y: rect.y + mid_height,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left,
            rad: rad,
            type: type,
            w: rect.width,
            h: rect.height
        }
    })

    function intersects(circ, rect) {
        var dx = Math.abs(circ.x - rect.x);
        var dy = Math.abs(circ.y - rect.y);
        
        return (
            (dx <= (circ.rad + rect.w/2)) &&
            (dy <= (circ.rad + rect.h/2)) &&
            Math.sqrt(dx*dx + dy*dy) <= (circ.rad + rect.rad)
        );
    }

    function clip() {
        if (circle.y + circle.rad > screen.bottom) {
            velocity.y *= -damp;
            circle.y = screen.bottom - circle.rad;
            velocity.x *= traction;
        }
        /*
        if (circle.y - circle.rad < screen.top) {
            velocity.y *= -damp;
            circle.y = screen.top + circle.rad;
        }
        if (circle.x - circle.rad < screen.left) {
            velocity.x *= -damp;
            circle.x = screen.left + circle.rad;
        }
        if (circle.x + circle.rad > screen.right) {
            velocity.x *= -damp;
            circle.x = screen.right - circle.rad;
        }
        */
        for (var idx in obstacles) {
            var obs = obstacles[idx];
            var dir = {
                x: (() => {
                    if ((obs.x - circle.x) == 0) {
                        return 0;
                    }
                    return Math.sign(obs.x - circle.x);
                })(),
                y: (() => {
                    if ((obs.x - circle.x) == 0) {
                        return (obs.y - circle.y);
                    }
                    return (obs.y - circle.y)/(obs.x - circle.x);
                })()
            };
            if (obs.type == "rect") {
                var dx = circle.x - obs.x;
                var dy = circle.y - obs.y;
                
                var inter = (
                    (Math.abs(dx) <= (circle.rad + obs.w/2)) &&
                    (Math.abs(dy) <= (circle.rad + obs.h/2)) &&
                    Math.sqrt(dx*dx + dy*dy) <= (circle.rad + obs.rad)
                );
                if (inter) {
                    if (circle.y < obs.bottom && circle.y > obs.top) {
                        velocity.x *= -damp;
                        if (circle.x > obs.left - circle.rad && circle.x < obs.left) {
                            circle.x = obs.left - circle.rad;
                        } else if (circle.x < obs.right + circle.rad && circle.x > obs.right) {
                            circle.x = obs.right + circle.rad;
                        }        
                    } else if (circle.x < obs.right && circle.x > obs.left) {
                        velocity.y *= -damp;
                        if (circle.y > obs.top + circle.rad && circle.y < obs.top) {
                            circle.y = obs.top + circle.rad;
                        } else if (circle.y < obs.bottom + circle.rad && circle.y > obs.bottom) {
                            circle.y = obs.bottom + circle.rad;
                        }        
                    }
                }
            } else if (obs.type == "circ") {
                var dis = Math.sqrt(Math.pow((circle.x - obs.x), 2) + Math.pow((circle.y - obs.y), 2)) - circle.rad - obs.rad;
                var rap = Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2));
                if (dis < 0) {
                    var den = Math.sqrt(1+Math.pow(dir.y, 2))
                    var fix = dis / den;
                    var fix2 = rap / den;
                    circle.x += fix*dir.x;
                    circle.y -= fix*dir.y;
                    velocity.x = clamp(-damp*fix2*dir.x, max_vel);
                    velocity.y = clamp(damp*fix2*dir.y, max_vel);
                }
            }
        }
        if (circle.x > score_bar.left + circle.rad/2 && circle.x < score_bar.right - circle.rad/2) {
            if (circle.y < score_bar.top) {
                aux_top_score = true;
                aux_bot_score = false;
            } else if (circle.y > score_bar.bottom) {
                if (aux_top_score && !aux_bot_score && !scored) {
                    score += 1;
                    score_banner.innerHTML = score;
                    scored = true;
                    banner.innerHTML = "Scored!";
                    stop()
                    setTimeout(() => {
                        banner.innerHTML = "";
                        start();
                        scored = false;
                    }, 1500);
                }
                aux_bot_score = true;
                aux_top_score = false;
            } 
        } else {
            aux_top_score = false;
            aux_bot_score = false;
        }
        if ((circle.x - circle.rad < screen.left || circle.x + circle.rad > screen.right) && !scored && !out_of_bounds) {
            banner.innerHTML = "Out of bounds...";
            stop()
            out_of_bounds = true
            setTimeout(() => {
                banner.innerHTML = "";
                start();
                out_of_bounds = false;
            }, 1500);
        }
        velocity.x += accel.x;
        velocity.y += accel.y;
        circle.x += velocity.x;
        circle.y += velocity.y;
    }

    function physics() {
        clip();
        moveBall();
    }

    function clamp(val, clamp_val) {
        if (val > clamp_val) return clamp_val;
        if (val < -clamp_val) return -clamp_val;
        return val;
    }

    var moving;
    var last_pressed = false;
    var pressed = false;
    var last_inside = false;
    var inside = false;
    var cleared = false;
    var aux_top_score = false;
    var aux_bot_score = false;
    var score = 0;
    var scored = false;
    var out_of_bounds = false;
    const max_vel = 20;

    function dragging({movementX, movementY}) {
        if (inside && pressed) {
            clearInterval(moving)
            cleared = true;
            circle.x += movementX;
            circle.y += movementY;
            moveBall();
        } else if ((!pressed && last_pressed && inside) || (pressed && !inside && last_inside)) {
            if (cleared) {
                velocity.x = clamp(movementX, max_vel);
                velocity.y = clamp(movementY, max_vel);
                moving = setInterval(physics, 8);
                cleared = false;
            }
        }
    }

    function start() {
        ball.addEventListener("mouseover", () => {
            last_inside = false;
            inside = true;
        })

        ball.addEventListener("mouseout", () => {
            last_inside = true;
            inside = false;
        })

        window.addEventListener("mousedown", () => {
            last_pressed = false;
            pressed = true;
        })

        window.addEventListener("mouseup", () => {
            last_pressed = true;
            pressed = false;
        })

        again();
    }

    function stop() {
        ball.removeEventListener("mouseover", () => {
            last_inside = false;
            inside = true;
        })

        ball.removeEventListener("mouseout", () => {
            last_inside = true;
            inside = false;
        })

        window.removeEventListener("mousedown", () => {
            last_pressed = false;
            pressed = true;
        })

        window.removeEventListener("mouseup", () => {
            last_pressed = true;
            pressed = false;
        })
    }

    window.addEventListener("mousemove", dragging);

    function again() {
        clearInterval(moving);
        circle.x = 0.25 * screen.right;
        circle.y = 0.75 * screen.bottom;
        moveBall();
    }

    start();

}()
