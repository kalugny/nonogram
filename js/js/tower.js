
var Tower = function(state, x, y){

    this.state = state;

    if (typeof x === "undefined") x = 0;
    if (typeof y === "undefined") y = 0;

    this.tower_sprite = this.state.add.sprite(x, y, 'tower');
    this.visible = false;

    this.tower_circle = new Phaser.Circle(x + this.state.map.tileWidth / 2,
                                          y + this.state.map.tileHeight / 2,
                                          this.state.map.tileWidth * 2.9);

    this.range_circle = this.state.add.graphics();
    this.range_circle.lineStyle(1, 0xFF6E5E, 0.5);
    this.range_circle.drawCircle(this.tower_circle.x, this.tower_circle.y, this.tower_circle.radius);
    this.range_circle.alpha = 0;

    this.last_fired = Phaser.Time.now;

};

Tower.prototype.hover = function(x, y) {
    this.tower_sprite.x = x;
    this.tower_sprite.y = y;
    this.tower_sprite.visible = true;
    this.tower_sprite.alpha = 0.5;

    this.range_circle.x = x;
    this.range_circle.y = y;
    this.range_circle.alpha = 1;
};

Tower.prototype.hide = function(){
    this.tower_sprite.visible = false;
    this.range_circle.alpha = 0;
};

Tower.prototype.update = function(){
    if (this.last_fired + TOWER_COOLDOWN > this.state.time.now) return;

    for (var i = 0; i < this.state.enemies.length; i++){

        if (!this.state.enemies[i].is_alive()){
            continue;
        }

        var enemy_rect = this.state.enemies[i].bounds();

        if (Phaser.Circle.intersectsRectangle(this.tower_circle, enemy_rect)){
            this.last_fired = this.state.time.now;

            var enemy_x = enemy_rect.x + enemy_rect.width / 2;
            var enemy_y = enemy_rect.y + enemy_rect.height / 2;

            var laser = this.state.add.graphics();
            laser.lineStyle(3, 0xFF0000, 0.9);
            laser.moveTo(this.tower_sprite.x + this.tower_sprite.width / 2, this.tower_sprite.y + this.tower_sprite.height / 2);
            laser.lineTo(enemy_x, enemy_y);
            this.state.time.events.add(100, laser.clear, laser);

            this.state.enemies[i].damage(TOWER_STRENGTH);

            break;
        }
    }
};
