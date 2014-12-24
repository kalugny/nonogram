
WinState = function(){

};

WinState.prototype = {
    preload: function(){

    },

    create: function() {

        //this.stage.backgroundColor = 0x3b0760;

        var text = this.add.text(this.world.centerX, this.world.centerY, "YOU WIN!");

        //  Centers the text
        text.anchor.set(0.5);
        text.align = 'center';

        //  Our font + size
        text.font = 'Arial';
        text.fontWeight = 'bold';
        text.fontSize = 170;
        text.fill = '#ffffff';

        //  Here we create our fake reflection :)
        //  It's just another Text object, with an alpha gradient and flipped vertically

        var textReflect = this.add.text(this.world.centerX, this.world.centerY + 115, "YOU WIN!");

        //  Centers the text
        textReflect.anchor.set(0.5);
        textReflect.align = 'center';
        textReflect.scale.y = -1;

        //  Our font + size
        textReflect.font = 'Arial';
        textReflect.fontWeight = 'bold';
        textReflect.fontSize = 170;

        //  Here we create a linear gradient on the Text context.
        //  This uses the exact same method of creating a gradient as you do on a normal Canvas context.
        var grd = textReflect.context.createLinearGradient(0, 0, 0, text.canvas.height);

        //  Add in 2 color stops
        grd.addColorStop(0, 'rgba(255,255,255,0)');
        grd.addColorStop(1, 'rgba(255,255,255,0.08)');

        //  And apply to the Text
        textReflect.fill = grd;

    }

};
