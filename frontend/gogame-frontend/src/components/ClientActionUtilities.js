class ClientActionUtilities {

    constructor() {
      this.stateKeys = ['gameStarted', 'boardImage', 'boardSize', 'intersections', 'boardState', 'currentStone'];
    }
  
    saveState(state) {
      this.stateKeys.forEach(key => {
        localStorage.setItem(key, JSON.stringify(state[key]));
      });
    }
  
    loadState() {
      const state = {};
      this.stateKeys.forEach(key => {
        const item = localStorage.getItem(key);
        state[key] = item ? JSON.parse(item) : this.getDefaultState(key);
      });
      return state;
    }
  
    getDefaultState(key) {
      switch (key) {
        case 'gameStarted':
          return false;
        case 'boardImage':
          return '';
        case 'intersections':
          return [];
        case 'boardState':
          return [];
        case 'currentStone':
          return 'black';
        case 'boardSize':
            return '19';  
        default:
          return null;
      }
    }
  
   
    handleWindowResize(updateScalesAndRect) {
        window.addEventListener('resize', updateScalesAndRect);
        return () => window.removeEventListener('resize', updateScalesAndRect);
    }

    updateScalesAndRect(boardRef, boardSize, setScaleWidth, setScaleHeight, setBoardRect, setCellSize) {
        if (boardRef.current) {
        const naturalWidth = boardRef.current.naturalWidth;
        const naturalHeight = boardRef.current.naturalHeight;
        const displayedWidth = boardRef.current.clientWidth;
        const displayedHeight = boardRef.current.clientHeight;
        setScaleWidth(displayedWidth / naturalWidth);
        setScaleHeight(displayedHeight / naturalHeight);
        setBoardRect(boardRef.current.getBoundingClientRect());
        setCellSize({
            width: displayedWidth / boardSize,
            height: displayedHeight / boardSize
        });
        console.log("Board Rect set:", boardRef.current.getBoundingClientRect());
        }
    }
}

export default ClientActionUtilities;
