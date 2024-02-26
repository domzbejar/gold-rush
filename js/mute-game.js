class MuteGame extends Phaser.Scene{
	constructor(){
		super({
			key : 'MuteGame',
            active : true,
            pack : {
                files : [
                   //{ type : 'image' , key : 'loading-page' , url : 'asset/texture/loading-page.jpg'},
                   //{ type : 'bitmapFont' , key : 'creepster', textureURL: 'asset/texture/creepster.png' , fontDataURL : 'asset/texture/creepster.xml' }
                    //{ type : 'spritesheet', key : 'balloonLoading' , url : 'asset/texture/bet-summary.png' , frameConfig : { frameWidth: 62, frameHeight: 84}  }
                ]
            }
		})
	}	
	init(){

	}
	preload(){
		this.load.setPath('asset/texture');

		this.load.spritesheet('btn-mute.png','btn-mute.png',{ frameWidth : 66, frameHeight : 72 });
	}
	create(){
		const muteBtn = this.add.image(55,140,'btn-mute.png',1).setScale(.9).setDepth(5).setInteractive();
		muteBtn.on('pointerdown',()=>{
			muteGame();
		})
		const muteGame = ()=>{
			if( this.sound.mute ){
				this.sound.mute = false;
				muteBtn.setFrame(1);
			}else{
				this.sound.mute = true;
				muteBtn.setFrame(0);
			}
		}
	}
	update(){

	}

}

