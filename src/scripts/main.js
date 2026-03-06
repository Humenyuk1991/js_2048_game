'use strict';

// Uncomment the next lines to use your game instance in the browser
// const Game = require('../modules/Game.class');
// const game = new Game();

// Write your code here
class Game {
  constructor(initialState = null) {
    this.initialState = initialState;
    this.init();
  }

  init() {
    this.state = this.initialState
      ? this.initialState.map((row) => [...row])
      : this.createEmptyBoard();
    this.score = 0;
    this.status = 'idle';
  }

  createEmptyBoard() {
    return Array.from({ length: 4 }, () => Array(4).fill(0));
  }

  // Допоміжний метод для глибокого копіювання
  getState() {
    return this.state.map((row) => [...row]);
  }

  getScore() {
    return this.score;
  }
  getStatus() {
    return this.status;
  }

  start() {
    if (this.status !== 'idle') {
      return;
    }
    this.status = 'playing';

    if (!this.initialState) {
      this.addRandomTile();
      this.addRandomTile();
    }
  }

  restart() {
    this.state = this.initialState
      ? this.initialState.map((row) => [...row])
      : this.createEmptyBoard();
    this.score = 0;

    this.status = 'playing';

    if (!this.initialState) {
      this.addRandomTile();
      this.addRandomTile();
    }
  }

  addRandomTile() {
    const empty = [];

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.state[r][c] === 0) {
          empty.push([r, c]);
        }
      }
    }

    if (empty.length > 0) {
      const [r, c] = empty[Math.floor(Math.random() * empty.length)];

      this.state[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  // Логіка злиття: одна плитка = одне злиття за хід
  compress(row) {
    const filtered = row.filter((x) => x !== 0);
    let i = 0;

    while (i < filtered.length - 1) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        this.score += filtered[i];
        filtered.splice(i + 1, 1);
        i++; // ВАЖЛИВО: перескакуємо, щоб не зливати результат повторно
      } else {
        i++;
      }
    }

    // Додаємо нулі до довжини 4
    while (filtered.length < 4) {
      return filtered.push(0);
    }

    return filtered;
  }

  // Універсальний метод руху
  move(direction) {
    if (this.status !== 'playing') {
      return;
    }

    const prevState = JSON.stringify(this.state);

    if (direction === 'left' || direction === 'right') {
      this.state = this.state.map((row) => {
        const r = direction === 'right' ? [...row].reverse() : [...row];
        const processed = this.compress(r);

        return direction === 'right' ? processed.reverse() : processed;
      });
    } else {
      // Up/Down через транспонування
      this.transpose();

      this.state = this.state.map((row) => {
        const r = direction === 'down' ? [...row].reverse() : [...row];
        const processed = this.compress(r);

        return direction === 'down' ? processed.reverse() : processed;
      });
      this.transpose(); // Повертаємо назад
    }

    if (prevState !== JSON.stringify(this.state)) {
      this.addRandomTile();
      this.checkGameStatus();
    }
  }

  // Методи-обгортки для сумісності з вашим інтерфейсом
  moveLeft() {
    this.move('left');
  }
  moveRight() {
    this.move('right');
  }
  moveUp() {
    this.move('up');
  }
  moveDown() {
    this.move('down');
  }

  transpose() {
    this.state = this.state[0].map((_, i) => this.state.map((row) => row[i]));
  }

  checkGameStatus() {
    // 1. Перемога
    if (this.state.some((row) => row.includes(2048))) {
      this.status = 'win';

      return;
    }

    // 2. Програш (якщо немає нулів і немає ходів)
    if (!this.canMove()) {
      this.status = 'lose';
    }
  }

  canMove() {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.state[r][c] === 0) {
          return true;
        }

        if (c < 3 && this.state[r][c] === this.state[r][c + 1]) {
          return true;
        }

        if (r < 3 && this.state[r][c] === this.state[r + 1][c]) {
          return true;
        }
      }
    }

    return false;
  }
}



const game = new Game();

game.getState();
game.getScore();
game.getStatus();
