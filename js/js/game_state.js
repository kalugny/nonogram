GameState = function(){

    this.map = undefined;
    this.map_layer = undefined;
    this.fog_layer = undefined;

    // cursors
    this.marker = undefined;
    this.tower_cursor = undefined;
    this.tool_selected = null;

    // gfx
    this.margin_left = 0;
    this.margin_top = 0;
    this.points_text = undefined;
    this.lives_text = undefined;
    this.btns = [];

    // input
    this.button_down = false;

    // pieces
    this.paths = [];
    this.enemies = [];
    this.towers = [];

    // enemy
    this.last_path_selected = 0;
    this.wave_index = 0;
    this.waves = WAVES;

    // score
    this.points = 10;
    this.lives = 20;

};

GameState.prototype = {

    // State functions

    init: function(level){
        this.level = 'maps/' + level + '.json';
    },

    preload: function () {
        this.load.tilemap('puzzle', this.level, null, Phaser.Tilemap.TILED_JSON);
        this.load.image('tiles', 'images/plain.png');
        this.load.image('enemy', 'images/enemy.png');
        this.load.image('tower', 'images/tower.png');
        this.load.spritesheet('mark_road_btn', 'images/mark_as_road.png', 120, 80);
        this.load.spritesheet('mark_empty_btn', 'images/mark_as_empty.png', 120, 80);
        this.load.spritesheet('build_tower_btn', 'images/build_tower.png', 120, 80);
    },

    create: function () {


        this.map = this.add.tilemap('puzzle');

        this.map.addTilesetImage('plain', 'tiles');

        this.map_layer = this.map.createLayer('Map');
        this.map_layer.fixedToCamera = false;
        this.fog_layer = this.map.createLayer('Fog');
        this.fog_layer.fixedToCamera = false;


        this.marker = this.add.graphics();
        this.marker.lineStyle(2, 0x000000, 1);
        this.marker.drawRect(0, 0, this.map.tileWidth, this.map.tileHeight);

        for (var i = 0; i < this.map.width; i+=5){
            for (var j = 0; j < this.map.height; j+=5){
                var grid_cell = this.add.graphics();
                grid_cell.lineStyle(2 , 0xaaaaaa, 0.5);
                grid_cell.drawRect(i * this.map.tileWidth, j * this.map.tileHeight, 5 * this.map.tileWidth, 5 * this.map.tileHeight);
                this.fog_layer.addChild(grid_cell);
            }
        }

        // Draw
        var left_numbers_group = this.draw_numbers();
        this.margin_left = left_numbers_group.width + this.map.tileWidth / 2;
        this.map_layer.x = this.fog_layer.x = this.margin_left;

        var top_numbers_group = this.draw_numbers(true);
        this.margin_top = top_numbers_group.height;
        this.map_layer.y = this.fog_layer.y = left_numbers_group.y = this.margin_top;
        top_numbers_group.x = this.margin_left;

        var texts_left = this.margin_left + this.map.widthInPixels + 20;
        var texts_top = 20;
        var points_label = this.add.text(texts_left, texts_top, 'Points: ', NUMBERS_STYLE);
        this.points_text = this.add.text(texts_left + points_label.width, texts_top, this.points, NUMBERS_STYLE);
        texts_top += this.points_text.height + 20;
        var lives_label = this.add.text(texts_left, texts_top, 'Lives: ', NUMBERS_STYLE);
        this.lives_text = this.add.text(texts_left + lives_label.width, texts_top, this.lives, NUMBERS_STYLE);
        texts_top += this.lives_text.height + 20;
        var next_wave_label = this.add.text(texts_left, texts_top, 'Next wave in ', NUMBERS_STYLE);
        this.next_wave_text = this.add.text(texts_left + next_wave_label.width, texts_top, this.waves[this.wave_index].time_till_wave / 1000, NUMBERS_STYLE);

        var buttons_left = this.margin_left + this.map.widthInPixels + 20;
        var buttons_top = texts_top + this.lives_text.height + 20;

        var mark_empty_btn = this.make_btn(buttons_left, buttons_top, 'mark_empty_btn');
        buttons_top += mark_empty_btn.height + 40;
        var mark_road_btn = this.make_btn(buttons_left, buttons_top, 'mark_road_btn');
        buttons_top += mark_road_btn.height + 40;
        var build_tower_btn = this.make_btn(buttons_left, buttons_top, 'build_tower_btn');

        var world_width = texts_left + next_wave_label.width + 3 * this.next_wave_text.width + 20;
        var world_height = this.margin_top + this.map.heightInPixels + 20;
        this.world.setBounds(0, 0, world_width, world_height);
        this.game.scale.updateDimensions(world_width, world_height, true);
        this.game.scale.setScreenSize(true);

        this.btns = [mark_empty_btn, mark_road_btn, build_tower_btn];

        this.paths = this.find_paths();

        this.tower_cursor = new Tower(this);
        this.tower_cursor.hide();

        this.next_wave_timer_event = this.time.events.add(this.waves[this.wave_index].time_till_wave, this.create_wave, this);

        this.update_numbers();

    },

    update: function () {

        if (this.lives <= 0){
            this.game.state.start('lose_state');
            return;
        }

        if (this.is_pointer_in_table()) {
            var selected_tile_x = _.min([this.map_layer.getTileX(this.input.activePointer.worldX - this.margin_left),
                    this.map.width - 1]);
            var selected_tile_y = _.min([this.map_layer.getTileY(this.input.activePointer.worldY - this.margin_top),
                    this.map.height - 1]);
            this.marker.x = selected_tile_x * this.map.tileWidth + this.margin_left;
            this.marker.y = selected_tile_y * this.map.tileHeight + this.margin_top;
            this.marker.visible = true;

            if (this.button_down && this.input.activePointer.isUp) {
                this.button_down = false;
            }

            var selected_map_tile = this.map.getTile(selected_tile_x, selected_tile_y, this.map_layer);
            var selected_fog_tile = this.map.getTile(selected_tile_x, selected_tile_y, this.fog_layer);

            var is_foggy = selected_fog_tile && (selected_fog_tile.index === FOG_TILE || selected_fog_tile.index === BAD_FOG_TILE);
            var is_empty = selected_map_tile && selected_map_tile.index === BLANK_TILE;

            if (this.tool_selected != null) {

                if (this.tool_selected == 'build_tower_btn') {
                    if (!is_foggy && is_empty) {
                        var p = this.tile_location(new Phaser.Point(selected_tile_x, selected_tile_y));
                        this.tower_cursor.hover(p.x, p.y);
                    }
                    else {
                        this.tower_cursor.hide();
                    }
                }

                if (this.input.activePointer.isDown && !this.button_down) {
                    this.button_down = true;

                    if (this.tool_selected == 'build_tower_btn') {
                        if (!is_foggy && is_empty && this.points >= 5) {
                            this.place_tower(selected_tile_x, selected_tile_y);
                            this.points -= 5;
                        }
                    }
                    else {
                        if (is_foggy) {
                            if ((is_empty && this.tool_selected === 'mark_empty_btn') ||
                                (!is_empty && this.tool_selected === 'mark_road_btn')) {
                                this.map.removeTile(selected_tile_x, selected_tile_y, this.fog_layer);

                                if (this.update_numbers()){
                                    this.game.state.start('win_state');
                                    return;
                                }

                                this.paths = this.find_paths();

                                if (this.tool_selected == 'mark_road_btn') {
                                    this.points++;
                                }
                            }
                            else if (selected_fog_tile.index !== BAD_FOG_TILE){
                                // You can only be mistaken once for each tile
                                this.map.putTile(BAD_FOG_TILE, selected_tile_x, selected_tile_y, this.fog_layer);
                                this.lives -= BAD_SELECTION_PUNISHMENT;
                            }
                        }
                    }
                }
            }
        }
        else {
            this.marker.visible = false;
            this.tower_cursor.hide();
        }

        this.points_text.text = this.points;
        this.lives_text.text = this.lives;
        var time_of_next_wave = Math.ceil((this.next_wave_timer_event.tick - this.time.now) / 1000);
        if (time_of_next_wave < 0){
            time_of_next_wave = 0;
        }
        this.next_wave_text.text = time_of_next_wave;

        _.each(this.towers, function (t) {
            t.update(this, this);
        });

        this.enemies = _.filter(this.enemies, function(e) { return e.is_alive(); });
    },

    // UI functions

    draw_numbers: function(is_cols){
        var rows = this.sum_rows_or_cols(this.map, this.map_layer, is_cols);

        var longest_row_length = _.max(_.map(rows, function(r) { return r.length; }));

        var numbers_group = this.add.group();

        var texts = [];
        for (var i = 0; i < rows.length; i++){
            var texts_row = [];
            for (var j = 0; j < rows[i].length; j++) {
                var x_coord = this.map.tileWidth * (longest_row_length - rows[i].length + j);
                var y_coord = this.map.tileHeight * i;
                if (is_cols){
                    x_coord = this.map.tileWidth * i;
                    y_coord = this.map.tileHeight * (longest_row_length - rows[i].length + j);
                }
                var t = this.add.text(x_coord, y_coord, rows[i][j], NUMBERS_STYLE);
                t.x += (this.map.tileWidth - t.width) / 2;
                t.y += (this.map.tileHeight - t.height) / 2;
                texts_row.push(t);
                numbers_group.add(t);
            }
            texts.push(texts_row);
        }

        if (is_cols){
            this.top_numbers = texts;
        }
        else {
            this.left_numbers = texts;
        }

        return numbers_group;
    },


    _update_numbers_row: function(y, nums, width, reversed, cols){
        var numbers = nums[y];

        if (numbers.length === 0) return;

        var number_index = reversed ? numbers.length - 1 : 0;
        var current_block_size = 0;
        for (var x = reversed ? width - 1 : 0;
             reversed ? x >= 0 : x < width;
             reversed ? x-- : x++){
            var fog_tile = cols ? this.map.getTile(y, x, this.fog_layer) : this.map.getTile(x, y, this.fog_layer);

            var is_foggy = fog_tile && (fog_tile.index === FOG_TILE || fog_tile.index === BAD_FOG_TILE);

            if (is_foggy){
                break;
            }

            var map_tile = cols ? this.map.getTile(y, x, this.map_layer) : this.map.getTile(x, y, this.map_layer);

            var is_road = map_tile.index === ROAD_TILE;

            if (is_road){
                current_block_size++;
            }
            else{
                if (current_block_size > 0){
                    if (current_block_size === (+numbers[number_index].text)){
                        numbers[number_index].setStyle(STRIKE_OUT_STYLE);
                        reversed ? number_index-- : number_index++;
                        if (reversed ? number_index < 0 : number_index >= numbers.length){
                            return;
                        }
                        current_block_size = 0;
                    }
                    else {
                        break;
                    }
                }
            }
        }
        if (current_block_size === (+numbers[number_index].text)) {
            numbers[number_index].setStyle(STRIKE_OUT_STYLE);
        }
    },

    clear_row: function(y){
        for (var x = 0; x < this.map.width; x++){
            this.map.removeTile(x, y, this.fog_layer);
        }
    },

    clear_col: function(x){
        for (var y = 0; y < this.map.height; y++){
            this.map.removeTile(x, y, this.fog_layer);
        }
    },

    update_numbers: function(){
        var solution_rows = this.sum_rows_or_cols(this.map, this.map_layer, false, false);
        var solution_cols = this.sum_rows_or_cols(this.map, this.map_layer, true, false);

        var current_rows = this.sum_rows_or_cols(this.map, this.map_layer, false, true);
        var current_cols = this.sum_rows_or_cols(this.map, this.map_layer, true, true);

        if ((JSON.stringify(solution_rows) === JSON.stringify(current_rows)) &&
            (JSON.stringify(solution_cols) === JSON.stringify(current_cols))){
            return true;
        }

        for (var y = 0; y < this.map.height; y++){
            this._update_numbers_row(y, this.left_numbers, this.map.width, false, false);
            this._update_numbers_row(y, this.left_numbers, this.map.width, true, false);

            if (JSON.stringify(solution_rows[y]) === JSON.stringify(current_rows[y])){
                this.clear_row(y);
            }
        }

        for (var x = 0; x < this.map.width; x++){
            this._update_numbers_row(x, this.top_numbers, this.map.height, false, true);
            this._update_numbers_row(x, this.top_numbers, this.map.height, true, true);

            if (JSON.stringify(solution_cols[x]) === JSON.stringify(current_cols[x])){
                this.clear_col(x);
            }
        }

        return false;
    },

    make_btn: function (left, top, key) {
        var b = this.add.button(left, top, key, function(b) {
            this.tool_selected = key;
            _.map(this.btns, function(btn) {
                btn.freezeFrames = false;
                btn.frame = 0;
            });
            b.freezeFrames = true;
            b.frame = 1;
        }, this, 1, 0);
        b.scale.setTo(1.5, 1.5);
        return b;
    },

    // AI

    create_enemy: function (speed, health, tint){

        if (this.paths.length == 0) return;

        this.last_path_selected++;
        if (this.last_path_selected >= this.paths.length){
            this.last_path_selected = 0;
        }

        this.enemies.push(new Enemy(this, this.paths[this.last_path_selected], speed, health, tint));
    },

    create_wave: function(){

        var wave = this.waves[this.wave_index];

        var e = this.time.events.repeat(wave.rate, wave.count, this.create_enemy, this, wave.speed, wave.health, wave.tint);

        e.timer.onComplete.addOnce(function(){
            if (this.wave_index < this.waves.length - 1){
                this.wave_index++;
            }

            wave = this.waves[this.wave_index];

            this.next_wave_timer_event = this.time.events.add(wave.time_till_wave, this.create_wave, this);
        }, this);



    },

    place_tower: function(x, y) {
        var p = this.tile_location(new Phaser.Point(x, y));
        var constant_tower = new Tower(this, p.x, p.y);
        constant_tower.visible = true;
        this.towers.push(constant_tower);
    },

    // Pure functions

    sum_rows_or_cols: function (map, layer, is_cols, include_fog){
        var outer_index = map.height;
        var inner_index = map.width;

        if (is_cols){
            outer_index = map.width;
            inner_index = map.height;
        }

        var sums = [];
        for (var j = 0; j < outer_index; j++){
            var row_summation = [];
            var this_block_size = 0;

            for (var i = 0; i < inner_index; i++) {
                var tile;
                if (is_cols){
                    tile = map.getTile(j, i, layer);
                }
                else {
                    tile = map.getTile(i, j, layer);
                }

                if (tile.index === ROAD_TILE && (!include_fog || this.is_visible_road(tile))){
                    this_block_size++;
                }
                else {
                    if (this_block_size > 0){
                        row_summation.push(this_block_size);
                        this_block_size = 0;
                    }
                }
            }

            // The last tile might have been a good one
            if (this_block_size > 0){
                row_summation.push(this_block_size);
            }

            sums.push(row_summation);
        }

        return sums;
    },

    is_visible_road: function (tile){
        if (!tile){
            return false;
        }

        var fog_tile = this.map.getTile(tile.x, tile.y, this.fog_layer);

        return tile.index === ROAD_TILE && ((fog_tile && fog_tile.index !== FOG_TILE && fog_tile.index !== BAD_FOG_TILE) || (fog_tile == null));
    },

    is_pointer_in_table: function (){
        var px = this.input.activePointer.worldX - this.margin_left;
        var py = this.input.activePointer.worldY - this.margin_top;

        return (px > 0 && py > 0 && px < this.map.widthInPixels && py < this.map.heightInPixels);
    },

    make_graph: function (){
        var g = [];

        for (var y = 0; y < this.map.height; y++){
            var row = [];
            for (var x = 0; x < this.map.width; x++){
                var tile = this.map.getTile(x, y, this.map_layer);
                if (this.is_visible_road(tile)){
                    row.push(1);
                }
                else {
                    row.push(0);
                }
            }
            g.push(row);
        }
        return new Graph(g);
    },

    tile_location: function (p) {
        var tile = this.map.getTile(p.x, p.y);
        if (tile) {
            return new Phaser.Point(tile.worldX + this.margin_left, tile.worldY + this.margin_top);
        }
        return undefined;
    },

    find_paths: function (){
        var g = this.make_graph();

        var start_points = _.filter(g.grid[0], function(n) { return n.weight === 1; });
        var end_points = _.filter(g.grid[this.map.height - 1], function(n) { return n.weight === 1; });

        var paths = [];
        for (var i = 0; i < start_points.length; i++){
            for (var j = 0; j < end_points.length; j++){
                var shortest_path = astar.search(g, start_points[i], end_points[j]);
                if (shortest_path.length > 0){
                    var all_path = [start_points[i]].concat(shortest_path);
                    var phaser_points = _.map(all_path, function(n) { return this.tile_location(new Phaser.Point(n.y, n.x)); }, this);
                    paths.push(phaser_points);
                }
            }
        }

        return paths;
    }

};