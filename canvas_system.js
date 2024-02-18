function refresh_canvas() {
    const tileresolution = get_ro_project().parameters.tileresolution;
    const scenetiles = get_ro_project().parameters.scenetiles;


    const canvas_width = canvas.clientWidth;
    const canvas_height = canvas.clientHeight;

    const context = canvas.getContext('2d');

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Will always clear the right space
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();

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
        const selected_scene = get_ro_project().scenes[selected_scene_id];
        if (!selected_scene.tiles) selected_scene.tiles = []

        for (let x = 0; x < scenetiles; x++) {
            if (!selected_scene.tiles[x]) selected_scene.tiles[x] = []
            for (let y = 0; y < scenetiles; y++) {

                let tile_x = offset_x + x * tilesize;
                let tile_y = offset_y + y * tilesize;

                let name = "no tile";

                if (selected_scene.tiles[x][y] != null) {
                    const tile = get_ro_project().tiles[selected_scene.tiles[x][y]];
                    if (tile) {
                        if (mode == "planning") {
                            name = tile.name;
                        } else {
                            name = null;
                        }
                        draw_tile_at_pos(ctx, tile, tile_x, tile_y, tilesize, tileresolution);
                    } else {
                        mut_project((project) => {
                            project.scenes[selected_scene_id].tiles[x][y] = null;
                            return project;
                        })
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
                if (color_id && get_ro_project().palette[color_id]) {
                    ctx.fillStyle = get_ro_project().palette[color_id];

                    ctx.fillRect(offset_x + (x * pixel_size), offset_y + (y * pixel_size), pixel_size + 1, pixel_size + 1);
                }
            }
        }
    }

}



canvas.addEventListener("click", canvas_click)

let mouse_down = false;

canvas.addEventListener("mousedown", (e) => {
    create_checkpoint()

    mouse_down = true;
    canvas_click(e)
})
canvas.addEventListener("mouseup", (e) => {
    mouse_down = false;
    last_mouse_x = null;
    last_mouse_y = null;
})

let last_mouse_x = null;
let last_mouse_y = null;

const substeps = 20;

canvas.addEventListener("mousemove", (e) => {
    canvas_click(e)
})

function canvas_click(e) {
    if (mouse_down) {
        const mouse_x = e.offsetX;
        const mouse_y = e.offsetY;


        if (last_mouse_x == null) last_mouse_x = mouse_x;
        if (last_mouse_y == null) last_mouse_y = mouse_y;

        for (let i = 0; i < substeps; i++) {
            let step_x = last_mouse_x + ((mouse_x - last_mouse_x) * (i / substeps));
            let step_y = last_mouse_y + ((mouse_y - last_mouse_y) * (i / substeps));

            const invertedTransform = ctx.getTransform().invertSelf();

            const originalClick = invertedTransform.transformPoint({ x: step_x, y: step_y });

            // Call a function to draw something at the clicked position
            canvas_click_at(originalClick.x, originalClick.y, e.buttons);


        }

        refresh_canvas();
        update_tile_list();
        update_download();
        last_mouse_x = mouse_x;
        last_mouse_y = mouse_y;
    }
}

const CLICK = 1;
const PICK = 2;

function canvas_click_at(mouse_x, mouse_y, buttons) {

    console.log("buttons", buttons)

    const canvas_width = canvas.clientWidth;
    const canvas_height = canvas.clientHeight;
    const canvas_size = Math.min(canvas_width, canvas_height);
    const tilesize = canvas_size / get_ro_project().parameters.scenetiles;
    const offset_x = (canvas_width - canvas_size) / 2;
    const offset_y = (canvas_height - canvas_size) / 2;

    let tile_x = Math.floor((mouse_x - offset_x) / tilesize);
    let tile_y = Math.floor((mouse_y - offset_y) / tilesize);

    let tile_x_offset = Math.floor((mouse_x - offset_x) % tilesize);
    let tile_y_offset = Math.floor((mouse_y - offset_y) % tilesize);

    let tile_pixel_size = tilesize / get_ro_project().parameters.tileresolution;

    let tile_pixel_x = Math.floor(tile_x_offset / tile_pixel_size);
    let tile_pixel_y = Math.floor(tile_y_offset / tile_pixel_size);

    let clicked_tile = get_ro_project().scenes[selected_scene_id].tiles[tile_x][tile_y];

    mut_project((project) => {

        if (mode == "planning") {
            if (buttons == CLICK) {
                project.scenes[selected_scene_id].tiles[tile_x][tile_y] = selected_tile_id;
            }else if (buttons == PICK) {
                selected_tile_id = project.scenes[selected_scene_id].tiles[tile_x][tile_y];
                update_tile_list()
            }
        } else if (mode == "drawing") {
            if (buttons == CLICK) {
                if (!project.tiles[clicked_tile].locked) {
                    project.tiles[clicked_tile].color[tile_pixel_x][tile_pixel_y] = pallete_item_selected_id;
                }
            } else if (buttons == PICK) {
                pallete_item_selected_id = project.tiles[clicked_tile].color[tile_pixel_x][tile_pixel_y];
                update_pallete()
            }
        }
        return project

    });

}

window.oncontextmenu = function (event) {
    if (mode == "drawing" || mode == "planning") {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
};

// on resize update canvas

const canvas_on_resize = () => {
    const canvas_width = canvas.clientWidth;
    const canvas_height = canvas.clientHeight;
    canvas.width = canvas_width;
    canvas.height = canvas_height;
    refresh_canvas()
}
window.addEventListener("resize", canvas_on_resize);


// drag



let isDragging = false;
let lastX = 0;
let lastY = 0;

let zoom = 1;

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1) { // Check if the middle mouse button is clicked
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;

        ctx.translate(deltaX / zoom, deltaY / zoom);
        lastX = e.clientX;
        lastY = e.clientY;
        refresh_canvas();
    }
});

canvas.addEventListener('wheel', (e) => {
    console.log(e.deltaY);
    const scaleFactor = e.deltaY > 0 ? 1.1 : 0.9;
    zoom *= scaleFactor;

    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    ctx.translate(mouseX, mouseY);
    ctx.scale(scaleFactor, scaleFactor);
    ctx.translate(-mouseX, -mouseY);

    refresh_canvas();
});
