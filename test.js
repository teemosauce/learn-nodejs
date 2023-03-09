var kx = 8,
    ky = 8,
    kz = 8;


// x-y-z

// 0-0-1 1  0-1-1 2
// 0-0-0 0  0-1-0 3

// 1-0-1 6  1-1-1 5
// 1-0-0 7  1-1-0 4
function XYZ(x, y, z) {

    if (x >= kx || y >= ky || z >= kz || x < 0 || y < 0 || z < 0) return -1;
    var m = x * ky * kz,
        n;


    if ((x + y) & 1) {
        if (x & 1) {
            n = m + (ky - 1 - y) * ky + (kz - 1 - z);
        } else {
            n = m + y * ky + (kz - 1 - z);
        }
    } else {
        if (x & 1) {
            n = m + (ky - 1 - y) * ky + z;
        } else {
            n = m + y * ky + z;
        }
    }
    let rem = mReverse && '反向' || '正向'
    // console.log(`XYZ(${x}, ${y}, ${z}) = ${n} 沿${mAxis}${rem}`)
    return n;
}

function testXYZ() {

    let arr = []
    for (var x = 0; x < kx; x++) {
        for (var y = 0; y < ky; y++) {
            for (var z = kz - 1; z >= 0; z--) {
                arr.push(XYZ(x, y, z))
            }
        }
    }

    arr = arr.sort((x, y) => {
        if (x > y) {
            return 1;
        } else {
            return -1
        }
    })
    console.log(arr);
}

var mAxis = 'a';
var mReverse;

function random_the_axis() {
    var k;
    if (mAxis == 'a') {
        k = random8() % 3;
        switch (k) {
            case 0:
                mAxis = 'x';
                break;
            case 1:
                mAxis = 'y';
                break;
            case 2:
                mAxis = 'z';
                break;
            default:
                break;
        }
    } else {
        k = random8() % 2;
        switch (mAxis) {
            case 'x':
                mAxis = k == 0 ? 'y' : 'z';
                break;
            case 'y':
                mAxis = k == 0 ? 'x' : 'z';
                break;
            case 'z':
                mAxis = k == 0 ? 'x' : 'y';
                break;
            default:
                break;
        }
    }

    mReverse = random8() % 2 == 1;
}


function random8(n) {
    if (isNaN(n) || n > 256) {
        n = 256;
    }
    return Math.floor(Math.random() * n);
}

function next_one(t) {

    var m = mReverse ? -1 : 1;
    switch (mAxis) {
        case 'x':
            if ((mReverse && startX == 0) || (!mReverse && startX == 7)) {
                if (t > 0) {
                    mReverse = mReverse ? 1 : -1;
                } else {
                    random_the_axis();
                }
                next_one(t++);
            } else {
                startX = startX + m;
            }
            break;
        case 'y':
            if ((mReverse && startY == 0) || (!mReverse && startY == 7)) {
                if (t > 0) {
                    mReverse = mReverse ? 1 : -1;
                } else {
                    random_the_axis();
                }
                next_one(t++);
            } else {
                startY = startY + m;
            }
            break;
        case 'z':
            if ((mReverse && startZ == 0) || (!mReverse && startZ == 7)) {
                if (t > 0) {
                    mReverse = mReverse ? 1 : -1;
                } else {
                    random_the_axis();
                }
                next_one(t++);
            } else {
                startZ = startZ + m;
            }
            break;
        default:
            break;
    }
}
let startX = -1,
    startY = -1,
    startZ = -1,
    ledsOn = [-1, -1, -1, -1, -1];

function rand_one() {

    var n = XYZ(startX, startY, startZ);
    if (n == -1) {
        startX = random8(8);
        startY = random8(8);
        startZ = random8(8);
        random_the_axis();
        n = XYZ(startX, startY, startZ);
    }

    // console.log(startX, startY, startZ);
    var hasClose = true;
    for (var i = 0; i < 5; i++) {
        if (ledsOn[4 - i] == -1) {
            ledsOn[4 - i] = n;
            hasClose = false;
            break;
        }
    }
    // console.log(ledsOn)

    if (hasClose) {
        for (var i = 0; i < 5; i++) {
            ledsOn[4 - i] = ledsOn[3 - i];
        }
        ledsOn[0] = n;
    }

    next_one(0);
}

