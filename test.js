import { default as chai } from "chai";
import { solve, solve_iter, get_row, get_col, get_square, get_candidates, check_item, is_complete, ItemError, iter_rows, iter_cols, iter_squares } from "./sudoku.js";
import { default as partial } from "partial";

/**
 * Function to compate two strings as chai test.
 *
 * @param {string} current_value - The current value
 * @param {string} expected_value - The expected value
 */
function compare(current_value, expected_value) {
    chai.expect(current_value).to.equal(expected_value);
}

describe("Sudoku", function () {
    describe("#get_*", function () {
        const GAME_ROWS = [
            "6..98....",
            "13.......",
            ".976..8..",
            ".5....2..",
            "8.62.57.9",
            "..2....8.",
            "..3..162.",
            "......397",
            "....34..8",
        ];
        const GAME_COLS = [
            "61..8....",
            ".395.....",
            "..7.623..",
            "9.6.2....",
            "8.......3",
            "....5.1.4",
            "..827.63.",
            ".....829.",
            "....9..78",
        ];
        const GAME_SQUARES = [
            [[1, 2], "6..13..97"], [[4, 0], "98....6.."], [[8, 1], "......8.."],
            [[0, 3], ".5.8.6..2"], [[4, 4], "...2.5..."], [[7, 5], "2..7.9.8."],
            [[2, 8], "..3......"], [[5, 7], "..1....34"], [[8, 8], "62.397..8"],
        ];
        const GAME = GAME_ROWS.join('');

        for (let idx = 0; idx < 9; idx += 1) {
            let expected_row = GAME_ROWS[idx];
            let expected_col = GAME_COLS[idx];
            let [[x, y], expected_square] = GAME_SQUARES[idx];

            it(`get_row(GAME, ${idx}) should return '${expected_row}'`,
                partial(compare, get_row(GAME, idx), expected_row)
            );
            it(`get_col(GAME, ${idx}) should return '${expected_col}'`,
                partial(get_col(GAME, idx), expected_col)
            );
            it(`get_square(GAME, ${x}, ${y}) should return '${expected_square}'`,
                partial(get_square(GAME, x, y), expected_square)
            );
        }
    });
    describe("#check_item", function ( ) {
        it("should return true", function () {
            chai.expect(check_item("123456789")).to.equal(true);
            chai.expect(check_item("975214368")).to.equal(true);
        });
        it("should return false", function () {
            chai.expect(check_item("975214388")).to.equal(false);
            chai.expect(check_item("9752143.8")).to.equal(false);
        });
        it("should throw an error", function () {
            chai.expect(() => check_item("9752143881")).to.throw(
                ItemError,
                "Item '9752143881' has a length not equal to 9"
            );
            chai.expect(() => check_item("97521431")).to.throw(
                ItemError,
                "Item '97521431' has a length not equal to 9"
            );
        });
    });
    describe("#is_complete", function () {
        const FALSE_GAME = (
            "111111111" +
            "222222222" +
            "333333333" +
            "444444444" +
            "555555555" +
            "666666666" +
            "777777777" +
            "888888888" +
            "999999999"
        );
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
        const SOLVED_GAME = (
            "625987143" +
            "138452976" +
            "497613852" +
            //---------
            "954378261" +
            "816245739" +
            "372169485" +
            //---------
            "783591624" +
            "541826397" +
            "269734518"
        );
        it("should return false", function () {
            chai.expect(is_complete(FALSE_GAME)).to.equal(false);
            chai.expect(is_complete(INCOMPLETE_GAME)).to.equal(false);
        });
        it("should return true", function () {
            chai.expect(is_complete(SOLVED_GAME)).to.equal(true);
        });
    });
    describe("#iter_*", function () {
        const GAME_ROWS = [
            "625987143",
            "138452976",
            "497613852",
            //---------
            "954378261",
            "816245739",
            "372169485",
            //---------
            "783591624",
            "541826397",
            "269734518",
        ];
        const GAME_COLS = Array.from(function* () {
            for(let col_idx = 0; col_idx < 9; col_idx += 1) {
                let col = [];
                for(let row_idx = 0; row_idx < 9; row_idx += 1) {
                    col.push(GAME_ROWS[row_idx][col_idx]);
                }
                yield col.join('');
            }
        }());
        const GAME_SQUARES = [
            "625138497", "987452613", "143976852", "954816372", "378245169",
            "261739485", "783541269", "591826734", "624397518",
        ];
        const GAME = GAME_ROWS.join('');

        it("iter_rows should be deeply equal", function () {
            chai.expect(Array.from(iter_rows(GAME))).to.eql(GAME_ROWS);
        });
        it("iter_cols should be deeply equal", function () {
            chai.expect(Array.from(iter_cols(GAME))).to.eql(GAME_COLS);
        });
        it("iter_squares should be deeply equal", function () {
            chai.expect(Array.from(iter_squares(GAME))).to.eql(GAME_SQUARES);
        });
    });
    describe("#get_candidates", function () {
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
        const NO_CANDIDATE_GAME = (
            "6..98...." +
            "13......." +
            ".976..8.." +
            // --------
            ".5....2.." +
            "8.62.57.9" +
            "..2....8." +
            // --------
            "..3..162." +
            ".4....397" +
            ".2..34..8"
        );

        it("should return Set([1, 5])", function () {
            chai.expect(get_candidates(INCOMPLETE_GAME, 6, 8)).to.eql(new Set(["1", "5"]));
        });
        it("should return Set([])", function () {
            chai.expect(get_candidates(NO_CANDIDATE_GAME, 1, 0)).to.eql(new Set([]));
        });
    });
    describe("#solve", function () {
        const MEDIUM_GAME = (
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
        const EASY_GAME = (
            "625987143" +
            "138452976" +
            "497613852" +
            //---------
            "954378261" +
            "816245739" +
            "372169485" +
            //---------
            "783591624" +
            "541826397" +
            "26973451."
        );
        const SOLUTION = [
            "625987143" +
            "138452976" +
            "497613852" +
            //---------
            "954378261" +
            "816245739" +
            "372169485" +
            //---------
            "783591624" +
            "541826397" +
            "269734518",
        ];
        const SIX_SOLUTIONS_GAME = (
            "6..98...." +
            "13......." +
            ".976..8.." +
            // --------
            ".5....2.." +
            "8.62.57.9" +
            "..2....8." +
            // --------
            "..3..162." +
            "......3.7" +
            "....34..8"
        );
        const SIX_SOLUTIONS = new Set([
            "624983571138457962597612843459378216816245739372169485783591624941826357265734198",
            "624987153138452976597613842459378261816245739372169485783591624945826317261734598",
            "624987513138452976597613842459378261816245739372169485783591624941826357265734198",
            "625983471138457962497612853359178246816245739742369185573891624984526317261734598",
            "625987143138452976497613852954378261816245739372169485783591624541826397269734518",
            "625987143138452976497613852954378261816245739372169485783591624549826317261734598",
        ]);
        const NO_SOLUTION_GAME = (
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
            "....344.8"
        );

        it("should return no solution", function () {
            chai.expect(Array.from(solve(NO_SOLUTION_GAME))).to.eql([]);
        });
        it("should return one solution (easy)", function () {
            chai.expect(Array.from(solve(EASY_GAME))).to.eql(SOLUTION);
        });
        it("should return one solution (medium)", function () {
            chai.expect(Array.from(solve(MEDIUM_GAME))).to.eql(SOLUTION);
        });
        it("should return six solutions (medium)", function () {
            chai.expect(new Set(solve(SIX_SOLUTIONS_GAME))).to.eql(SIX_SOLUTIONS);
        });
    });
    describe("#solve_iter", function () {
        const MEDIUM_GAME = (
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
        const EASY_GAME = (
            "625987143" +
            "138452976" +
            "497613852" +
            //---------
            "954378261" +
            "816245739" +
            "372169485" +
            //---------
            "783591624" +
            "541826397" +
            "26973451."
        );
        const SOLUTION = [
            "625987143" +
            "138452976" +
            "497613852" +
            //---------
            "954378261" +
            "816245739" +
            "372169485" +
            //---------
            "783591624" +
            "541826397" +
            "269734518",
        ];
        const SIX_SOLUTIONS_GAME = (
            "6..98...." +
            "13......." +
            ".976..8.." +
            // --------
            ".5....2.." +
            "8.62.57.9" +
            "..2....8." +
            // --------
            "..3..162." +
            "......3.7" +
            "....34..8"
        );
        const SIX_SOLUTIONS = new Set([
            "624983571138457962597612843459378216816245739372169485783591624941826357265734198",
            "624987153138452976597613842459378261816245739372169485783591624945826317261734598",
            "624987513138452976597613842459378261816245739372169485783591624941826357265734198",
            "625983471138457962497612853359178246816245739742369185573891624984526317261734598",
            "625987143138452976497613852954378261816245739372169485783591624541826397269734518",
            "625987143138452976497613852954378261816245739372169485783591624549826317261734598",
        ]);
        const NO_SOLUTION_GAME = (
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
            "....344.8"
        );

        it("should return no solution", function () {
            chai.expect(Array.from(solve(NO_SOLUTION_GAME))).to.eql([]);
        });
        it("should return one solution (easy)", function () {
            chai.expect(Array.from(solve_iter(EASY_GAME))).to.eql(SOLUTION);
        });
        it("should return one solution (medium)", function () {
            chai.expect(Array.from(solve_iter(MEDIUM_GAME))).to.eql(SOLUTION);
        });
        it("should return six solutions (medium)", function () {
            chai.expect(new Set(solve_iter(SIX_SOLUTIONS_GAME))).to.eql(SIX_SOLUTIONS);
        });
    });
});
