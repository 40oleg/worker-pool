import { WorkerPool } from "./workerpool.js";

const workerPool = new WorkerPool(16);

function getArray(N) {
    return (new Array(N)).fill(0).map(() => Math.random());
}

function multiply(a, b) {
    var aNumRows = a.length, aNumCols = a[0].length,
        bNumRows = b.length, bNumCols = b[0].length,
        m = new Array(aNumRows);  // initialize array of rows
    for (var r = 0; r < aNumRows; ++r) {
        m[r] = new Array(bNumCols); // initialize the current row
        for (var c = 0; c < bNumCols; ++c) {
            m[r][c] = 0;             // initialize the current cell
            for (var i = 0; i < aNumCols; ++i) {
                m[r][c] += a[r][i] * b[i][c];
            }
        }
    }
    return m;
}
const array = getArray(1_000_000);

setInterval(() => {
    workerPool
        .executeTask((A) => A.reduce((prev, acc) => prev + acc, 0), array)
        .then((result) => console.log(result))
        .catch((err) => console.log(err))
}, 500)

// workerPool.terminatePool();