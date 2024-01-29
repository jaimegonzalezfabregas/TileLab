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