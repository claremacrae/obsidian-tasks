import * as TasksFunctionsJS from '../TasksFunctionsJS.js';
import * as TasksFunctionsTS from '../TasksFunctionsTS.ts';

export async function invoke(app) {
    console.log('In invoke()');
    window.TasksFunctionsJS = TasksFunctionsJS;
    window.TasksFunctionsTS = TasksFunctionsTS;
}

export async function cleanup(app) {
    console.log('In cleanup()');
    delete window.TasksFunctionsJS;
    delete window.TasksFunctionsTS;
}
