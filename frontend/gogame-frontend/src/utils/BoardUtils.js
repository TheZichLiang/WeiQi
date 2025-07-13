/**
 * Given an event, board DOM rect, and scale factors,
 * return the raw (x,y) in board‐image space.
 */
export function pixelToBoardCoords(event, boardRect, scaleWidth, scaleHeight) {
  const x = (event.clientX - boardRect.left) / scaleWidth;
  const y = (event.clientY - boardRect.top)  / scaleHeight;
  return { x, y };
}

/**
 * Given raw board‐image (x,y), list of intersections,
 * find the nearest intersection index within threshold.
 */
export function findNearestIntersection(x, y, intersections, cellSize, threshold = 0.8) {
  const maxDist = threshold * Math.min(cellSize.width, cellSize.height);
  let bestIdx = -1, bestDist = Infinity;
  intersections.forEach(({ x: ix, y: iy }, i) => {
    const dx = x - ix, dy = y - iy;
    const d = Math.hypot(dx, dy);
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  });
  console.log("maxDist:", maxDist, "bestDist:", bestDist);
  return bestDist < maxDist ? bestIdx : -1;
}

/**
 * Map a grid coordinate back to DOM pixels, for placing stones/territory.
 */
export function gridToClientPixels(gridCol, gridRow, intersections, scaleWidth, scaleHeight) {
  const intr = intersections.find(i => i.gridCol === gridCol && i.gridRow === gridRow);
  if (!intr) return null;
  return { x: intr.x * scaleWidth, y: intr.y * scaleHeight };
}

/**
 * Given the <img> natural & client size, produce scale factors & cell size.
 */
export function calculateScales(naturalWidth, naturalHeight, clientWidth, clientHeight, boardSize) {
  const scaleW = clientWidth / naturalWidth;
  const scaleH = clientHeight / naturalHeight;
  const cell = { width: clientWidth / boardSize, height: clientHeight / boardSize };
  return { scaleW, scaleH, cell };
}

/**
 * Pick the right board‐image URL from the size.
 */
export function selectBoardImage(baseUrl, size) {
  const map = { '9': 'GO9x9.png', '13':'GO13x13.png', '19':'GO19x19.png' };
  return `${baseUrl}/assets/${map[size] || map['19']}`;
}

/**
 * Intersection occupied check - checks if a specific intersection is occupied by a stone.
 */
export function isIntersectionOccupied(col, row, board) {
  return board.some(s => s.col === col && s.row === row);
}

/* Handle board click - processes the click event to determine the intersection clicked on the board.*/
export function handleBoardClick(event, intersections, boardRect, scaleWidth, scaleHeight, cellSize) {
  const { x, y } = pixelToBoardCoords(event, boardRect, scaleWidth, scaleHeight);
  const nearestIndex = findNearestIntersection(x, y, intersections, cellSize);  // ← use real cellSize
  if (nearestIndex !== -1) return intersections[nearestIndex];
  return null;
}

/**
 * Given a boardRef and boardSize, return scale factors, cell size, and bounding rect.
 */
export function extractBoardMetrics(boardRef, boardSize) {
  if (!boardRef?.current) return null;

  const img = boardRef.current;
  const { naturalWidth, naturalHeight, clientWidth, clientHeight } = img;
  const { scaleW, scaleH, cell } = calculateScales(
    naturalWidth,
    naturalHeight,
    clientWidth,
    clientHeight,
    boardSize
  );

  const rect = img.getBoundingClientRect();
  return {
    scaleW,
    scaleH,
    cell,
    rect
  };
}