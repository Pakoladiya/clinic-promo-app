import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Resize an image to fit within given dimensions.
 * @param {string} imageUri - URI of the image
 * @param {{ width?: number, height?: number }} size
 * @returns {Promise<string>} - URI of the resized image
 */
export async function resizeImage(imageUri, { width, height }) {
    const resize = {};
    if (width) resize.width = width;
    if (height) resize.height = height;

    const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
}

/**
 * Crop an image to a square — useful for clinic logo uploads.
 * @param {string} imageUri
 * @param {number} size - side length of the square in pixels
 * @returns {Promise<string>}
 */
export async function squareCrop(imageUri, size = 300) {
    const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: size, height: size } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.PNG }
    );
    return result.uri;
}
