/*
    Hello and welcome to your 1 523'rd work assignment!

    Today we are going to make a 3 reel slot that starts, spins and stops.
    And if we are lucky enough to land the same symbol on all 3 reels, we win! WOHO!

    * Reels should start, spin and stop on random positions/symbols
    * If all 3 reels stops on the same symbol, play a win celebration.
    * You can use the WinsweepBox[00-25] sequence for win animation.
    * All available symbols can be found within assets.json

    The assignment will be judged with the following points in mind:
    * Creativity
    * Structure
    * Complexity
    * Look'n'feel

    Spritesheets can be created from https://www.codeandweb.com/tp-online
    Example on how to get started with sprites can be found in the run() method.

    If you have any questions, feel free to contact us at devlead@jaderabbitstudio.com
*/

const app = new PIXI.Application({
    width: 800,
    height: 500,
    backgroundColor: 0x1099bb,
    antialias: true,
    transparent: false,
    resolution: 1
});

let isSpinning = 0; // number of spinning reels'
let isWin = false;
const spriteHeight = 100;
const windowY = 120+1.5*spriteHeight;

window.addEventListener("load", async () => {
    await loadAssets();
    document.body.appendChild(app.view);
    await run();
});

async function loadAssets() {
    const assetPromises = [];
    assetPromises.push(PIXI.Assets.load("assets.json"));
    await Promise.all(assetPromises);
}

function createReel(spriteNames, spriteHeight, slotWindow, windowY=300, x) {
    let reel = new PIXI.Container();
    app.stage.addChild(reel);
    let y = 0;
    for(let spriteName of spriteNames.concat(spriteNames)){
        const sprite = new PIXI.Sprite(PIXI.Texture.from(spriteName));
        sprite.anchor.set(0.5);
        sprite.x = x;
        sprite.y = y;
        sprite.scale.set(spriteHeight/sprite.height, spriteHeight/sprite.height);
        reel.addChild(sprite);
        y += sprite.height;
    }
    reel.mask = slotWindow;
   
    // initial position of the reel (to see properly through window)
    const initPositionY = -reel.height*3/4 + windowY;
    reel.y = initPositionY;

    return reel;
}


function spinReels(reels, spriteHeight, numberSprites, windowY) {
    if (isSpinning === 0) {
        app.ticker.add(endGame);
        let winningPoses = [];

        for (let i= 0; i < 3; i++){
            let winningPos = randInt(numberSprites);
            winningPoses.push(winningPos);
            winningPos += (i+2)*numberSprites*2;
            let reel = reels[i];
            let speed = 3 + winningPos/5;
            isSpinning += 1;
            const initPositionY = -reel.height*3/4 + windowY;
       
            app.ticker.add(function f(delta) {
                if (reel.y < initPositionY + spriteHeight*winningPos) {
                    reel.y += speed * delta;
                } else {
                    reel.y = initPositionY + spriteHeight*winningPos;
                    isSpinning -= 1;
                    app.ticker.remove(f);
                }

                // Jump up by half reel length when it moved half down (to make it loop)
                while (reel.y > initPositionY + reel.height/2) {
                    reel.y -= reel.height/2;
                    winningPos -= numberSprites;
                }
            });
        }

        isWin = winningPoses.every(p => p === winningPoses[0]);
    }
}


// generate rand int in range [0,...,length-1]
function randInt(length){
    return Math.floor(Math.random() * length)
}


function endGame() {
    if (isSpinning === 0) {
        if (isWin) {
            isSpinning = 1;
            winAnimation();
        }
        app.ticker.remove(endGame);
    }
}

function winAnimation() {
    winTextures = [];
    for (let i = 0; i < 26; i++) {
        const texture = PIXI.Texture.from(i<10 ? `WinsweepBox0${i}.png` : `WinsweepBox${i}.png`);
        winTextures.push(texture);
    }

        const win = new PIXI.AnimatedSprite(winTextures);

        win.x = 0.5*app.screen.width;
        win.y = windowY-spriteHeight;
        win.anchor.set(0.5);
        win.scale.set(4.1*spriteHeight/win.width, 3*spriteHeight/win.height);
        win.animationSpeed = 0.2; // Set the animation speed
        win.loop = true;
        win.alpha = 0.5;
        win.play();
        app.stage.addChild(win);

    setTimeout(() => {
        app.stage.removeChild(win);
        isSpinning = 0;
    }, 5000);

}

async function run() {
    // create mask to show reel only in slot window
    let slotWindow = new PIXI.Graphics();
    slotWindow.beginFill(0xFFFFFF);
    slotWindow.drawRect(0, windowY-2.5*spriteHeight, 2000, spriteHeight*3);
    slotWindow.endFill();
    app.stage.addChild(slotWindow);

    const spriteNames = ['High1.png','High2.png','High3.png','High4.png'];
    let reels = [];

    for (let i= 0; i < 3; i++){
        reels.push(createReel(spriteNames, spriteHeight, slotWindow, windowY, app.screen.width*0.5 + (i-1)*spriteHeight*1.5));
    }

    const button = new PIXI.Sprite(PIXI.Texture.from('play_btn1.png'));
    button.scale.set(0.1);
    button.y = 350;
    button.x = 340;
    button.eventMode = 'static';


    button.addListener('pointerdown', () =>
    {
        spinReels(reels, spriteHeight, spriteNames.length, windowY);
    });
    app.stage.addChild(button);
}

