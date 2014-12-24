module Nonogram {

    export class Main extends Phaser.State {

        map: Phaser.Tilemap;
        layer: Phaser.TilemapLayer;
        marker: Phaser.Graphics;

        preload() {
            this.load.image('tiles', 'assets/tiles.png');
        }

        create() {
            this.stage.backgroundColor = '#303030';
            this.scale.pageAlignHorizontally = true;
            this.scale.setScreenSize(true);

            //  Creates a blank tilemap
            this.map = this.add.tilemap();

            //  Add a Tileset image to the map
            this.map.addTilesetImage('tiles');

            //  Creates a new blank layer and sets the map dimensions.
            //  In this case the map is 40x30 tiles in size and the tiles are 32x32 pixels in size.
            this.layer = this.map.create('main', 10, 10, 32, 32);
            

            this.marker = this.add.graphics(0, 0);
            this.marker.lineStyle(2, 0xFFFFFF, 1);
            this.marker.drawRect(0, 0, 32, 32);
            this.input.setMoveCallback(this.onMove, this);
            
        }

        onMove() {
            var x = this.layer.getTileX(this.input.activePointer.worldX);
            var y = this.layer.getTileY(this.input.activePointer.worldY);
            this.marker.position.x = x * 32;
            this.marker.position.y = y * 32;

            if (this.input.mousePointer.isDown) {
                this.map.putTile(1, x, y, this.layer);
            }
        }
    }
} 