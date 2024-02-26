/* how to use:
1.) make the balanceDisplay object
var balanceDisplay = new BalanceDisplay(this , x , y, balBg ,balance , depth , fontSize ,  bitmapText );
    ***note: balBg is the image where the balance will be placed
             this.load.image('bal-bg','bal-bg.png');
             
             !important: always include 'bal-emit'
             this.load.spritesheet('bal-emit','bal-emit.png',{ frameWidth: 75, frameHeight : 34 });

2.) to update the balance :
    balanceDisplay.updateBalance( newBal );
*/
class BalanceDisplay extends Phaser.GameObjects.Sprite{
    constructor( scene , x , y, balBg = '' ,balance , depth, fontSize , bitmapText ){
        super( scene , x , y, balBg );

        var isBitmapText = ( typeof bitmapText !== 'undefined')?true:false;
        this.fontSize = fontSize || 26;

        if(balBg === null ){
            this.setVisible(false);
        }
        this.setTexture( balBg );
        this.setPosition( x , y);
        this.setDepth( depth );
        this.y = y;
        this.x = x;
        var bDisplay = {};


        if( isBitmapText ){
            /** BITMAP FONT **/
            this.balanceAmt = scene.add.bitmapText( this.x, this.y, bitmapText , balance.toFixed(2) , this.fontSize ).setDepth( depth+1 ).setOrigin(.5).setScrollFactor(0);
            /*****************/
        }else{
            /** ORIGINAL FONT**/
            this.balanceAmt = scene.add.text( this.x , this.y, balance.toFixed(2) ,{
                fontFamily : 'digi',
                color : '#f3eb6d',
                fontSize : this.fontSize,            
            }).setOrigin(.5).setDepth( depth+1 );
            /****************/
        }


       // var particle = scene.add.particles('bal-emit').setDepth( depth+2 );
        this.coinEmitter = scene.add.particles(0,0,'bal-emit',{
            frame : [0],
            x : this.x -( this.balanceAmt.width/2 ),
            y : this.y-80,
            frequency : -1,
            moveToX : this.x -( this.balanceAmt.width/2 ),
            moveToY : this.y,
            lifespan : 400,
            alpha : { start : 1 , end : 0 },
            //angle : { min : 100, max : 315 },
            scale : .6,
            //rotate : { min : 0, max : 180 }
        });
        bDisplay.sparkEmitter = scene.add.particles(this.x,this.y,'bal-emit',{
            frame : 1,
            x : this.x,
            y : this.y,
            frequency : -1,
            lifespan : 400,
            speed : 100,
            scale : { start : .4 , end : 1 },
            alpha : { start : 1, end : 0 },
            blendMode : 'ADD'
        });

        // function setColor(hexColor){
        //     this.balanceAmt.style.color = hexColor;
        // }

        this.updateBalance = function( newBal , coinEffect ="none" ){

            //var coinEffect = coinEffect || "none";

            switch( coinEffect ){
                case "add" :
                    this.coinEmitter.setEmitterFrame(0);
                    // this.coinEmitter.alpha.start = 0;
                    // this.coinEmitter.alpha.end = 1;
                    // this.coinEmitter.setPosition(this.x -( this.balanceAmt.width/2 ),this.y - 80 );
                    // this.coinEmitter.moveToY.propertyValue = this.y;
                    // this.coinEmitter.moveToX.propertyValue = this.x -( this.balanceAmt.width/2 );
                    this.coinEmitter.setPosition(0,0 );
                    this.coinEmitter.moveToY = this.y;

                    //console.log( this.coinEmitter );
                    //this.balanceAmt.style.color = '#feffad'; //de3f2f
                    if(!isBitmapText){
                        this.balanceAmt.setColor('#feffad');
                    }
                    

                    this.coinEmitter.flow( 120 );

                    /*scene.tweens.add({
                        targets : this.balanceAmt,
                        scaleX : 1.2,
                        scaleY : 1.2,
                        duration : 300,
                        ease : 'Sine.easeInOut',
                        yoyo : true,
                        callbackScope : this,
                    });*/

                    scene.tweens.addCounter({
                        from : parseInt( this.balanceAmt.text ),
                        to : newBal,
                        duration : 500,
                        callbackScope : this,
                        onUpdate : function( tweens , targets ){
                            this.balanceAmt.text = targets.value.toFixed(2);
                        },
                        onComplete : function(){
                            this.coinEmitter.flow( -1 );
                            if(!isBitmapText){
                                this.balanceAmt.setColor('#ffc80a');
                            }
                        }
                    });
                    
                break;
                case "remove":
                    this.coinEmitter.setEmitterFrame(1);
                    //this.coinEmitter.setPosition(this.x -( this.balanceAmt.width/2 ),this.y );
                    this.coinEmitter.setPosition(0,80 );
                    console.log( this.coinEmitter );
                    //this.coinEmitter.moveToY.propertyValue = this.y - 80;
                    //this.coinEmitter.moveToX.propertyValue = this.x -( this.balanceAmt.width/2 );

                    this.coinEmitter.moveToY = this.y-160;
                    //this.coinEmitter.ops.moveToX.propertyValue = this.x -( this.balanceAmt.width/2 );

                    // x : this.x -( this.balanceAmt.width/2 ),
                    // y : this.y-80,
                    // frequency : -1,
                    // moveToX : this.x -( this.balanceAmt.width/2 ),
                    // moveToY : this.y,

                    //this.balanceAmt.style.color = '#de3f2f';
                    if(!isBitmapText){
                        this.balanceAmt.setColor('#de3f2f');
                    }

                    this.coinEmitter.flow( 120 );

                    scene.tweens.addCounter({
                        from : parseInt( this.balanceAmt.text ),
                        to : newBal,
                        duration : 500,
                        callbackScope : this,
                        onUpdate : function( tweens , targets ){
                            this.balanceAmt.text = targets.value.toFixed(2);
                        },
                        onComplete : function(){
                            this.coinEmitter.flow( -1 );
                            if(!isBitmapText){
                                this.balanceAmt.setColor('#ffc80a');
                            }
                        }
                    });
                    
                break;
                default :
                    //this.balanceAmt.text = newBal.toFixed(2);

                    if(!isBitmapText){
                        this.balanceAmt.setColor('#de3f2f');
                    }
                    scene.tweens.addCounter({
                        from : parseInt( this.balanceAmt.text ),
                        to : newBal,
                        duration : 500,
                        callbackScope : this,
                        onUpdate : function( tweens , targets ){
                            this.balanceAmt.text = targets.value.toFixed(2);
                        },
                        onComplete : function(){
                            this.coinEmitter.flow( -1 );
                            if(!isBitmapText){
                                this.balanceAmt.setColor('#ffc80a');
                            }
                        }
                    });
            };
            

        };
        
        scene.add.existing( this ); 
        scene.add.existing( this.balanceAmt );  
    }
    preUpdate( time, delta ){
        super.preUpdate(time,delta)
        //console.log( 'test')
    }
}