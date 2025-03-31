"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessingConfigEntity = void 0;
const uuid_1 = require("uuid");
class ProcessingConfigEntity {
    id;
    outputFormat;
    resolution;
    interval;
    constructor(outputFormat, resolution, interval, id) {
        this.outputFormat = outputFormat;
        this.resolution = resolution;
        this.interval = interval;
        if (!id) {
            id = (0, uuid_1.v4)();
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
exports.ProcessingConfigEntity = ProcessingConfigEntity;
