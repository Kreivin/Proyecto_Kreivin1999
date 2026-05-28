const sum = require('./suma')// importar la funcion

test("La funcion suma debe devolver suma correcta", () => {
    expect(sum(1, 2)).toBe(3);
});
