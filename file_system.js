function update_download() {
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(get_ro_project()));
    saveButton.setAttribute("href", dataStr);
    saveButton.setAttribute("download", "TileLabProject.json");
}


function load_file() {
    let file = file_input.files[0];
    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function () {
        let text = reader.result

        let new_loaded_project = JSON.parse(text);



        if (!new_loaded_project.parameters) new_loaded_project.parameters = {};
        if (!new_loaded_project.palette) new_loaded_project.palette = {};

        if (!new_loaded_project.parameters) new_loaded_project.parameters = {};

        tileresolution_input.value = new_loaded_project.parameters.tileresolution;
        scenetiles_input.value = new_loaded_project.parameters.scenetiles;


        mut_project((_) => {
            return new_loaded_project;
        });

        update_download()

        document.getElementById("empty_project_warning").style.display = "none";

        check_editable_project()
        undo_stack = [];
        update_pallete()
        update_tile_list()
        update_scene_list()
        refresh_canvas()

    };

}

file_input.addEventListener("input", load_file);

function update_tile_size() {
    create_checkpoint()
    mut_project((project) => {
        project.parameters.tileresolution = tileresolution_input.value;
        return project;
    });
    update_download()
    check_editable_project()

}
tileresolution_input.addEventListener("input", update_tile_size);



function update_scene_size() {
    create_checkpoint()

    mut_project((project) => {
        project.parameters.scenetiles = scenetiles_input.value;
        return project;
    });
    update_download()
    check_editable_project()

}
scenetiles_input.addEventListener("input", update_scene_size);



function check_editable_project() {
    refresh_canvas();
    const warning = document.getElementById("unconfigured_project_warning");
    if (tileresolution_input.value == "" || scenetiles_input.value == "") {
        planning_button.disabled = true;
        drawing_button.disabled = true;
        warning.style.display = "block";
    } else {
        planning_button.disabled = false;
        drawing_button.disabled = false;
        warning.style.display = "none";
    }
}

let cache = null;

function mut_project(fnc) {
    let old_project;

    let stored_data = localStorage.getItem('project');

    old_project = cache || JSON.parse(stored_data) || default_project()

    const new_project = fnc(old_project);

    cache = new_project;

    if (stored_data != JSON.stringify(new_project)) {
        localStorage.setItem('project', JSON.stringify(new_project));
    }
}

function get_ro_project() {
    return cache || JSON.parse(localStorage.getItem('project')) || default_project();
}

function default_project() {
    return {
        parameters: {},
        palette: {},
        tiles: {},
        scenes: {}
    }
}