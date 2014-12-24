var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Nonogram;
(function (Nonogram) {
    var Main = (function (_super) {
        __extends(Main, _super);
        function Main() {
            _super.apply(this, arguments);
        }
        Main.prototype.preload = function () {
            this.load.image('tiles', 'assets/tiles.png');
        };

        Main.prototype.create = function () {
            this.stage.backgroundColor = '#2d2d2d';

            //  Creates a blank tilemap
            this.map = this.add.tilemap();

            //  Add a Tileset image to the map
            this.map.addTilesetImage('tiles');

            //  Creates a new blank layer and sets the map dimensions.
            //  In this case the map is 40x30 tiles in size and the tiles are 32x32 pixels in size.
            this.layer = this.map.create('main', 10, 10, 32, 32);

            this.marker = this.add.graphics(0, 0);
            this.marker.lineStyle(2, 0x000000, 1);
            this.marker.drawRect(0, 0, 32, 32);
            this.input.setMoveCallback(this.onMove, this);
        };

        Main.prototype.onMove = function () {
            this.marker.moveTo(this.layer.getTileX(this.input.activePointer.worldX).left * 32, this.layer.getTileY(this.input.activePointer.worldY).top * 32);

            if (this.input.mousePointer.isDown) {
                //    map.putTile(currentTile, currentLayer.getTileX(marker.x), currentLayer.getTileY(marker.y), currentLayer);
                // map.fill(currentTile, currentLayer.getTileX(marker.x), currentLayer.getTileY(marker.y), 4, 4, currentLayer);
            }
        };
        return Main;
    })(Phaser.State);
    Nonogram.Main = Main;
})(Nonogram || (Nonogram = {}));
//# sourceMappingURL=main.js.map
