import { Worker } from "worker_threads";
import { FunctionStringify, FunctionParse } from "./FunctionSerializer.js";

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
                    console.log('worker locked ' + workerPoolItem.id);
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
                        rej(err);
                    })
                    worker.once('exit', (msg) => {
                        rej(msg);
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
    }
}
