var global={};
var app = app || { path: "" };
var mgs = mgs || {};
var noSleep;

global.size = {width: 1080, height: 610}; //landscape;
//global.size = {width: 610, height: 1080}; //portrait
global.center = {x: global.size.width / 2, y: global.size.height / 2};

const debugMode = false;

const betDenom = [1,2,5,10,20,50,100,200,500,1000];
let betDenomCounter = 0;


let balance = 700;
//let winAmount = 0;

let coinAnim;
let elem = {};
let sfx = {};

global.clickStatus = false;
global.autoStatus = false;

const gameConfig = {
    winRate : .6,
}
let serverResultOdds;

const defaultSfxMarker = [
    {name : 'betAmt', start : 0, duration : .2, config : { volume : .3 } },

    {name : 'click-sfx', start : 1, duration : .2, config : { volume : .3 } },
    {name : 'submit-sfx', start : 2, duration : .5, config : { volume : .3 } },
    {name : 'deselect-sfx', start : 3, duration : .5, config : { volume : .3 } },
    {name : 'error-sfx', start : 4, duration : .5, config : { volume : .3} },
    {name : 'coin-sfx', start : 5, duration : .7, config : { volume : .3 } },

    {name : 'win-sfx', start : 6, duration : 1.5, config : { volume : .3 } },
    {name : 'win-small-sfx', start : 8, duration : .5, config : { volume : .3 } },
    {name : 'tallyloop', start : 9, duration : .47, config : { volume : .3, loop: true } },
]