// setInterval(() => {
//     // random_the_axis();
//     // console.log(mAxis);
//     // console.log(mReverse);

//     rand_one();
// }, 1000)

// console.log(XYZ(7, 0, 0));


function a() {

    for (var t = 0; t < 4; t++) {
        let leds = [];
        for (var k = t; k < 8 - t; k++) {
            leds.push(XYZ(k, t, t));
            leds.push(XYZ(k, t, 7 - t));
            leds.push(XYZ(k, 7 - t, t));
            leds.push(XYZ(k, 7 - t, 7 - t));

            leds.push(XYZ(t, k, t));
            leds.push(XYZ(t, k, 7 - t));
            leds.push(XYZ(7 - t, k, t));
            leds.push(XYZ(7 - t, k, 7 - t));

            leds.push(XYZ(t, t, k));
            leds.push(XYZ(t, 7 - t, k));
            leds.push(XYZ(7 - t, t, k));
            leds.push(XYZ(7 - t, 7 - t, k));
        }
        console.log("================================================");
        console.log(sorted(leds));
    }

    // for (var x = 0; x < 8; x++) {
    //     leds.push(XYZ(x, 0, 0));
    //     leds.push(XYZ(x, 0, 7));
    //     leds.push(XYZ(x, 7, 0));
    //     leds.push(XYZ(x, 7, 7));
    // }

    // for (var x = 1; x < 7; x++) {
    //     leds.push(XYZ(x, 1, 1));
    //     leds.push(XYZ(x, 1, 6));
    //     leds.push(XYZ(x, 6, 1));
    //     leds.push(XYZ(x, 6, 6));
    // }

    // for (var x = 2; x < 6; x++) {
    //     leds.push(XYZ(x, 2, 2));
    //     leds.push(XYZ(x, 2, 5));
    //     leds.push(XYZ(x, 5, 2));
    //     leds.push(XYZ(x, 5, 5));
    // }

    // for (var x = 3; x < 5; x++) {
    //     leds.push(XYZ(x, 3, 3));
    //     leds.push(XYZ(x, 3, 4));
    //     leds.push(XYZ(x, 4, 3));
    //     leds.push(XYZ(x, 4, 4));
    // }

    // console.log(leds)
}

function sorted(arr) {
    return arr.sort((x, y) => {
        if (x > y) {
            return 1;
        } else {
            return -1
        }
    })
}

// a();


// x=0 y=[0,1,2,3,4,5,6,7] z=0
// x=1 y=[0,7] z=0
// x=2 y=[0,7] z=0
// x=3 y=[0,7] z=0
// x=4 y=[0,7] z=0
// x=5 y=[0,7] z=0
// x=6 y=[0,7] z=0
// x=7 y=[0,1,2,3,4,5,6,7] z=0


// x=1 y=[1,2,3,4,5,6] z=1
// x=2 y=[1,6] z=1
// x=3 y=[1,6] z=1
// x=4 y=[1,6] z=1
// x=5 y=[1,6]  z=1
// x=6 y=[1,2,3,4,5,6] z=1


// x=2 y=[2,3,4,5] z=2
// x=3 y=[2,5] z=2
// x = 4 y = [2, 5] z=2
// x = 5 y = [2, 3, 4, 5] z=2


// x = 3 y = [3, 4] z = 3
// x = 4 y = [3, 4] z = 3


// x = 3 y = [3, 4] z = 4
// x = 4 y = [3, 4] z = 4

// x = 2 y = [2, 3, 4, 5] z = 5
// x = 3 y = [2, 5] z = 5
// x = 4 y = [2, 5] z = 5
// x = 5 y = [2, 3, 4, 5] z = 5

