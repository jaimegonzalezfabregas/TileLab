
let pallete_item_selected_id = null;

const start_color = "#ffffff"
var colorPicker = new iro.ColorPicker('#picker', {
    width: 200,
    color: start_color,
    borderWidth: 1,
    borderColor: "#fff",

});

set_active_color(start_color);

colorPicker.on('color:change', function (color) {
    document.getElementById("new_color").style.backgroundColor = color.hexString
    if (pallete_item_selected_id != null) {

        const selected = document.getElementById(pallete_item_selected_id)
        selected.style.backgroundColor = color.hexString
        project.palette[pallete_item_selected_id] = color.hexString

        refresh_canvas();
        update_pallete();
    }
});

colorPicker.on('input:start', function (color) {
    document.getElementById("color_display").style.display = "block"
});

colorPicker.on('input:end', function (color) {
    document.getElementById("color_display").style.display = "none"
    set_active_color(color.hexString)
});


function delete_palette_item() {
    if (pallete_item_selected_id != null) {
        delete project.palette[pallete_item_selected_id]
        refresh_canvas();
        update_pallete();
    }
}

function deselect_palette_item() {
    pallete_item_selected_id = null;
    update_pallete();
}

function set_active_color(hex_color) {
    colorPicker.color.hexString = hex_color;
    document.getElementById("old_color").style.backgroundColor = hex_color
    refresh_canvas();
    update_pallete();
}

function add_palette_item() {

    let id = uniqid();
    project.palette[id] = colorPicker.color.hexString;
    pallete_item_selected_id = id;

    update_pallete();
}


function update_pallete() {

    document.getElementById("palette").innerHTML = "";

    if (pallete_item_selected_id == null) {
        delete_button.disabled = true;
        deselect_button.disabled = true;
    } else {
        delete_button.disabled = false;
        deselect_button.disabled = false;
    }

    for (let id in project.palette) {
        var div = document.createElement("div");
        div.classList.add("palette_item");
        div.style.backgroundColor = project.palette[id]
        div.id = id;

        if (pallete_item_selected_id == id) {
            if (colorPicker.color.value < 50 || (colorPicker.color.red < 100 && colorPicker.color.green < 100)) {
                div.style.border = "2px solid white"
            } else {
                div.style.border = "2px solid black"
            }
        }

        const select = () => {
            pallete_item_selected_id = id;
            set_active_color(project.palette[id])
            update_pallete();

        };
        div.addEventListener("click", select)
        document.getElementById("palette").appendChild(div)
    }

}