class MainScene extends Phaser.Scene{
    constructor(){
        super({
            key : 'MainScene',
            active : true,
            pack : {
                files : [
                    { type : 'image' , key : 'loading-page' , url : 'asset/texture/loading-page.jpg'},
                   //{ type : 'bitmapFont' , key : 'creepster', textureURL: 'asset/texture/creepster.png' , fontDataURL : 'asset/texture/creepster.xml' }
                    //{ type : 'spritesheet', key : 'balloonLoading' , url : 'asset/texture/bet-summary.png' , frameConfig : { frameWidth: 62, frameHeight: 84}  }
                ]
            }
        })
    }
    init(data){
        
    }
    preload(){
        const loadingPage = this.add.image(global.center.x, global.center.y,'loading-page');
        const loadingBar = this.add.graphics();
        this.load.on('progress',(data)=>{
            loadingBar.clear();
            loadingBar.fillStyle(0xff1c1c,1);
            loadingBar.fillRect(44,572,992*data,20);
        });
        this.load.on('complete',(data)=>{
            loadingBar.destroy();
            loadingPage.destroy();
        });
        

        this.load.setPath('asset/texture');
        this.load.spritesheet('bal-emit','bal-emit.png',{ frameWidth: 75, frameHeight : 34 });
        this.load.spritesheet('coin','coin.png',{ frameWidth: 75, frameHeight : 75 });
        this.load.spritesheet('toggle','fullscreenToggle.png',{ frameWidth: 143, frameHeight : 152 });
        this.load.spritesheet('confetti','confetti.png',{ frameWidth: 17, frameHeight : 35 });

        this.load.atlas('UI','ui.png','ui.json');
        this.load.atlas('main','main.png','main.json');

        this.load.image('bg.png','bg.png');
        this.load.image('fg.png','fg.png');

        //dish with prize
        this.load.image('rays3.png','rays3.png');

        //bitmap
        this.load.bitmapFont('skarjan','skarjan.png','skarjan.xml');

        //audio
        this.load.audio('default-sfx','../audio/default-sfx.mp3');
        this.load.audio('step-sfx','../audio/footstep-water.mp3');
        this.load.audio('step-grass-sfx','../audio/footstep-wetgrass.mp3');
        this.load.audio('splash-sfx','../audio/splash.mp3');
        this.load.audio('dip-sfx','../audio/splash-dip.mp3');
        this.load.audio('pan-sfx','../audio/metal-pan-impact.mp3');
        this.load.audio('cry-sfx','../audio/cry.mp3');
        this.load.audio('water-loop','../audio/water-loop.mp3');
        this.load.audio('bgm','../audio/bull-ride-bgm.mp3');

        //spine
        //this.load.spine('character-spine', 'character-spine.json', [ 'character-spine.atlas' ], true);
        this.load.spine('wave-spine', 'wave.json', [ 'wave.atlas' ], true);
        this.load.spine('rock-spine', 'rock.json', [ 'rock.atlas' ], true);
        this.load.spine('man-spine', 'man-spine.json', [ 'man-spine.atlas' ], true);
        this.load.spine('ripples-spine', 'ripples.json', [ 'ripples.atlas' ], true);

        // this.load.spine('buttons', 'buttons.json', [ 'buttons.atlas' ], true);
    }
    create(){
        if(debugMode){
            const debugBtn = this.add.image(global.size.width-50,50,'toggle',0).setDepth(20).setScale(.5).setScrollFactor(0).setInteractive();
            debugBtn.on('pointerup',()=>{
                if(debugBtn.frame.name === 0){
                    
                    this.scale.startFullscreen();
                    debugBtn.setFrame(1);
                }else{
                    
                    this.scale.stopFullscreen();
                    debugBtn.setFrame(0);
                }
                
            },this)
        }
        this.sound.play('bgm',{ volume : .2, loop : true });
        this.sound.play('water-loop',{ volume : .1, loop : true });

        const bg = this.add.image(540,305,'bg.png');
        const wave = this.add.spine(530,230+20,'wave-spine','main-idle',true).setScale(1.1);
        wave.timeScale = .3;
        const rock1 = this.add.spine(140,290,'rock-spine','rock1',true);
        const rock2 = this.add.spine(970,270,'rock-spine','rock2',true);
        const rock3 = this.add.spine(760,330,'rock-spine','rock3',true).setScale(.8);
        rock1.timeScale = .5;
        rock2.timeScale = .5;
        rock3.timeScale = .5;
        const fg = this.add.image(540,610+20,'fg.png').setOrigin(.5,1);
        //fg.preFX.addPixelate(10);
        //const manMain = this.add.spine(580,410,'man-spine','idle',true).setScale(.7);
        const manMain = this.add.spine(590,520,'man-spine','idle',true).setScale(.7);
        const ripplesMain = this.add.spine(570,520-30,'ripples-spine','idle',true).setScale(1.1,1.3).setVisible(false);
        ripplesMain.timeScale = .8

        const uiContainer = this.add.container();
        const minusBtn = this.add.image(60,560,'UI','btn-minus.png').setInteractive();
        const addBtn = this.add.image(320,560,'UI','btn-add.png').setInteractive();
        const betAmtBg = this.add.image(190,560,'UI','bet-amt-bg.png');
        const betAmtDisplay = this.add.bitmapText(190,560,'skarjan',betDenom[betDenomCounter],35).setOrigin(.5)
        const balBg = this.add.image(500,560,'UI','bal-bg.png');
        const balanceDisplay = new BalanceDisplay(this , 500 , 560, null ,balance , 2 , 30 ,  'skarjan' );
        const infoBtn = this.add.image(680,560,'UI','btn-info.png').setInteractive();
        const stopBtn = this.add.image(800,560,'UI','btn-stop.png').setVisible(false).setInteractive();
        const autoBtn = this.add.image(800,560,'UI','btn-auto.png').setInteractive();
        const submitBtn = this.add.image(970,560,'UI','btn-submit.png').setInteractive();
        //const submitBtn = this.add.spine(970,560,'buttons').setSkinByName('submit').setInteractive();
        uiContainer.add([ minusBtn, addBtn, betAmtBg, betAmtDisplay, balBg, infoBtn, stopBtn, autoBtn, submitBtn ]);

        // const negat = this.add.spine(540,200,'buttons').setSkinByName('minus').setInteractive();
        // negat.on('pointerdown',()=>{
        //     console.log('negat');
        //     negat.play('minus-shine',false);
        // })

        const confettiEmitter = this.add.particles(0,0,'confetti',{
            x : { min : 0, max : 1080 },
            y : -20,
            frame : [0,1,2,3,4],
            speed : { min : 20, max : 100 },
            lifespan : { min: 1500, max : 3000},
            scale : { min : .7, max : 1 },
            frequency : -1,
            quantity : 3,
            rotate : {start : 0, end : 360 },
            gravityY : 300,
        })

        const winAmtModal = this.add.container();
        const winAmtBg = this.add.image(540,420,'UI','win-amt-bg-bottom.png');
        const raysLarge = this.add.image(540,350,'rays3.png').setBlendMode('ADD').setScale(1).setAlpha(.3).setVisible(false);
        const rays = this.add.image(540,350,'rays3.png').setBlendMode('ADD').setScale(.2).setAlpha(.3).setVisible(false);
        const continueBtn = this.add.image(540,490,'UI','btn-continue.png').setScale(.8).setInteractive();
        this.tweens.add({
            targets : rays,
            repeat : -1,
            rotation : Phaser.Math.DegToRad( 359 ),
            duration : 2000,
        })
        this.tweens.add({
            targets : raysLarge,
            repeat : -1,
            rotation : Phaser.Math.DegToRad( -359 ),
            duration : 4000,
        })
        const prizeLabel = this.add.image(540,270,'main','gold-nugget-label.png');
        const winAmtDisplay = this.add.bitmapText(540,425,'skarjan',0,30).setOrigin(.5);

        winAmtModal.add([ winAmtBg, raysLarge, rays, continueBtn, prizeLabel,winAmtDisplay ]);
        winAmtModal.setY(500);

        const resetTimerDisplay = this.add.bitmapText(540,210,'skarjan',5,35).setOrigin(.5).setVisible(false);
        let resetTimer = this.time.addEvent();
        const resetTimerCfg = {
            delay : 1000,
            repeat : 5,
            callback : ()=>{
                //console.log(  resetTimer.repeatCount )
                resetTimerDisplay.setText( resetTimer.repeatCount ).setScale(1).setVisible(true);
                this.tweens.add({
                    targets : resetTimerDisplay,
                    duration : 200,
                    scaleX : 1.3,
                    scaleY : 1.3,
                    ease : 'Back.out',
                })
                if( resetTimer.repeatCount === 0 ){
                    readyProcess();
                }
            }
        }
        

        const noBalanceModal = this.add.container();
        const noBalance = this.add.image(540,180,'UI','no-balance.png');
        const noBalanceBtn = this.add.image(540,300,'UI','btn-no-balance.png').setInteractive();
        noBalanceModal.add([ noBalance, noBalanceBtn]);
        noBalanceModal.setVisible(false);
        noBalanceBtn.on('pointerdown',()=>{
            this.sound.play('default-sfx',defaultSfxMarker[3]);
            this.tweens.add({
                targets : noBalanceBtn.preFX.addBarrel(1),
                amount : 1.5,
                duration : 100,
                yoyo : true,
                ease : 'Circ.in',
                onComplete : ()=>{
                    noBalanceModal.setVisible(false);
                }
            })
        })

        const winMsg = this.add.image(540,40,'main','win-msg-1.png').setVisible(false);
        const loseMsg = this.add.image(540,190,'main','lose-msg.png').setVisible(false);

        const infoModal = this.add.container();
        const info = this.add.image(540,170,'UI','info-v2.png');
        const closeBtn = this.add.image(700,70,'UI','btn-close.png').setScale(.8).setInteractive();
        infoModal.add([ info, closeBtn ]);
        infoModal.setY(-500).setDepth(5);
        infoBtn.on('pointerdown',()=>{
            //if(global.clickStatus)return
            if(infoModal.y == -500){
                this.sound.play('default-sfx',defaultSfxMarker[1]);
                infoModal.setVisible(true);
                this.tweens.add({
                    targets : infoModal,
                    duration : 600,
                    ease : 'Back.easeOut',
                    y : 0,
                })
            }
            if(infoModal.y == 0){
                this.sound.play('default-sfx',defaultSfxMarker[3]);
                this.tweens.add({
                    targets : infoModal,
                    duration : 600,
                    ease : 'Back.easeOut',
                    y : -500,
                    onComplete : ()=>{
                        //infoModal.setVisible(false);
                    }
                })
            }
        })
        closeBtn.on('pointerdown',()=>{
            //if(global.clickStatus)return
            this.sound.play('default-sfx',defaultSfxMarker[3]);
            this.tweens.add({
                targets : infoModal,
                duration : 600,
                ease : 'Back.easeOut',
                y : -500,
            })
        })

        const dishPrize =  this.add.image(480,220,'main','empty.png').setScale(.6).setVisible(false);

        //const dishPrize =  this.add.image(540,350,'empty.png').setScale(1).setVisible(true);

        const circleBorder = this.add.image(775,200,'UI','circle-border.png').setScale(0);
        const circ = this.add.image(775,200,'UI','mask.png').setScale(0);
        const mask = this.add.bitmapMask(circ);
        const closeUpCam = this.cameras.add(600,25,350,350).setZoom(2.5).setScroll(265,125);
        closeUpCam.setMask(mask).setVisible(false);
        //const liveLabel = this.add.image(675,100,'live.png').setScale(1).setDepth(15);
        const liveLabel = this.add.image(775,200,'UI','live.png').setScale(0);
        //625,60
        // const circ2 = this.add.image(300,100,'mask.png');
        // circ2.preFX.addShadow( 0, -50, 0.006, 1, 0x000000, 6,1 );
        
        const coinBounds = new Phaser.Geom.Rectangle(540-300,-100,600,600);
        if(debugMode){
            const graphics = this.add.graphics();
            graphics.lineStyle(1, 0x00ff00);
            graphics.strokeRectShape(coinBounds);
        }

        this.anims.create({
            key : 'flip',
            frames : this.anims.generateFrameNumbers('coin'),
            frameRate : 30,
            repeat : -1,
        })
        /*
        const coinEmitter = this.add.particles(540,305,'coin',{
            anim : 'flip',
            speed : {min : 400, max: 700 },
            lifespan : {min : 4000, max: 5000 },
            //scale: { start: 0, end: 1.5, ease: 'Quad.easeOut' },
            scale : {
                // start : .35, 
                // end: 1,
                // yoyo : true,
                // steps: 10,
                //value : .35,
                // ease: 'Quad.easeIn',
                // onUpdate  : (p,k,t,v)=>{
                //     return 1 - 2 * Math.abs(t - .5);
                // }
                // onEmit  : (p,k,t,v)=>{
                //     return 2;
                // },
                onUpdate  : (p,k,t,v)=>{
                    return 1 - 2 * Math.abs(t - .5);
                }
            },
            frequency : 1000,
            rotate : { min: 0, max: 360 },
            angle : { min : 250, max : 290},
            gravityY : 700,
            bounds : coinBounds,
            bounce : .3,
            //hold : 100,
            alpha: 1,
            //alpha: { start: 1, end: 0, ease: 'Quad.easeIn' },
        }).setDepth(3);
        */

        const coinEmitter = this.add.particles(540,305,'coin',{
            anim : 'flip',
            speed : {min : 400, max: 700 },
            lifespan : {min : 4000, max: 5000 },
            scale : .35,
            frequency : -1,
            rotate : { min: 0, max: 360 },
            angle : { min : 250, max : 290},
            gravityY : 700,
            bounds : coinBounds,
            bounce : .3,
            alpha: 1,
            emitCallback : (e)=>{
                //console.log(e.life)
                this.tweens.add({
                    targets : e,
                    duration : e.life/2,
                    props :{
                        //alpha : {from : 1, to :0 },
                        scaleX : {from : 0, to :.5 },
                        scaleY : {from : 0, to :.5 },
                    },
                    yoyo : true,
                })
            }
        }).setDepth(3);
        

        // coinEmitter.ops.scaleX.onUpdate((p,k,t,v)=>{
        //     return 1 - 2 * Math.abs(t - .5);
        // })
        //console.log(coinEmitter.particleAlpha)
        //coinEmitter.setTint(0xffffff, 0x000000, 3000);
        // this.tweens.add({
        //     targets : coinEmitter.ops.alpha,
        //     particleAlpha : 0,
        //     duration : 200,
        //     yoyo : -1,
        // })
        

        //console.log(coinEmitter.ops.alpha.onEmit())
        // coinEmitter.ops.alpha.yoyo = true;
        // coinEmitter.ops.alpha.propertyValue = 0;
        // coinEmitter.setScale((p,k,t)=>{
        //     //console.log( p )
        //     //console.log( k )
        //     //console.log( t )
        //     return 1 - 2 * Math.abs(t - .5);
        // })


        manMain.setMix('idle','walk',.3);
        manMain.setMix('walk','idle',.3);
        manMain.setMix('dip-stand','filter-stand',.5);
        manMain.setMix('filter-stand','show-stand',.5);
        manMain.setMix('dip-kneel','filter-kneel',.5);
        manMain.setMix('filter-kneel','show-kneel',.5);
        manMain.setMix('show-kneel','idle-with-treasure',.3);
        manMain.setMix('show-stand','idle-with-treasure',.5);
        manMain.setMix('idle-with-treasure','run',.3);
        manMain.on('event',(man,e,a)=>{
            //console.log(  manMain.getCurrentAnimation()  )
            const currentAnim = manMain.getCurrentAnimation().name;
            const eventName = e.data.name;
            
            if( eventName === 'step-water' ){
                //console.log( e )
                this.sound.play('splash-sfx', {volume : .2 });
            }
            if( eventName === 'step' ){
                this.sound.play('step-grass-sfx', {volume : .2 });
            }
            if( eventName === 'cry' ){
                this.sound.play('cry-sfx', {volume : .5 });
            }
            if( eventName === 'pan' ){
                this.sound.play('pan-sfx', {volume : .2 });
                this.sound.play('splash-sfx', {volume : .2 });
            }
            if( eventName === 'dip' ){
                this.sound.play('dip-sfx', {volume : .1 });
            }
            //console.log( e.data.name )
        })

        manMain.on('complete',(man)=>{
            if(man.animation.name === "show-stand" || man.animation.name === "show-kneel"){
                manMain.setAnimation(0,'idle-with-treasure',true);
            }
        })

        const phaserInstance = this;
        function buttonClickAnimation(btn = {}){
            //if(btn === {})return
            const btnBarrel = btn.preFX.addBarrel(1);
            btn.on('pointerdown',()=>{
                if(global.clickStatus)return
                if( btnBarrel.amount !== 1 )return
                phaserInstance.tweens.add({
                    targets : btnBarrel,
                    amount : 1.5,
                    duration : 100,
                    yoyo : true,
                    ease : 'Circ.in'
                })
            })
        }

        //buttonClickAnimation( submitBtn );
        //buttonClickAnimation( infoBtn );
        
        continueBtn.on('pointerdown',()=>{
            this.sound.play('default-sfx',defaultSfxMarker[1]);
            resetTimer.remove(true)
            //readyProcess();
        });

        stopBtn.on('pointerdown',()=>{
            //readyProcess();
            if(stopBtn.isTinted)return //console.log( "disabled" )
            this.sound.play('default-sfx',defaultSfxMarker[3]);
            global.autoStatus = false;
            stopBtn.setTint( Phaser.Display.Color.GetColor(90,90,90) );
        });

        //addBtn.preFX.addBarrel(1);
        addBtn.on('pointerdown',()=>{
            if(global.clickStatus )return
            this.sound.play('default-sfx',defaultSfxMarker[0]);
            this.tweens.add({
                targets : addBtn.preFX.addBarrel(1),
                amount : 1.5,
                duration : 100,
                yoyo : true,
                ease : 'Circ.in'
            })
            addBet();
        });
        minusBtn.on('pointerdown',()=>{
            if(global.clickStatus)return
            this.sound.play('default-sfx',defaultSfxMarker[0]);
            this.tweens.add({
                targets : minusBtn.preFX.addBarrel(1),
                amount : 1.5,
                duration : 100,
                yoyo : true,
                ease : 'Circ.in'
            })
            minusBet();
        })

        submitBtn.on('pointerdown',()=>{
            //console.log('asa')
            if(global.clickStatus || noBalanceModal.visible )return
            if(! checkBalance(betAmtDisplay, balanceDisplay) )return console.log('Insuficient Balance'),  noBalanceModal.setVisible(true), this.sound.play('default-sfx',defaultSfxMarker[4]);
            //submitBtn.setAnimation(0,'submit-shine',false);
            this.sound.play('default-sfx',defaultSfxMarker[2]);
            global.clickStatus = true;
            disableButtons();
            startProcess();
        })

        autoBtn.on('pointerdown',()=>{
            if(global.clickStatus ||  noBalanceModal.visible )return
            if(! checkBalance(betAmtDisplay, balanceDisplay) )return console.log('Insuficient Balance'),  noBalanceModal.setVisible(true), this.sound.play('default-sfx',defaultSfxMarker[4]);
            this.sound.play('default-sfx',defaultSfxMarker[2]);
            global.autoStatus = true;
            global.clickStatus = true;
            autoBtn.setVisible(false);
            stopBtn.setVisible(true).clearTint();
            disableButtons();
            startProcess();
        })

        const addBet = ()=>{
            betDenomCounter++;
            if(betDenomCounter > betDenom.length - 1){
                betDenomCounter = 0;
            }
            betAmtDisplay.setText( betDenom[betDenomCounter] )
        }
        const minusBet = ()=>{
            betDenomCounter--;
            if(betDenomCounter < 0 ){
                betDenomCounter = betDenom.length - 1;
            }
            betAmtDisplay.setText( betDenom[betDenomCounter] )
        }

        const showRipple = (isShow = true)=>{
            if(isShow){
                if(ripplesMain.visible )return
                ripplesMain.setAlpha(0).setVisible(true);
                this.tweens.add({
                    targets : ripplesMain,
                    duration : 200,
                    alpha : 1,
                })
            }else{
                ripplesMain.setVisible(false);
            }
        }

        const walkToRiver = ()=>{
            ripplesMain.setVisible(false);
            manMain.setPosition(590,520).setScale(.7);
            manMain.timeScale = 1.2;
            manMain.setAnimation(0,'walk',true);
            this.tweens.add({
                targets : manMain,
                duration : 1500,
                x : 540,
                y : 375,
                scaleX :.6,
                scaleY : .6,
                onUpdate : (tween,target,data)=>{
                    if(manMain.y < 410 ){
                        //ripplesMain.setVisible(true);
                        showRipple()
                    }
                    ripplesMain.setPosition( manMain.x, manMain.y-30);
                },
                onComplete : ()=>{
                    manMain.timeScale = 1;
                    //manMain.setAnimation(0,'idle',true);
                    //dipDishToRiver();
                    resultCallback();
                }
            })
        }

        const showCloseUpCam = (isVisible = true, isStanding = true,)=>{
            let delay = 800; 
            if(isStanding){
                closeUpCam.setScroll(300,30);
                delay = 1400;
            }else{
                closeUpCam.setScroll(290,150)
            }
            if(isVisible){
                circleBorder.setScale(0);
                circ.setScale(0);
                liveLabel.setScale(0).setPosition(775,200); ////625,60
                closeUpCam.setVisible(true);
                this.tweens.add({
                    targets : [circ,circleBorder],
                    duration : 400,
                    delay : delay,
                    scaleX : 1.2,
                    scaleY : 1.2,
                    ease : 'Back.out'
                })
                this.tweens.add({
                    targets : liveLabel,
                    duration : 400,
                    delay : delay,
                    scaleX : 1,
                    scaleY : 1,
                    x : 625+300,
                    y : 60,
                    ease : 'Back.out'
                })
            }else{
                this.tweens.add({
                    targets : [circ,circleBorder],
                    duration : 400,
                    delay : 0,
                    scaleX : 0,
                    scaleY : 0,
                    ease : 'Back.in',
                    onComplete : ()=>{
                        circleBorder.setScale(0);
                        circ.setScale(0);
                        closeUpCam.setVisible(false);
                        liveLabel.setScale(0).setPosition(775,200);
                    }
                })
                this.tweens.add({
                    targets : liveLabel,
                    duration : 400,
                    delay : 0,
                    scaleX : 0,
                    scaleY : 0,
                    x : 775,
                    y : 200,
                    ease : 'Back.out'
                })
            }
        }

        const dipDishToRiver = ( cb )=>{
            if(Math.random() > .5){
                //stand
                manMain.setAnimation(0,'dip-stand',false);
                showCloseUpCam(true,true)//shows the cam tageting the dish when standing
                manMain.once('complete',()=>{
                    manMain.setAnimation(0,'filter-stand',true);
                    setTimeout(()=>{
                        manMain.setAnimation(0,'show-stand',false);
                        
                        if(cb){
                            setTimeout(()=>{
                                showCloseUpCam(false) //closes the cam
                                cb()
                            },2000)
                        }
                    },4000)
                })
            }else{
                //kneel
                manMain.setAnimation(0,'dip-kneel',false);
                showCloseUpCam(true,false)//shows the cam tageting the dish when kneel
                manMain.once('complete',()=>{
                    manMain.setAnimation(0,'filter-kneel',true);
                    setTimeout(()=>{
                        manMain.setAnimation(0,'show-kneel',false);
                        
                        if(cb){
                            setTimeout(()=>{
                                showCloseUpCam(false) //closes the cam
                                cb()
                            },2000)
                        }
                    },4000)
                })
            }
        }

        const oddsToImage = (odds)=>{
            let res;
            switch(odds){
                case 0 :
                    res = (Math.random() > .3 )?'dirt':null;
                break;
                case 1.5 :
                    res = 'small-gold-sand';
                break;
                case 2.3 :
                    res = 'large-gold-sand';
                break;
                case 3.6 :
                    res = 'gems';
                break;
                case 4.2 :
                    res = 'gold-nugget';
                break;
                default :
                    res = null;
                break
            }
            return res
        }

        const resultCallback = ()=>{
            const isWin = (serverResultOdds > 0 );
            const treasureTexture = oddsToImage(serverResultOdds);
            manMain.setAttachment('treasure', treasureTexture );
            dipDishToRiver(()=>{
                if( isWin ){
                    if(serverResultOdds >= 3.6){
                        winCelebrate();
                    }
                    winCallback(treasureTexture);
                }else{
                    loseCallback();
                }
            });     
        }

        const winCallback = (treasureTexture)=>{
            if(serverResultOdds < 3.6){
                const msg = (Math.random() > .5)?'win-msg-1.png':'win-msg-2.png';
                winMsg.setFrame( msg ).setVisible(true).setScale(0);
                this.tweens.add({
                    delay : 400,
                    targets : winMsg,
                    duration : 400,
                    scaleX : 1,
                    scaleY : 1,
                    ease : 'Back.out',
                })
            }
            dishPrize.setFrame(treasureTexture + '.png');
            prizeLabel.setFrame(treasureTexture + '-label.png');
            showWinAmt();
        }

        const loseCallback = ()=>{
            setTimeout(()=>{
                loseMsg.setVisible(true);
            },400)

            manMain.setAnimation(0,'lose-complete',false);

            setTimeout(()=>{
                readyProcess();
            },3500);
        }

        const winCelebrate = ()=>{
            const scale = manMain.scaleX;
            manMain.setAnimation(0,'run',true);
            confettiEmitter.flow(100);
            this.tweens.add({
                targets : manMain,
                duration : 700,
                x : 290+50,
                onComplete : ()=>{
                    manMain.scaleX = -(scale);
                },
            })
            this.tweens.add({
                delay : 600,
                targets : manMain,
                duration : 1400,
                x : 790-50,
                yoyo : true,
                repeat : -1,
                onYoyo : ()=>{
                    manMain.scaleX = scale;
                },
                onRepeat : ()=>{
                    manMain.scaleX = -(scale);
                }
            })
        }

        const showWinAmt = (winAmt=0 )=>{
            const winAmount = serverResultOdds * parseInt( betAmtDisplay.text );
            winAmtModal.setY(500);
            dishPrize.setPosition(480,220).setScale(.6).setVisible(true);

            if( global.autoStatus ){
                continueBtn.setVisible(false);
                //resetTimerDisplay.setPosition(540,340)
            }else{
                continueBtn.setVisible(true);
                //resetTimerDisplay.setPosition(540,420)
            }

            this.tweens.chain({
                targets : dishPrize,
                tweens :[
                    {
                        x : 340,
                        y : 160,
                        duration : 300,
                        ease : 'Sine.easeOut',
                    },
                    {
                        x : 540,
                        y : 350,
                        scaleX : 1,
                        scaleY : 1,
                        duration : 300,
                        ease : 'Sine.easeOut',
                    }
                ]
            })
            this.tweens.add({
                delay : 400,
                targets : winAmtModal,
                duration : 600,
                ease : 'Back.easeOut',
                y : 0,
                onComplete : ()=>{
                    this.sound.play('default-sfx',defaultSfxMarker[6]);
                    rays.setVisible(true);
                    raysLarge.setVisible(true);
                    if( global.autoStatus ){
                        resetTimer = this.time.addEvent({
                            delay : 1000,
                            repeat : 3,
                            callback : ()=>{
                                resetTimerDisplay.setText( resetTimer.repeatCount ).setScale(1).setVisible(true);
                                this.tweens.add({
                                    targets : resetTimerDisplay,
                                    duration : 200,
                                    scaleX : 1.5,
                                    scaleY : 1.5,
                                    ease : 'Back.out',
                                })
                                if( resetTimer.repeatCount === 0 ){
                                    readyProcess();
                                }
                            }
                        })
                    }else{
                        resetTimer = this.time.addEvent( resetTimerCfg );
                    }
                    
                }
            });

            rays.setScale(0).setVisible(true);
            raysLarge.setScale(0).setVisible(true);
            this.tweens.add({
                delay : 1000,
                targets : rays,
                duration : 500,
                ease : 'Back.easeOut',
                scaleX : .6,
                scaleY : .6,
            });
            this.tweens.add({
                delay : 1000,
                targets : raysLarge,
                duration : 500,
                ease : 'Back.easeOut',
                scaleX : 1.5,
                scaleY : 1.5,
            });

            winAmtDisplay.setText(0);
            this.tweens.addCounter({
                from : 0,
                to : winAmount,
                delay : 900,
                duration : 1000,
                onUpdate : ( tween,data )=>{
                    //console.log( data.value )
                    winAmtDisplay.setText( data.value.toFixed(2) );
                },
                onComplete :()=>{
                    balanceDisplay.updateBalance( balance+=winAmount ,'add')
                }
            })
        }

        const disableButtons = ()=>{
            addBtn.removeInteractive().setTint( Phaser.Display.Color.GetColor(90,90,90) );
            minusBtn.removeInteractive().setTint( Phaser.Display.Color.GetColor(90,90,90) );
            //infoBtn.removeInteractive().setTint( Phaser.Display.Color.GetColor(90,90,90) );
            autoBtn.removeInteractive().setTint( Phaser.Display.Color.GetColor(90,90,90) );
            submitBtn.removeInteractive().setTint( Phaser.Display.Color.GetColor(90,90,90) );
        }

        const enableButtons = ()=>{
            addBtn.setInteractive().clearTint();
            minusBtn.setInteractive().clearTint();
            //infoBtn.setInteractive().clearTint();
            autoBtn.setInteractive().clearTint();
            submitBtn.setInteractive().clearTint();
        }

        const startProcess = async ()=>{
            try{
                balanceDisplay.updateBalance(balance-=parseInt(betAmtDisplay.text),'remove');
                const dummyRes = await getResult();
                serverResultOdds = dummyRes;
                console.log( 'start walk' )
                walkToRiver()
            }
            catch(error){
                console.log( error )
            }
        }

        const autoProcess = ()=>{
            if(! checkBalance(betAmtDisplay, balanceDisplay) ){
                console.log('Insuficient Balance');
                noBalanceModal.setVisible(true);
                global.autoStatus = false;
                global.clickStatus = false;
                autoBtn.setVisible(true);
                stopBtn.setVisible(false).clearTint();
                return
            };
            startProcess();
        }

        const readyProcess = ()=>{
            // this.tweens.add({
            //     delay : 400,
            //     targets : winAmtModal,
            //     duration : 300,
            //     ease : 'Back.easeOut',
            //     y : -500
            // })
            closeUpCam.setVisible(false);
            circleBorder.setScale(0);
            circ.setScale(0);
            liveLabel.setScale(0).setPosition(775,200);

            winAmtModal.setY(500)
            rays.setVisible(false);
            raysLarge.setVisible(false);
            loseMsg.setVisible(false);
            winMsg.setVisible(false);
            ripplesMain.setVisible(false);
            manMain.setPosition(590,520).setScale(.7);
            manMain.setAnimation(0,'idle',true);
            dishPrize.setVisible(false);
            resetTimerDisplay.setVisible(false);
            this.tweens.killTweensOf( manMain );
            confettiEmitter.flow(-1);

            if( global.autoStatus){
                autoProcess();
            }else{
                enableButtons();
                autoBtn.setVisible(true).clearTint();
                stopBtn.setVisible(false).clearTint();
                global.clickStatus = false;
            }
        }

    }
    update(){

    }
}



