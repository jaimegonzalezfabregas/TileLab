
let pallete_item_selected_id = null;

const start_color = "#ffffff"
let colorPicker = new iro.ColorPicker('#picker', {
    width: 200,
    color: start_color,
    borderWidth: 1,
    borderColor: "#fff",
    layout: [
        {
            component: iro.ui.Wheel,
            options: {
                borderColor: '#ffffff'
            }
        },
        {
            component: iro.ui.Slider,
            options: {
                sliderType: 'hue'
            }
        },
        {
            component: iro.ui.Slider,
            options: {
                sliderType: 'saturation'
            }
        },
        {
            component: iro.ui.Slider,
            options: {
                // can also be 'saturation', 'value', 'red', 'green', 'blue', 'alpha' or 'kelvin'
                sliderType: 'value'
            }
        },
    ]

});



let started = false;

colorPicker.on(['input:move', 'input:start'], function (color) {

    if (pallete_item_selected_id != null) {

        if (!started) {
            started = true;
            create_checkpoint("color change")
        }
        const selected = document.getElementById(pallete_item_selected_id)
        selected.style.backgroundColor = color.hexString
        mut_project((project) => {
            project.palette[pallete_item_selected_id] = color.hexString
            return project;
        });
        refresh_canvas();
        update_pallete();
    }
});

colorPicker.on("input:end", () => {
    started = false;
})

function delete_palette_item() {
    if (pallete_item_selected_id != null) {
        create_checkpoint()
        mut_project((project) => {
            delete project.palette[pallete_item_selected_id]
            return project;
        });
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
    refresh_canvas();
    update_pallete();
}

function referesh_color_picker() {

    console.log("refresh color picker with", get_ro_project().palette[pallete_item_selected_id])
    colorPicker.color.hexString = get_ro_project().palette[pallete_item_selected_id];

}

function add_palette_item() {
    create_checkpoint()

    let id = uniqid();
    mut_project((project) => {
        project.palette[id] = colorPicker.color.hexString;
        return project;
    });
    pallete_item_selected_id = id;

    update_pallete();
}


function update_pallete() {
    console.log("selected", pallete_item_selected_id)
    document.getElementById("palette").innerHTML = "";

    if (pallete_item_selected_id == null) {
        delete_button.disabled = true;
        deselect_button.disabled = true;
    } else {
        delete_button.disabled = false;
        deselect_button.disabled = false;
    }

    const palette = get_ro_project().palette;

    for (let id in palette) {
        let div = document.createElement("div");
        div.classList.add("palette_item");
        div.style.backgroundColor = palette[id]
        div.id = id;

        if (pallete_item_selected_id == id) {
            if (colorPicker.color.value < 50 || (colorPicker.color.red < 100 && colorPicker.color.green < 100)) {
                div.style.border = "5px solid white"
            } else {
                div.style.border = "5px solid black"
            }

        }

        const select = () => {
            console.log("select", id)
            pallete_item_selected_id = id;
            set_active_color(palette[id])
            update_pallete();

        };
        div.addEventListener("click", select)
        document.getElementById("palette").appendChild(div)
    }

}
