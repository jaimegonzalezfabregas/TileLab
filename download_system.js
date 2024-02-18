function download_tile(tile_id, pixel_size = null) {

    const tile = get_ro_project().tiles[tile_id];

    let drawingCanvas = document.createElement('canvas');
    let context = drawingCanvas.getContext('2d');

    let pixSize = pixel_size || prompt("Pixel size (how big each pixel will end up being in the downloaded image)", 10);

    drawingCanvas.width = get_ro_project().parameters.tileresolution * pixSize;
    drawingCanvas.height = get_ro_project().parameters.tileresolution * pixSize;
    for (let i = 0; i < get_ro_project().parameters.tileresolution; i++) {
        let col = tile.color[i];
        for (let j = 0; j < get_ro_project().parameters.tileresolution; j++) {
            context.fillStyle = get_ro_project().palette[col[j]] ?? "white";
            context.fillRect(j * pixSize, i * pixSize, pixSize, pixSize);
        }
    }

    let dataURL = drawingCanvas.toDataURL();

    let link = document.createElement('a');
    link.download = tile.name + ".png";
    link.href = dataURL;
    link.click();

}

function download_all_tiles() {
    let size = prompt("Pixel size (how big each pixel will end up being in the downloaded image)", 10);
    for (let tile_id in get_ro_project().tiles) {
        download_tile(tile_id, size);
    }
}

let directions = {
    "North": { dx: 0, dy: 1 },
    "South": { dx: 0, dy: -1 },
    "East": { dx: -1, dy: 0 },
    "West": { dx: 1, dy: 0 }
}

let oposite_directions = {
    "North": "South",
    "South": "North",
    "East": "West",
    "West": "East"
}

function get_tile_name(tile_id) {
    return get_ro_project().tiles[tile_id].name;
}

function download_adjacency() {
    let rules = {}

    // for each tile, what tiles can be placed next to it in each direction

    for (let tile_id in get_ro_project().tiles) {
        let tile_name = get_tile_name(tile_id)
        let tile = get_ro_project().tiles[tile_id];
        rules[get_tile_name(tile_id)] = {}
        for (let direction in directions) {
            rules[get_tile_name(tile_id)][direction] = []

            let dx = directions[direction].dx;
            let dy = directions[direction].dy;

            for (let scene_id in get_ro_project().scenes) {
                let scene = get_ro_project().scenes[scene_id];
                for (let i = 0; i < get_ro_project().parameters.scenetiles; i++) {
                    for (let j = 0; j < get_ro_project().parameters.scenetiles; j++) {
                        if (scene.tiles[i][j] == tile_id) {
                            if (scene.tiles[i + dx] && scene.tiles[i + dx][j + dy]) {

                                let neigh_id = scene.tiles[i + dx][j + dy];
                                let neigh_name = get_tile_name(neigh_id);
                                if (rules[tile_name][direction].indexOf(neigh_name) == -1) {
                                    rules[tile_name][direction].push(neigh_name);
                                }
                            }
                        }
                    }
                }
            }

        }
    }

    // generalizate the existing rules knowing when a -> b and c -> b and c -> d then a -> d

    // let changed = true;

    // while (changed) {

    //     changed = false;

    //     for (let A in rules) {
    //         for (let direction in directions) {
    //             for (let B of rules[A][direction]) {
    //                 for (let C of rules[B][oposite_directions[direction]]) {
    //                     for (let D of rules[C][direction]) {
    //                         if (rules[A][direction].indexOf(D) == -1) {
    //                             rules[A][direction].push(D);
    //                             changed = true;
    //                         }
    //                         if (rules[D][oposite_directions[direction]].indexOf(A) == -1) {
    //                             rules[D][oposite_directions[direction]].push(A);
    //                             changed = true;
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }


    // write the rust code, here is an example 
    /*
    #[derive(Clone, Copy, Debug, PartialEq)]
    pub enum Basic {
        Grass,
        Sea,
        Beach,
    }
    use Basic::*;

    impl Tile<3> for Basic {
        fn all() -> [Self; 3] {
            [Grass, Sea, Beach]
        }

        fn ordinal(&self) -> usize {
            match self {
                Grass => 0,
                Sea => 1,
                Beach => 2,
            }
        }


        fn texture(&self) -> String {
            match self {
                Grass => "Grass.png".to_string(),
                Sea => "Sea.png".to_string(),
                Beach => "Beach.png".to_string(),
            }
        }

        fn allowance(&self, dir: Direction) -> TileBitSet {
            TileBitSet::new(match (self, dir) {
                (Grass, North) => &[Grass, Beach],
                (Grass, South) => &[Grass, Beach],
                (Grass, East) => &[Grass, Beach],
                (Grass, West) => &[Grass, Beach],
                (Sea, _) => &[Sea, Beach],
                (Beach, _) => &[Sea, Grass, Beach],
            })
        }
    }
    
    */

    const EnumName = prompt("Enum name", "Basic");

    let rust_out = `#[derive(Clone, Copy, Debug, PartialEq)]
    pub enum ${EnumName} {
    `
    for (let tile_name in rules) {
        rust_out += capitalize(tile_name) + ",\n";
    }
    rust_out += "}\n";
    rust_out += `use ${EnumName}::*;\n\n`;
    rust_out += `impl Tile<${Object.keys(rules).length}> for ${EnumName} {\n`;
    
    rust_out += `fn all() -> [Self; ${Object.keys(rules).length}] {\n[`;
    for (let tile_name in rules) {
        rust_out += capitalize(tile_name) + ", ";
    }
    rust_out += "]}\n";
    
    rust_out += `fn ordinal(&self) -> usize {\n`;
    rust_out += "match self {\n";
    for (let tile_name in rules) {
        rust_out += `    ${capitalize(tile_name)} => ${Object.keys(rules).indexOf(tile_name)},\n`;
    }
    rust_out += "}}\n";

    rust_out += `fn texture(&self) -> String {\n`;
    rust_out += "match self {\n";
    for (let tile_name in rules) {
        rust_out += `    ${capitalize(tile_name)} => "${tile_name}.png".to_string(),\n`;
    }
    rust_out += "}}\n";
    
    rust_out += `fn allowance(&self, dir: Direction) -> TileBitSet {\n`;
    rust_out += "TileBitSet::new(match (self, dir) {\n";
    for (let tile_name in rules) {
        for (let direction in directions) {
            rust_out += `(${capitalize(tile_name)}, ${direction}) => &[`;
            for (let neigh_name of rules[tile_name][direction]) {
                rust_out += capitalize(neigh_name) + ", ";
            }
            rust_out += "],\n";
        }
    }
    rust_out += "})}}\n";
    
    console.log(rust_out);
    alert("results are on clipboard")
    writeClipboardText(rust_out);


    console.log(rules)

}


const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

async function writeClipboardText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error(error.message);
    }
  }