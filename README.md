# Worker Pool
### Worker pool implementation for Node.js
This is simple small library for multithreading.

## Use cases
If you need handle CPU-intensive task, without blocking main thread.


## Usage 
First you need to create an instance of worker pool.
```js
const N = 7; // count of threads you want. Usually equals count of your cores minus 1
const workerPool = new WorkerPool(N);
```

Next you just send command to your worker pool to execute some commands.
For instance, your task is to find sum of array. 
```js
workerPool
    .executeTask((A) => A.reduce((prev, acc) => prev + acc, 0), getArray(250000))
    .then((result) => console.log(result))
    .catch((err) => console.error(err))
```
Method ***getArray(N)*** returns list with size N, where N is integer.

Method ***executeTask()*** returns promise, so handling result of the task is quite easy. 

With async/await syntax getting result looks like this.
```js
const result = await workerPool.executeTask((A) => A.reduce((prev, acc) => prev + acc, 0), getArray(250000))
```