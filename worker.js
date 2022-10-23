import { parentPort } from 'worker_threads'
import { FunctionParse } from "./FunctionSerializer.js";
parentPort.on('message', (postData) => {
    const parsedFunction = FunctionParse(postData.func);
    parentPort.postMessage(parsedFunction(...postData.arguments));
})