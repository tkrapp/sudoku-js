import { default as chai } from "chai";
import { solve, get_row, get_col, get_square, get_candidates, check_item, is_complete, ItemError, iter_rows, iter_cols, iter_squares } from "./sudoku.js";

describe("Sudoku", function () {
    describe("#get_*", function () {
        const GAME = (
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
        const SQUARES = [
            [[1, 2], "111222333"], [[4, 0], "111222333"], [[8, 1], "111222333"],
            [[0, 3], "444555666"], [[4, 4], "444555666"], [[7, 5], "444555666"],
            [[2, 8], "777888999"], [[5, 7], "777888999"], [[8, 8], "777888999"],
        ]

        for (let row_col_square = 0; row_col_square < 9; row_col_square += 1) {
            let expected_row = `${row_col_square + 1}`.repeat(9);
            let expected_col = "123456789";
            let [[x, y], expected_square] = SQUARES[row_col_square];

            it(`get_row(GAME, ${row_col_square}) should return '${expected_row}'`, function () {
                chai.expect(get_row(GAME, row_col_square)).to.equal(expected_row);
            });
            it(`get_col(GAME, ${row_col_square}) should return '${expected_col}'`, function () {
                chai.expect(get_col(GAME, row_col_square)).to.equal(expected_col);
            })
            it(`get_square(GAME, ${x}, ${y}) should return '${expected_square}'`, function () {
                chai.expect(get_square(GAME, x, y)).to.equal(expected_square);
            });
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
        })
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
                let col = []
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

        it("should return 1 solution (easy)", function() {
            chai.expect(Array.from(solve(EASY_GAME))).to.eql(SOLUTION);
        });
        it("should return 1 solution (medium)", function() {
            chai.expect(Array.from(solve(MEDIUM_GAME))).to.eql(SOLUTION);
        });
    });
});
