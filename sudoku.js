const CHUNK_SIZE = 3;
const ROW_SIZE = CHUNK_SIZE * CHUNK_SIZE;
const COL_SIZE = ROW_SIZE;
const NUM_SQUARES = ROW_SIZE;

/**
 * Get a range generator from start to stop with stepping
 *
 * @param {number} start
 * @param {number} stop
 * @param {number} [step=1] - Stepping of the values
 * @yields {number}
 */
function* range(start, stop, step) {
    let current = start;

    if (step === undefined) {
        step = 1;
    }

    while (current < stop) {
        yield current;

        current += step;
    }
}

/**
 * Return a row from the game
 *
 * @param {string} game - The game
 * @param {number} row_number - Number of the wanted row
 * @returns {string}
 */
export function get_row(game, row_number) {
    return game.slice(row_number * ROW_SIZE, row_number * ROW_SIZE + ROW_SIZE);
}

/**
 * Return a column from the game
 *
 * @param {string} game - The game
 * @param {number} col_number - Number of the wanted column
 * @returns {string}
 */
export function get_col(game, col_number) {
    /**
     * Get a specific char from a row
     *
     * @param {number} row_number - Number of the wanted row
     * @returns {string}
     */
    function get_char(row_number) {
        return game[row_number * ROW_SIZE + col_number];
    }
    return Array.from(range(0, 9)).map(get_char).join('');
}

/**
 * Return a square from the game
 *
 * @param {string} game - The game
 * @param {number} x - x coordinate in the game
 * @param {number} y - y coordinate in the game
 * @returns {string}
 */
export function get_square(game, x, y) {
    function get_square_row(row_number) {
        return game.slice(
            row_number * ROW_SIZE + square_x,
            row_number * ROW_SIZE + square_x + CHUNK_SIZE
        );
    }
    let square_x = Math.floor(x / CHUNK_SIZE) * CHUNK_SIZE;
    let square_y = Math.floor(y / CHUNK_SIZE) * CHUNK_SIZE;

    return Array.from(
        range(square_y, square_y + 3)
    ).map(get_square_row).join('');
}

export function* iter_rows(game) {
    for (let row = 0; row < ROW_SIZE; row += 1) {
        yield get_row(game, row);
    }
}

export function* iter_cols(game) {
    for (let col = 0; col < COL_SIZE; col += 1) {
        yield get_col(game, col);
    }
}

export function* iter_squares(game) {
    for (let square = 0; square < NUM_SQUARES; square += 1) {
        let y = Math.floor(square / CHUNK_SIZE) * CHUNK_SIZE;
        let x = (square % CHUNK_SIZE) * CHUNK_SIZE;

        yield get_square(game, x, y);
    }
}

/**
 * Check if a game of sudoku is completed
 *
 * @param {string} game - The sudoku game
 * @returns {Boolean}
 */
export function is_complete(game) {
    return (
        Array.from(iter_rows(game)).every(check_item) &&
        Array.from(iter_cols(game)).every(check_item) &&
        Array.from(iter_squares(game)).every(check_item)
    );
}

/**
 * Get the difference of two sets
 *
 * @param {Set} setA
 * @param {Set} setB
 * @returns {Set}
 */
function difference(setA, setB) {
    var _difference = new Set(setA);
    for (var elem of setB) {
        _difference.delete(elem);
    }
    return _difference;
}

const POSSIBLE_NUMBERS = Array.from(range(1, ROW_SIZE + 1)).map((num) => num.toString());
/**
 * Get a list of candidates for a given x, y combination
 *
 * @param {string} game - The sudoku game
 * @param {number} x - The x coordinate in the game
 * @param {number} y - The y coordinate in the game
 * @returns {Set}
 */
export function get_candidates(game, x, y) {
    return (
        difference(
            difference(
                difference(POSSIBLE_NUMBERS, new Set(get_row(game, y))),
                new Set(get_col(game, x))
            ),
            new Set(get_square(game, x, y))
        )
    );
}

/**
 * Class to signal an error when a row, column or square is invalid.
 */
export class ItemError extends Error {
    constructor(message) {
        super(message);

        this.name = "ItemError";
    }
}
/**
 * Check if all numbers are in an item
 *
 * @param {string} item - One row, column or square from the game
 * @returns {Boolean}
 * @throws {ItemError}
 */
export function check_item(item) {
    if (item.length !== ROW_SIZE) {
        throw new ItemError(`Item '${item}' has a length not equal to ${ROW_SIZE}`);
    }

    let itemSet = new Set(item);

    return POSSIBLE_NUMBERS.every((num) => itemSet.has(num));
}

const POSSIBLE_NUMBERS_SET = new Set(POSSIBLE_NUMBERS);
/**
 * Return all possible solutions for a given game of sudoku
 *
 * @param {string} game - The initial game
 * @param {number} [startAt=0] - The position to start from
 * @yields {string}
 */
export function* solve(game, start_at) {
    const GAME_LEN = game.length;

    for (let position = start_at || 0; position < GAME_LEN; position += 1) {
        let num = game[position];

        if (POSSIBLE_NUMBERS_SET.has(num)) {
            continue;
        }

        let x = position % ROW_SIZE;
        let y = Math.floor(position / ROW_SIZE);
        let candidates = Array.from(get_candidates(game, x, y));

        if (candidates.length === 0) {
            return;
        }

        for (let candidate of candidates) {
            let new_game = game.slice(0, position) + candidate + game.slice(position + 1);
            for (let solution of solve(new_game)) {
                yield solution;
            }
        }

        return;
    }

    if (is_complete(game)) {
        yield game;
    }
}

/**
 * Return all possible solutions for a given game of sudoku. Iteratively
 *
 * @param {string} game - The initial game
 * @param {number} [startAt=0] - The position to start from
 * @yields {string}
 */
export function* solve_iter(game, start_at) {
    const GAME_LEN = game.length;
    let state = [[game, start_at]];

    while (state.length > 0) {
        [game, start_at] = state.pop();

        for (let position = start_at || 0; position < GAME_LEN; position += 1) {
            let num = game[position];

            if (POSSIBLE_NUMBERS_SET.has(num)) {
                continue;
            }

            let x = position % ROW_SIZE;
            let y = Math.floor(position / ROW_SIZE);
            let candidates = Array.from(get_candidates(game, x, y));

            if (candidates.length === 0) {
                break;
            }

            for (let candidate of candidates) {
                let new_game = game.slice(0, position) + candidate + game.slice(position + 1);

                state.push([new_game, position]);
            }

            break;
        }

        if (is_complete(game)) {
            yield game;
        }
    }
}
