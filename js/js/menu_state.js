MenuState = function(){};

MenuState.prototype = {
    preload: function(){

    },

    create: function() {

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.setScreenSize(true);

        var easy_text = this.add.text(0, this.world.centerY - 200,  "An introductory 10x10 level", MENU_UP_STYLE);
        var hard_text = this.add.text(0, this.world.centerY + 200,  "A challenging 20x20 level", MENU_UP_STYLE);

        easy_text.inputEnabled = hard_text.inputEnabled = true;

        easy_text.events.onInputOver.add(this.text_over, easy_text);
        easy_text.events.onInputOut.add(this.text_out, easy_text);
        hard_text.events.onInputOver.add(this.text_over, hard_text);
        hard_text.events.onInputOut.add(this.text_out, hard_text);

        easy_text.events.onInputDown.add(function(){
            this.state.start('game_state', true, true, 1);
        }, this);

        hard_text.events.onInputDown.add(function(){
            this.state.start('game_state', true, true, 2);
        }, this);

    },

    text_over: function(){
        this.setStyle(MENU_OVER_STYLE);
    },

    text_out: function(){
        this.setStyle(MENU_UP_STYLE);
    }
};
