const origCanvas = document.getElementById("original-image-canvas");
const contextOrigCanvas = origCanvas.getContext("2d");
const outputCanvas = document.getElementById("edge-detect-canvas");
const contextOutputCanvas = outputCanvas.getContext("2d");
const uploadImg = document.getElementById("ImageFile");

uploadImg.addEventListener("change", (e) => {
    handleImageUpload(e.target.files[0]);
});

function handleImageUpload(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
        const img = new Image();
        img.onload = function () {
            origCanvas.style.height = outputCanvas.style.height =
                (img.height * origCanvas.offsetWidth) / img.width + "px";
            origCanvas.width = outputCanvas.width = img.width;
            origCanvas.height = outputCanvas.height = img.height;
            contextOrigCanvas.drawImage(img, 0, 0);
            processImage();
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
}

function processImage() {
    const width = origCanvas.width;
    const height = origCanvas.height;

    let pixels = contextOrigCanvas.getImageData(0, 0, width, height).data;

    // let blurred = blur(
    //     pixels,
    //     [
    //         [1, 1, 1],
    //         [1, 1, 1],
    //         [1, 1, 1],
    //     ],
    //     width,
    //     height
    // );

    let edgeDetected = edgeDetection(
        pixels,
        [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1],
        ],
        [
            [1, 2, 1],
            [0, 0, 0],
            [-1, -2, -1],
        ],
        width,
        height
    );
    const newImg = new ImageData(edgeDetected, width, height);
    console.log(newImg);
    console.log(newImg);

    contextOutputCanvas.putImageData(newImg, 0, 0);
}

function blur(pixels, convolution, width, height) {
    const convolutionSum =
        convolution[0][0] +
        convolution[0][1] +
        convolution[0][2] +
        convolution[1][0] +
        convolution[1][1] +
        convolution[1][2] +
        convolution[2][0] +
        convolution[2][1] +
        convolution[2][2];
    let newPixels = new Uint8ClampedArray(width * height * 4);
    let p0, p1, p2, p3, p4, p5, p6, p7, p8;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // hardCoding is better for fixed size :)
            let tl =
                (width * ((y - 1 + height) % height) +
                    ((x - 1 + width) % width)) *
                4;
            let tc =
                (width * ((y - 1 + height) % height) + ((x + width) % width)) *
                4;
            let tr =
                (width * ((y - 1 + height) % height) +
                    ((x + 1 + width) % width)) *
                4;
            let ml =
                (width * ((y + height) % height) + ((x - 1 + width) % width)) *
                4;
            let mc =
                (width * ((y + height) % height) + ((x + width) % width)) * 4;
            let mr =
                (width * ((y + height) % height) + ((x + 1 + width) % width)) *
                4;
            let bl =
                (width * ((y + 1 + height) % height) +
                    ((x - 1 + width) % width)) *
                4;
            let bc =
                (width * ((y + 1 + height) % height) + ((x + width) % width)) *
                4;
            let br =
                (width * ((y + 1 + height) % height) +
                    ((x + 1 + width) % width)) *
                4;

            p0 = pixels[tl] * convolution[0][0];
            p1 = pixels[tc] * convolution[0][1];
            p2 = pixels[tr] * convolution[0][2];
            p3 = pixels[ml] * convolution[1][0];
            p4 = pixels[mc] * convolution[1][1];
            p5 = pixels[mr] * convolution[1][2];
            p6 = pixels[bl] * convolution[2][0];
            p7 = pixels[bc] * convolution[2][1];
            p8 = pixels[br] * convolution[2][2];
            let red =
                (p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8) / convolutionSum;

            p0 = pixels[tl + 1] * convolution[0][0];
            p1 = pixels[tc + 1] * convolution[0][1];
            p2 = pixels[tr + 1] * convolution[0][2];
            p3 = pixels[ml + 1] * convolution[1][0];
            p4 = pixels[mc + 1] * convolution[1][1];
            p5 = pixels[mr + 1] * convolution[1][2];
            p6 = pixels[bl + 1] * convolution[2][0];
            p7 = pixels[bc + 1] * convolution[2][1];
            p8 = pixels[br + 1] * convolution[2][2];
            let green =
                (p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8) / convolutionSum;

            p0 = pixels[tl + 2] * convolution[0][0];
            p1 = pixels[tc + 2] * convolution[0][1];
            p2 = pixels[tr + 2] * convolution[0][2];
            p3 = pixels[ml + 2] * convolution[1][0];
            p4 = pixels[mc + 2] * convolution[1][1];
            p5 = pixels[mr + 2] * convolution[1][2];
            p6 = pixels[bl + 2] * convolution[2][0];
            p7 = pixels[bc + 2] * convolution[2][1];
            p8 = pixels[br + 2] * convolution[2][2];
            let blue =
                (p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8) / convolutionSum;

            newPixels[mc] = red;
            newPixels[mc + 1] = green;
            newPixels[mc + 2] = blue;
            newPixels[mc + 3] = pixels[mc + 3];
        }
    }
    return newPixels;
}

