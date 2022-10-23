import { Worker } from "worker_threads";
import { FunctionStringify } from "./FunctionSerializer.js";

class WorkerPoolItem {
    constructor(worker, available) {
        this.id = Math.random();
        this.worker = worker;
        this.available = available;
        this.terminated = false;
    }
}

export class WorkerPool {
    constructor(workerCount) {
        if(workerCount < 1) {
            throw new Error('Can not create less than one worker.')
        }
        this.workers = new Set();
        for(let i = 0; i < workerCount; i++) {
            this.createWorker();
        }
    }

    /** Adds worker to the pool */
    createWorker() {
        this.workers.add(new WorkerPoolItem(new Worker('./worker.js'), true));
    }

    /** Executes task in another thread */
    executeTask(func, ...funcArguments) {
        return new Promise((res, rej) => {
            if(!this.isPoolReady()) {
                rej('Pool has no available workers. Your task has been declined.');
            }
            if(this.terminated) {
                rej('Pool has been already terminated.');
            }
            const stringifiedFunction = FunctionStringify(func);
            for(const workerPoolItem of this.workers) {
                if(workerPoolItem.available) {
                    workerPoolItem.available = false;
                    const worker = workerPoolItem.worker;
                    worker.removeAllListeners();
                    const postData = {
                        func: stringifiedFunction,
                        arguments: funcArguments,
                    }
                    worker.postMessage(postData);
                    worker.once('message', (data) => {
                        workerPoolItem.available = true;
                        res(data);
                    })
                    worker.once('error', (err) => {
                        rej(`Worker terminated with error: ${err}`);
                    })
                    worker.once('exit', (msg) => {
                        rej(`Worker exited with message: ${msg}`);
                    })
                    break;
                }
            }
        })
    }
    /** Has at least one available worker */
    isPoolReady() {
        return [...this.workers.values()].some(worker => worker.available);
    }

    /** Terminates pool and destroy all workers */
    terminatePool() {
        for(const workerPoolItem of this.workers) {
            const worker = workerPoolItem.worker;
            worker.terminate();
        }
        this.terminated = true;
        console.debug('All uncompleted tasks has been declined by user request.');
    }
}
