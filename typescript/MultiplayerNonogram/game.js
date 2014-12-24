var game;

window.onload = function () {
    game = new Nonogram.Game();
};
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Nonogram;
(function (Nonogram) {
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.call(this, 800, 600, Phaser.AUTO, 'content', null);

            this.state.add('Main', Nonogram.Main, true);
        }
        return Game;
    })(Phaser.Game);
    Nonogram.Game = Game;
})(Nonogram || (Nonogram = {}));
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
            this.layer.width = 640;
            this.layer.height = 640;

            this.marker = this.add.graphics(0, 0);
            this.marker.lineStyle(2, 0xFFFFFF, 1);
            this.marker.drawRect(0, 0, 32, 32);
            this.input.setMoveCallback(this.onMove, this);
        };

        Main.prototype.onMove = function () {
            var x = this.layer.getTileX(this.input.activePointer.worldX);
            var y = this.layer.getTileY(this.input.activePointer.worldY);
            this.marker.position.x = x * 32;
            this.marker.position.y = y * 32;

            if (this.input.mousePointer.isDown) {
                this.map.putTile(1, x, y, this.layer);
            }
        };
        return Main;
    })(Phaser.State);
    Nonogram.Main = Main;
})(Nonogram || (Nonogram = {}));
//# sourceMappingURL=game.js.map
