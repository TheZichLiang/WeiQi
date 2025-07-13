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
}

export default ClientActionUtilities;
