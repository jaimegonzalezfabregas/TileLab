let undo_stack = [];

function KeyPress(e) {
    if (e.keyCode == 90 && e.ctrlKey) {
        // undo
        console.log("undo")
        let last_project = undo_stack.pop();
        if (last_project) {
            project = last_project;

            update_download();
            update_tile_list();
            update_pallete();
            refresh_canvas();
        }
    }
}

document.onkeydown = KeyPress;

function create_checkpoint() {
    console.log("checkpoint")
    undo_stack.push(JSON.parse(JSON.stringify(project)));

}