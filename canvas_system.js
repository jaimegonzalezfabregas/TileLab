function refresh_canvas() {

    console.log("refreshing canvas")

    const tileresolution = project.parameters.tileresolution;
    const scenetiles = project.parameters.scenetiles;


    const canvas_width = canvas.clientWidth;
    const canvas_height = canvas.clientHeight;
    canvas.width = canvas_width;
    canvas.height = canvas_height;


    const canvas_size = Math.min(canvas_width, canvas_height);
    const tilesize = canvas_size / scenetiles;
    const offset_x = (canvas_width - canvas_size) / 2;
    const offset_y = (canvas_height - canvas_size) / 2;

    if (selected_scene_id == null) {
        // draw text mesage
        ctx.fillStyle = "#000";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("No scene selected", canvas_width / 2, canvas_height / 2);
    } else {
        let selected_scene = project.scenes[selected_scene_id];
        if (!selected_scene.tiles) selected_scene.tiles = []

        for (let x = 0; x < scenetiles; x++) {
            if (!selected_scene.tiles[x]) selected_scene.tiles[x] = []
            for (let y = 0; y < scenetiles; y++) {

                let tile_x = offset_x + x * tilesize;
                let tile_y = offset_y + y * tilesize;

                let name = "no tile";

                if (selected_scene.tiles[x][y] != null) {
                    let tile = project.tiles[selected_scene.tiles[x][y]];
                    if (tile) {
                        if (mode == "planning") {
                            name = tile.name;
                        } else {
                            name = null;
                        }
                        draw_tile_at_pos(ctx, tile, tile_x, tile_y, tilesize, tileresolution);
                    } else {
                        selected_scene.tiles[x][y] = null;
                    }
                }
                ctx.beginPath();
                ctx.lineWidth = 1;
                ctx.strokeStyle = "#000";
                ctx.rect(tile_x, tile_y, tilesize, tilesize);
                ctx.stroke();

                if (name) {

                    // draw transparen overlay
                    ctx.fillStyle = "#ffffff80";
                    ctx.fillRect(tile_x, tile_y, tilesize, tilesize);

                    // draw name

                    ctx.fillStyle = "#000";
                    ctx.font = "15px Arial";
                    ctx.textAlign = "center";
                    ctx.fillText(name, tile_x + tilesize / 2, tile_y + tilesize / 2);
                }
            }
        }

    }
}

function draw_tile_at_pos(ctx, tile, offset_x, offset_y, tileside, tileresolution, name = null) {

    const pixel_size = tileside / tileresolution

    if (!tile.color) tile.color = [];
    for (x = 0; x < tileresolution; x++) {
        if (!tile.color[x]) tile.color[x] = [];
        for (y = 0; y < tileresolution; y++) {
            if (tile.color[x][y]) {
                let color_id = tile.color[x][y];
                if (color_id && project.palette[color_id]) {
                    ctx.fillStyle = project.palette[color_id];

                    ctx.fillRect(offset_x + (x * pixel_size), offset_y + (y * pixel_size), pixel_size, pixel_size);
                }
            }
        }
    }

}

refresh_canvas();


canvas.addEventListener("click", (e) => {

    let mouse_x = e.offsetX;
    let mouse_y = e.offsetY;

    const canvas_width = canvas.clientWidth;
    const canvas_height = canvas.clientHeight;
    const canvas_size = Math.min(canvas_width, canvas_height);
    const tilesize = canvas_size / project.parameters.scenetiles;
    const offset_x = (canvas_width - canvas_size) / 2;
    const offset_y = (canvas_height - canvas_size) / 2;

    let tile_x = Math.floor((mouse_x - offset_x) / tilesize);
    let tile_y = Math.floor((mouse_y - offset_y) / tilesize);

    if (tile_x < 0 || tile_y < 0 || tile_x >= project.parameters.scenetiles || tile_y >= project.parameters.scenetiles) return;

    if (mode == "planning" || mode == "file") {
        project.scenes[selected_scene_id].tiles[tile_x][tile_y] = selected_tile_id;
    } else if (mode == "drawing") {
        canvas_click_at(mouse_x, mouse_y)
    }

    refresh_canvas();
    update_download();

})

// draw while holding the mouse donw

let mouse_down = false;

canvas.addEventListener("mousedown", (e) => {
    mouse_down = true;
})
canvas.addEventListener("mouseup", (e) => {
    mouse_down = false;
})

canvas.addEventListener("mousemove", (e) => {
    if (mouse_down) {
        let mouse_x = e.offsetX;
        let mouse_y = e.offsetY;
        canvas_click_at(mouse_x, mouse_y);
        refresh_canvas();
        update_download();
    }
})


function canvas_click_at(mouse_x, mouse_y) {
    const canvas_width = canvas.clientWidth;
    const canvas_height = canvas.clientHeight;
    const canvas_size = Math.min(canvas_width, canvas_height);
    const tilesize = canvas_size / project.parameters.scenetiles;
    const offset_x = (canvas_width - canvas_size) / 2;
    const offset_y = (canvas_height - canvas_size) / 2;

    let tile_x = Math.floor((mouse_x - offset_x) / tilesize);
    let tile_y = Math.floor((mouse_y - offset_y) / tilesize);

    let tile_x_offset = Math.floor((mouse_x - offset_x) % tilesize);
    let tile_y_offset = Math.floor((mouse_y - offset_y) % tilesize);

    let tile_pixel_size = tilesize / project.parameters.tileresolution;

    let tile_pixel_x = Math.floor(tile_x_offset / tile_pixel_size);
    let tile_pixel_y = Math.floor(tile_y_offset / tile_pixel_size);

    let clicked_tile = project.scenes[selected_scene_id].tiles[tile_x][tile_y];

    console.log(clicked_tile, project.tiles[clicked_tile])
    console.log(tile_pixel_x, tile_pixel_y)

    project.tiles[clicked_tile].color[tile_pixel_x][tile_pixel_y] = pallete_item_selected_id;


}

// on resize update canvas
window.addEventListener("resize", refresh_canvas);