function grayscale(pixels) {
    for (let i = 0; i < pixels.length; i += 4) {
        let red = pixels[i];
        let green = pixels[i + 1];
        let blue = pixels[i + 2];
        let grayscale = 0.3 * red + 0.59 * green + 0.11 * blue;
        pixels[i] = grayscale;
        pixels[i + 1] = grayscale;
        pixels[i + 2] = grayscale;
    }
    return pixels;
}

function edgeDetection(pixels, convolutionX, convolutionY, width, height) {
    let newPixels = new Uint8ClampedArray(width * height * 4);
    let p0, p1, p2, p3, p4, p5, p6, p7, p8;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // hardCoding is better for fixed size :)
            let tl =
                (width * ((y - 1 + height) % height) +
                    ((x - 1 + width) % width)) *
                4;
            let tc =
                (width * ((y - 1 + height) % height) + ((x + width) % width)) *
                4;
            let tr =
                (width * ((y - 1 + height) % height) +
                    ((x + 1 + width) % width)) *
                4;
            let ml =
                (width * ((y + height) % height) + ((x - 1 + width) % width)) *
                4;
            let mc =
                (width * ((y + height) % height) + ((x + width) % width)) * 4;
            let mr =
                (width * ((y + height) % height) + ((x + 1 + width) % width)) *
                4;
            let bl =
                (width * ((y + 1 + height) % height) +
                    ((x - 1 + width) % width)) *
                4;
            let bc =
                (width * ((y + 1 + height) % height) + ((x + width) % width)) *
                4;
            let br =
                (width * ((y + 1 + height) % height) +
                    ((x + 1 + width) % width)) *
                4;

            p0 = pixels[tl] * convolutionX[0][0];
            p1 = pixels[tc] * convolutionX[0][1];
            p2 = pixels[tr] * convolutionX[0][2];
            p3 = pixels[ml] * convolutionX[1][0];
            p4 = pixels[mc] * convolutionX[1][1];
            p5 = pixels[mr] * convolutionX[1][2];
            p6 = pixels[bl] * convolutionX[2][0];
            p7 = pixels[bc] * convolutionX[2][1];
            p8 = pixels[br] * convolutionX[2][2];
            let changeX = p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8;

            p0 = pixels[tl] * convolutionY[0][0];
            p1 = pixels[tc] * convolutionY[0][1];
            p2 = pixels[tr] * convolutionY[0][2];
            p3 = pixels[ml] * convolutionY[1][0];
            p4 = pixels[mc] * convolutionY[1][1];
            p5 = pixels[mr] * convolutionY[1][2];
            p6 = pixels[bl] * convolutionY[2][0];
            p7 = pixels[bc] * convolutionY[2][1];
            p8 = pixels[br] * convolutionY[2][2];
            let changeY = p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8;

            let magnitude = map(
                Math.sqrt(changeX * changeX + changeY * changeY),
                0,
                1414,
                0,
                255
            );
            let angle = Math.atan2(changeY, changeX);
            // Convert angle into RGB smoothly using cosine shifts
            newPixels[mc] = (Math.cos(angle) * magnitude + magnitude) / 2; // Red
            newPixels[mc + 1] =
                (Math.cos(angle + (2 / 3) * Math.PI) * magnitude + magnitude) /
                2; // Green
            newPixels[mc + 2] =
                (Math.cos(angle + (4 / 3) * Math.PI) * magnitude + magnitude) /
                2; // Blue
            newPixels[mc + 3] = pixels[mc + 3]; // Preserve alpha channel
        }
    }
    return newPixels;
}
const map = (value, x1, y1, x2, y2) =>
    ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
