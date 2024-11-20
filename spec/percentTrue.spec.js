describe('percentTrue', () => {
    const percentTrue = require('../src/summary-stats').percentTrue
    const items = [
        {"a": true, "b": "string", "c": []},
        {"a": true, "b": "other string", "c": [1]},
        {"a": true, "b": "third string", "c": [2, 3]},
        {"a": false, "b": "", "c": [4]},
    ]

    it("finds the percentage of true properties in an array of objects", () => {
        expect(percentTrue("a", items)).toBe("75.00%")
        expect(percentTrue("b", items)).toBe("75.00%")
    })

    it("works with array filter functions", () => {
        expect(percentTrue((i) => i.b.length > 6, items)).toBe("50.00%")
        expect(percentTrue((i) => i.c.includes(2), items)).toBe("25.00%")
    })
})