function getResult(){
    return new Promise(( resolve, reject )=>{
        setTimeout(()=>{
            const odds = [1.5,2.3,3.6,4.2];
            const winResult =  Math.random() < gameConfig.winRate ; // dummy win or result
            let winOdds = 0;
            if(winResult){
                winOdds = odds[ Math.floor( Math.random() * odds.length ) ];
            }
            console.log( (winResult)?'%c WIN ' : '%c LOSE ',(winResult)?'background: #35cb00; color: #111' : 'background: #e60505' );
            console.log( '%c' + winOdds, 'background: #35cb00; color: #111' );
            resolve(winOdds);
        })
    })
    // const winResult =  Math.random() < gameConfig.winRate ; // dummy win or result 
    // console.log( (winResult)?'%c WIN ' : '%c LOSE ',(winResult)?'background: #35cb00; color: #111' : 'background: #e60505' );
    // return winResult
}

function checkBalance( betAmt, balance){
    return parseInt( betAmt.text ) <= parseInt( balance.balanceAmt.text );
}


function getLineAngle(p1X,p1Y,p2X,p2Y){
    // var p1 = {
    //     x: 20,
    //     y: 20
    // };
    // var p2 = {
    //     x: 40,
    //     y: 40
    // };

    // angle in radians
    var angleRadians = Math.atan2(p2Y - p1Y, p2X - p1X);

    // angle in degrees
    var angleDeg = Math.atan2(p2Y - p1Y, p2X - p1X) * 180 / Math.PI;

    return angleRadians
}




