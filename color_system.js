

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
    if (selected != null) {
        selected.style.backgroundColor = color.hexString
        selected.setAttribute("hex_color", color.hexString)
    }
});

colorPicker.on('input:start', function (color) {
    document.getElementById("color_display").style.display = "block"
});

colorPicker.on('input:end', function (color) {
    document.getElementById("color_display").style.display = "none"
    set_active_color(color.hexString)
});

let selected = null;

function delete_palette_item() {
    if (selected != null) {
        document.getElementById("palette").removeChild(selected)
    }
    delete_button.disabled = true;
    deselect_button.disabled = true;
}

function deselect_palette_item() {
    if (selected != null) {
        selected.style.border = "none"
        selected = null;
    }
    delete_button.disabled = true;
    deselect_button.disabled = true;
}

function set_active_color(hex_color) {
    colorPicker.color.hexString = hex_color;
    document.getElementById("old_color").style.backgroundColor = hex_color
}

function add_palette_item() {

    let hex_color = colorPicker.color.hexString
    var div = document.createElement("div");
    div.setAttribute("hex_color", hex_color)

    div.style.backgroundColor = hex_color
    div.classList.add("palette_item");
    div.style.width = "50px"
    div.style.height = "50px"
    div.style.margin = "5px"
    div.style.borderRadius = "5px"
    div.style.cursor = "pointer"
    div.style.border = "none"
    div.style.boxShadow = "0px 0px 5px 0px rgba(0,0,0,0.25)"

    div.addEventListener("click", function () {
        delete_button.disabled = false;
        deselect_button.disabled = false;
        selected = div;
        document.querySelectorAll(".palette_item").forEach(function (item) {
            item.style.border = "none"
        })
        div.style.border = "2px solid black"
        set_active_color(div.getAttribute("hex_color"))
    })
    div.click()
    document.getElementById("palette").appendChild(div)
}