// Z+方向 X+ >> Y+ >> X- >> Y- <0, 0, 0>


function get() {
    var start, end, x, y, z;
    for (z = 0; z < 8; z++) {

        if (z < 4) {
            start = z;
            end = 8 - z;
        } else {
            start = 7 - z;
            end = 1 + z;
        }

        for (x = start; x < end; x++) {
            console.log(x, start, z);
        }

        for (y = start + 1; y < end; y++) {
            console.log(end - 1, y, z);
        }


        for (x = start + 1; x < end; x++) {
            console.log(7 - x, end - 1, z);
        }

        for (y = start + 1; y < end; y++) {
            console.log(8 - end, 7 - y, z);
        }
    }
}


// get();

function randomPlus(minNum, maxNum, n) {
    var count = maxNum - minNum;
    var numbers = [];

    for (var i = 0; i < maxNum - minNum; i++) {
        numbers[i] = i + minNum;
    }

    var result = [];

    for (var i = 0; i < n; i++) {
        var seed = Math.round(Math.random() * 10000) % (count - i);
        result[i] = numbers[seed];
        numbers[seed] = numbers[count - 1 - i];
    }

    return result;
}

function testRandomPlus() {
    for (var i = 0; i < 100; i++) {
        if (hasSame(randomPlus(0, 10, 3))) {
            console.log("random 方法有问题");
        }
    }
}

function hasSame(arr) {
    var same = false;
    for (var i = 0; i < arr.length; i++) {
        for (var j = i + 1; j < arr.length; j++) {
            if (arr[i] == arr[j]) {
                same = true;
                break;
            }
        }
    }
    return same;
}

// testRandomPlus();


function layer_fill_cube() {
    var x, y, z;
    for (var n = 0; n < 4; n++) {
        for (z = n; z < 8 - n; z++) {
            for (var i = 0; i < 4; i++) {

                for (var k = n; k < 8 - n; k++) {
                    switch (i) {
                        case 0:
                            x = k;
                            y = n;
                            break;
                        case 1:
                            x = 7 - n;
                            y = k;
                            break;
                        case 2:
                            x = 7 - k;
                            y = 7 - n;
                            break;
                        case 3:
                            x = n;
                            y = 7 - k;
                            break;
                        default:
                            break;
                    }
                    console.log(x, y, z);
                }
            }

            console.log("=============")
        }
    }
}

// layer_fill_cube();

function showPoints() {
    for (var n = 0; n < 8; n++) {
        console.log("==== " + n + " ===");
        var arr = [];
        for (var m = 0; m < 8; m++) {
            if (n > m) {
                arr.push([m, n]);
            } else if (m + n >= 8) {
                arr.push([m, 7 - n]);
            } else {
                arr.push([m, m]);
            }


        }
        console.log(arr);

    }
}

// showPoints();

function mFloat() {
    for (let z = 0; z < 8; z++) {
        console.log("========");
        for (let y = 0; y <= z; y++) {
            for (let x = 0; x <= z; x++) {

                if (x + y == z) {
                    console.log(x, y);
                }
            }
        }
    }
}

// mFloat();

// 
function ripples(iterations) {
    var k, n;
    var arr = [];
    var leds = [];
    for (var i = 0; i < iterations; i++) {
        k = 0;
        for (var y = 0; y < 8; y++) {
            for (var x = 0; x < 8; x++) {
                var distance = distance2d(3.5, 3.5, x, y) / 9.899495 * 8;
                z = 4 + Math.sin(distance / 1.3 + i / 50) * 4;
                n = XYZ(x, y, parseInt(z));
                arr[k++] = n;
                leds[n] = 1;
                console.log(x, y, z);
            }
        }
        for (k = 0; k < arr.length; k++) {
            leds[arr[k]] = 0;
        }

        // console.log(sorted(arr).join("-"));
    }
}

function distance2d(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

// ripples(2)

for(var i = 0;i<5;i+=0.1){
    console.log(Math.sin(i));
}