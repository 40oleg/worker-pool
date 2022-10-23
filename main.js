import { WorkerPool } from "./WorkerPool.js";

const workerPool = new WorkerPool(4);

workerPool
    .executeTask((A) => A.reduce((prev, acc) => prev + acc, 0), [1,2,3,4,5])
    .then((result) => {
        console.log(result)
        workerPool.terminatePool();
    })
    .catch((err) => console.error(err))


