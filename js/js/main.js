
var g, s;

$(window).load(function(){
    var game = new Phaser.Game(2000, 1800, Phaser.AUTO, 'content');
    g = game;

    s = game.state.add('game_state', GameState);
    game.state.add('win_state', WinState);
    game.state.add('lose_state', LoseState);
    game.state.add('menu_state', MenuState);
    game.state.start('menu_state');

});