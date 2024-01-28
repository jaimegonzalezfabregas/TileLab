let selected_tile_id = null;
let selected_scene_id = null;

let new_tile = () => {
    project.tiles[uniqid()] = {
        name: prompt("New name", "new tile"),
    }
    update_tile_list()
    update_download();
}

let new_scene = () => {
    project.scenes[uniqid()] = {
        name: prompt("New name", "new scene"),
    }
    update_scene_list();
    update_download();
}

function update_tile_list() {
    let tile_list = document.getElementById("tile_list")
    tile_list.innerHTML = ""
    if (Object.keys(project.tiles).length == 0) {
        let empty_tile_item = document.createElement("li")
        empty_tile_item.classList.add("list-group-item")
        empty_tile_item.innerHTML = "No tiles"
        tile_list.appendChild(empty_tile_item)
    } else {
        for (const tile_id in project.tiles) {
            const tile = project.tiles[tile_id];
            let tile_item = document.createElement("li")
            tile_item.classList.add("list-group-item")
            let thumbnail_canvas = document.createElement("canvas")
            const thumbnail_size = 30;
            thumbnail_canvas.width = thumbnail_size;
            thumbnail_canvas.height = thumbnail_size;
            let thumbnail_ctx = thumbnail_canvas.getContext("2d")
            draw_tile_at_pos(thumbnail_ctx, tile, 0, 0, thumbnail_size, project.parameters.tileresolution, tile.name)
            tile_item.appendChild(thumbnail_canvas)

            let tile_name = document.createElement("span")
            tile_name.classList.add("m-2")
            tile_name.innerHTML = tile.name;
            tile_item.appendChild(tile_name)


            if (selected_tile_id == tile_id) {
                tile_item.classList.add("active")
            }

            const delete_button = document.createElement("button")
            delete_button.classList.add("btn", "btn-danger", "float-end", "m-1")
            delete_button.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>'
            delete_button.onclick = () => {
                delete project.tiles[tile_id]
                if (selected_tile_id == tile_id) selected_tile_id = null;
                update_tile_list();
                refresh_canvas();
            }

            const edit_button = document.createElement("button")
            edit_button.classList.add("btn", "btn-secondary", "float-end", "m-1")
            edit_button.innerHTML = '<i class="fa fa-edit" aria-hidden="true"></i>'
            edit_button.onclick = () => {
                let new_name = prompt("New name", tile.name)
                if (new_name != null) {
                    tile.name = new_name
                    update_tile_list()
                }
            }
            tile_item.appendChild(edit_button)
            tile_item.appendChild(delete_button)
            tile_list.appendChild(tile_item)

            tile_item.onclick = () => {
                selected_tile_id = tile_id;
                update_tile_list()
            }

        }
    }
}



function update_scene_list() {
    let scene_list = document.getElementById("scene_list")
    scene_list.innerHTML = ""
    if (Object.keys(project.scenes).length == 0) {
        let empty_tile_item = document.createElement("li")
        empty_tile_item.classList.add("list-group-item")
        empty_tile_item.innerHTML = "No scenes"
        scene_list.appendChild(empty_tile_item)
    } else {
        for (const scene_id in project.scenes) {

            const scene = project.scenes[scene_id];
            let scene_item = document.createElement("li")
            scene_item.classList.add("list-group-item")
            scene_item.innerHTML = `<span class="m-2">${scene.name}</span>`


            if (selected_scene_id == scene_id) {
                scene_item.classList.add("active")
            }

            const delete_button = document.createElement("button")
            delete_button.classList.add("btn", "btn-danger", "float-end", "m-1")
            delete_button.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>'
            delete_button.onclick = () => {
                delete project.scenes[scene_id]
                if (selected_scene_id == scene_id) selected_scene_id = null;

                update_scene_list();

                refresh_canvas();
            }

            const edit_button = document.createElement("button")
            edit_button.classList.add("btn", "btn-secondary", "float-end", "m-1")
            edit_button.innerHTML = '<i class="fa fa-edit" aria-hidden="true"></i>'
            edit_button.onclick = () => {
                let new_name = prompt("New name", scene.name)
                if (new_name != null) {
                    scene.name = new_name
                    update_scene_list()
                }
            }

            scene_item.appendChild(edit_button)
            scene_item.appendChild(delete_button)
            scene_list.appendChild(scene_item)


            scene_item.onclick = () => {
                selected_scene_id = scene_id;
                update_scene_list()
                refresh_canvas();

            }

        }
    }
}

update_scene_list()
update_tile_list()