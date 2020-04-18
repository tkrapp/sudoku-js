# @t.krapp/sudoku-js
A simple Sudoku solver.

## Usage

```javascript
import { solve } from "@t.krapp/sudoku-js";

// solve a game
const INCOMPLETE_GAME = (
    "6..98...." +
    "13......." +
    ".976..8.." +
    // --------
    ".5....2.." +
    "8.62.57.9" +
    "..2....8." +
    // --------
    "..3..162." +
    "......397" +
    "....34..8"
);

for (let solution of solve(INCOMPLETE_GAME)) {
    console.log(solution);
}
```
