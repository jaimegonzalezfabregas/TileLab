function update_download() {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project));
    saveButton.setAttribute("href", dataStr);
    saveButton.setAttribute("download", "TileLabProject.json");
}


function load_file() {
    let file = file_input.files[0];
    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function () {
        let text = reader.result

        console.log("loading:", text);

        project = JSON.parse(text);

        update_pallete()
        update_tile_list()
        update_scene_list()

        if (!project.parameters) project.parameters = {};
        if (!project.palette) project.palette = {};

        if (!project.parameters) project.parameters = {};

        tileresolution_input.value = project.parameters.tileresolution;
        scenetiles_input.value = project.parameters.scenetiles;

    
        update_download()

        document.getElementById("empty_project_warning").style.display = "none";

        check_editable_project()
    };

}

file_input.addEventListener("input", load_file);

function update_tile_size() {

    project.parameters.tileresolution = tileresolution_input.value;
    update_download()
    check_editable_project()
}
tileresolution_input.addEventListener("input", update_tile_size);

update_tile_size();


function update_scene_size() {

    project.parameters.scenetiles = scenetiles_input.value;
    update_download()
    check_editable_project()
}
scenetiles_input.addEventListener("input", update_scene_size);

update_scene_size();

function check_editable_project() {
    refresh_canvas();
    if (tileresolution_input.value == "" || scenetiles_input.value == "") {
        planning_button.disabled = true;
        drawing_button.disabled = true;
    } else {
        planning_button.disabled = false;
        drawing_button.disabled = false;
    }
}