function getPrize(dto, success, error) {
    mgs.provider.placeorder(getDto(dto), function (result) {

        var winAmt = (result[8].length > 0) ? result[8][0][1] : 0,
            winStatus;
        
        if (winAmt > 0) winStatus = true;
        else winStatus = false;

        success({result: result[6], winStatus: winStatus, winAmt: winAmt});
        //success({result: '921',winStatus: false,winAmt: 3000}); //dummy data

    }, function (d) {
        //reset();
        error(d[0]);
    });   
}

function getDto(data) {
    var payload = '',
        numOrder = data.length,
        tmp = [];

    $.each(data, function() {
        var betCont = this.split(',');

        tmp.push('8,' + betCont[0] + ',' + (betCont[1] * 100) + '.');
    });

    payload = numOrder.toString() + '=' + tmp.join('');

    //"1=7,1,@amt.".replace("@amt", (data.amt * units[data.unit]))

    return dto = {
        p: 1700, // payout, fixed for minigame
        u: 1, // unit
        m: 1, // multiplier, fixed to 1
        g: 87, // gameId, fixed for slamdunk
        q: 1, // quantity
        s: -99, // seq, fixed value for mmc
        w: 0, // win stop
        b: 0, // double, deprecated param
        a: 1, // amt detail
        payload: payload
    };
}

