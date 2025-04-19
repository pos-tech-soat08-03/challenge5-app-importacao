import { v4 as uuidv4 } from 'uuid';
export class ProcessingConfigEntity {
    id;
    outputFormat;
    resolution;
    interval;
    constructor(outputFormat, resolution, interval, id) {
        this.outputFormat = outputFormat;
        this.resolution = resolution;
        this.interval = interval;
        if (!id) {
            id = uuidv4();
        }
        this.id = id;
    }
    getId() {
        return this.id;
    }
    getOutputFormat() {
        return this.outputFormat;
    }
    getResolution() {
        return this.resolution;
    }
    getInterval() {
        return this.interval;
    }
}
