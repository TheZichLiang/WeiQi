class IntersectionDetector {

    constructor(imageSrc) {
        this.imageSrc = imageSrc;
    }

    async processAndDisplayImage(imageSrc, boardSize) {
        const img = await this.loadImage(imageSrc);
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const binaryMatrix = this.generateBinaryMatrix(imageData);
        const visited = Array.from({ length: imageData.height }, () => new Array(imageData.width).fill(false));
        let largestComponent = [];

        for (let y = 0; y < binaryMatrix.length; y++) {
            for (let x = 0; x < binaryMatrix[0].length; x++) {
                if (binaryMatrix[y][x] === 1 && !visited[y][x]) {
                    const component = this.dfs(binaryMatrix, x, y, visited);
                    if (component.length > largestComponent.length) {
                        largestComponent = component;
                    }
                }
            }
        }

        const intersections = this.findIntersections(largestComponent, boardSize);
        intersections.forEach(point => {
            ctx.fillStyle = 'red'; // Use a red color to mark intersections
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    generateBinaryMatrix(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const matrix = Array.from({ length: height }, () => new Array(width).fill(0));
    
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const red = imageData.data[idx];
                const green = imageData.data[idx + 1];
                const blue = imageData.data[idx + 2];
                matrix[y][x] = (red < 80 && green < 80 && blue < 80) ? 1 : 0;
            }
        }
    
        return matrix;
    }
    
    dfs(matrix, x, y, visited) {
        const stack = [[x, y]];
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        const component = [];
    
        while (stack.length) {
            const [curX, curY] = stack.pop();
    
            if (visited[curY][curX]) continue;
                visited[curY][curX] = true;
                component.push([curX, curY]);
    
            for (let [dx, dy] of directions) {
                const newX = curX + dx;
                const newY = curY + dy;
        
                if (newX >= 0 && newY >= 0 && newX < matrix[0].length && newY < matrix.length &&
                    matrix[newY][newX] === 1 && !visited[newY][newX]) {
                        stack.push([newX, newY]);
                }
            }
        }
    
        return component;
    }
    
    findIntersections(largestComponent, boardHW) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        let intersections = [];
    
        largestComponent.forEach(([x, y]) => {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        });
    
        const gridSpacingX = (maxX - minX) / (boardHW - 1);
        const gridSpacingY = (maxY - minY) / (boardHW - 1);
    
        for (let i = 0; i < boardHW; i++) {
            for (let j = 0; j < boardHW; j++) {
                const x = minX + i * gridSpacingX;
                const y = minY + j * gridSpacingY;
                intersections.push({ x, y });
            }
        }
        return intersections;
    }
}

// Event listeners to handle file input and process the image
document.getElementById('processButton').addEventListener('click', function() {
    const fileInput = document.getElementById('imageInput');
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = async function(e) {
            const detector = new IntersectionDetector(e.target.result);
            await detector.processAndDisplayImage(e.target.result, 13); // Assuming a 19x19 board
        };
        reader.readAsDataURL(file);
    }
});