function updateBalance(isWin) {
    if (global.normalMode) 
        notifyParent(['menuRefresh'], isWin);
}

function stopAutoplay() {
   
}

function notifyParent(data) {
    if (window.parent)
        window.parent.postMessage(data, "*");
}

var config = {
    type: Phaser.WEBGL,
    //type: Phaser.CANVAS,
    scale: {
        parent: 'container',
        autoCenter: Phaser.Scale.CENTER_BOTH, //Phaser.Scale.CENTER_HORIZONTALLY,
        mode:Phaser.Scale.FIT,
        width: global.size.width,
        height: global.size.height,
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: debugMode,
        }
    },
    backgroundColor: '#111111', //'#1b1464'
    scene: [ MainScene , MuteGame ],
    plugins: {
        scene: [
                { key: 'SpinePlugin', plugin: window.SpinePlugin, mapping: 'spine' },
                // {
                //     plugin: window.PhaserMatterCollisionPlugin, // The plugin class
                //     key: "matterCollision", // Where to store in Scene.Systems, e.g. scene.sys.matterCollision
                //     mapping: "matterCollision" // Where to store in the Scene, e.g. scene.matterCollision
                // }
            ]
    },
};
var game = new Phaser.Game(config);

class AnimatedParticle extends Phaser.GameObjects.Particles.Particle {
    constructor (emitter) {
        super(emitter);

        this.t = 0;
        this.i = 0;
        this.rotation = 0;
    }

    update (delta, step, processors) {
        var result = super.update(delta, step, processors);

        this.t += delta; 

        this.rotation+=delta;

        if (this.t >= coinAnim.msPerFrame) {
            this.i++;

            if (this.i > 9) this.i = 0; // 9 frame count of sprite coin.png

            this.frame = coinAnim.frames[this.i].frame;
        
            this.t -= coinAnim.msPerFrame;
        }
        return result;
    }
}