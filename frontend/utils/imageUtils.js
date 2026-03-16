// imageUtils.js

/**
 * Image manipulation utility functions
 */

/**
 * Function to overlay a logo on an image
 * @param {HTMLImageElement} image - The main image
 * @param {HTMLImageElement} logo - The logo to overlay
 * @param {number} x - X coordinate for logo placement
 * @param {number} y - Y coordinate for logo placement
 * @returns {HTMLCanvasElement} - Canvas with overlaid logo
 */
function overlayLogo(image, logo, x, y) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    ctx.drawImage(logo, x, y);
    return canvas;
}

/**
 * Function to download an image
 * @param {HTMLCanvasElement} canvas - The canvas element containing the image
 * @param {string} filename - The name for the downloaded file
 */
function downloadImage(canvas, filename) {
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = filename;
    link.click();
}

/**
 * Function to adjust image brightness
 * @param {HTMLImageElement} image - The image to adjust
 * @param {number} brightness - The brightness factor (1 for normal, <1 for darker, >1 for brighter)
 * @returns {HTMLCanvasElement} - Canvas with adjusted brightness
 */
function adjustBrightness(image, brightness) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] *= brightness;     // Red
        imageData.data[i + 1] *= brightness; // Green
        imageData.data[i + 2] *= brightness; // Blue
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}
