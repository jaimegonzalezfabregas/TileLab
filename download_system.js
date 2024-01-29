function download_tile(tile_id, pixel_size = null) {

    const tile = project.tiles[tile_id];

    let drawingCanvas = document.createElement('canvas');
    let context = drawingCanvas.getContext('2d');

    let pixSize = pixel_size || prompt("Pixel size (how big each pixel will end up being in the downloaded image)", 10);

    drawingCanvas.width = project.parameters.tileresolution * pixSize;
    drawingCanvas.height = project.parameters.tileresolution * pixSize;
    for (let i = 0; i < project.parameters.tileresolution; i++) {
        let col = tile.color[i];
        for (let j = 0; j < project.parameters.tileresolution; j++) {
            context.fillStyle = project.palette[col[j]] ?? "white";
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
    for (let tile_id in project.tiles) {
        download_tile(tile_id, size);
    }
}