
var Enemy = function(state, path, speed, hp, tint){
    this.state = state;
    this.path = path;
    this.speed = speed;
    this.hp = hp;
    this.tint = tint;

    var starting_location = path[0].clone();
    starting_location.x += this.state.map.tileWidth / 2;
    starting_location.y -= this.state.map.tileHeight / 2;

    this.enemy_sprite = this.state.add.sprite(starting_location.x, starting_location.y, 'enemy');
    this.enemy_sprite.anchor.setTo(0.5, 0.5);
    this.enemy_sprite.tint = this.tint;

    this.tween = this.state.add.tween(this.enemy_sprite);
    for (var i = 0; i < this.path.length; i++) {
        var p = path[i];
        var x = p.x + this.state.map.tileWidth / 2;
        var y = p.y + this.state.map.tileHeight / 2;
        this.tween.to({ x: x, y: y } , this.speed, Phaser.Easing.Default);
    }
    var last_tween = this.tween;
    while (last_tween._chainedTweens.length > 0) {
        last_tween = last_tween._chainedTweens[0];
    }
    last_tween.onComplete.add(this.reached_end, this);
    this.tween.start();

};

Enemy.prototype.is_alive = function(){
  return this.enemy_sprite.alive;
};


Enemy.prototype.reached_end = function () {
    if (!this.enemy_sprite || !this.enemy_sprite.alive) return;

    this.kill();
    this.state.lives--;
};

Enemy.prototype.kill = function(){
    console.log('kill');
    this.enemy_sprite.kill();

};

Enemy.prototype.damage = function (dmg){
    this.hp -= dmg;
    if (this.hp <= 0){
        this.kill();
    }
    else {
        var hurt_tween = this.state.add.tween(this.enemy_sprite);
        hurt_tween.to({ width: this.enemy_sprite.width * 0.8, height: this.enemy_sprite.height * 0.6 }, 150, Phaser.Easing.Default, true, 0, 0, true);
    }
};

Enemy.prototype.bounds = function(){
    return this.enemy_sprite.getBounds();
};

