describe('enumerate', () => {
    const enumerate = require('../src/summary-stats').enumerate
    it("finds all values of an array property", () => {
        expect(enumerate("a", [
            {a: [1, 2]},
            {a: []},
            {a: [3]},
            {a: [1]}])
        ).toEqual([1, 2, 3])
        expect(enumerate("a", [
            {a: ["b"]},
            {a: ["c", "true"]},
            {a: [2]}])
        ).toEqual(["b", "c", "true", 2])
    })
})
