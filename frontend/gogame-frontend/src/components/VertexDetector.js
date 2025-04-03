class VertexDetector {
    constructor(imageSrc) {
        this.imageSrc = imageSrc;
    }

    loadImage() {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = this.imageSrc;
        });
    }
    
    async processImage(boardSize) {
        const img = await this.loadImage();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
    
        const binaryMatrix = this.generateBinaryMatrix(imageData);
        const visited = Array.from({ length: imageData.height }, () => new Array(imageData.width).fill(false));
        let largestComponent = [];
    
        for (let x = 0; x < binaryMatrix.length; x++) {  // x is height (rows)
            for (let y = 0; y < binaryMatrix[0].length; y++) {  // y is width (columns)
                if (binaryMatrix[x][y] === 1 && !visited[x][y]) {
                    const component = this.dfs(binaryMatrix, x, y, visited);
                    if (component.length > largestComponent.length) {
                        largestComponent = component;
                    }
                }
            }
        }
        return this.findIntersections(largestComponent, boardSize);
    }
    
    generateBinaryMatrix(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const matrix = Array.from({ length: height }, () => new Array(width).fill(0));
    
        for (let x = 0; x < height; x++) {
            for (let y = 0; y < width; y++) {
                const idx = (x * width + y) * 4;
                const red = imageData.data[idx];
                const green = imageData.data[idx + 1];
                const blue = imageData.data[idx + 2];
                matrix[x][y] = (red < 80 && green < 80 && blue < 80) ? 1 : 0;
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
    
            if (visited[curX][curY]) continue;
                visited[curX][curY] = true;
                component.push([curX, curY]);
    
            for (let [dx, dy] of directions) {
                const newX = curX + dx;
                const newY = curY + dy;
        
                if (newX >= 0 && newY >= 0 && newX < matrix.length && newY < matrix[0].length &&
                    matrix[newX][newY] === 1 && !visited[newX][newY]) {
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
                intersections.push({x, y, gridCol: i, gridRow: j });
            }
        }
        return intersections;
    }
}

export default VertexDetector;