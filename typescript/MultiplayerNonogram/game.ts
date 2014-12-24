module Nonogram {

    export class Game extends Phaser.Game {

        constructor() {
            super(800, 600, Phaser.AUTO, 'content', null);

            this.state.add('Main', Main, true);


        }
    }
}