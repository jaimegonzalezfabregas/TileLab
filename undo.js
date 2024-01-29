let undo_stack = [];

function KeyPress(e) {
    if (e.keyCode == 90 && e.ctrlKey) {
        // undo
        let last_project = undo_stack.pop();
        console.log("undo", undo_stack.length)
        if (last_project) {
            project = last_project;

            update_download();
            update_tile_list();
            update_pallete();
            refresh_canvas();
            referesh_color_picker();
        }
    }
}

document.onkeydown = KeyPress;

function create_checkpoint(msg) {
    undo_stack.push(JSON.parse(JSON.stringify(project)));
    console.log("checkpoint", undo_stack.length, msg)

}