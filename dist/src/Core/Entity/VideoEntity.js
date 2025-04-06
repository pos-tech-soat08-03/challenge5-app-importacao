"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoEntity = void 0;
const uuid_1 = require("uuid");
class VideoEntity {
    constructor(titulo, descricao, fileName, fileExtension, path, fileSize, encoding, duration, fps, id) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.fileName = fileName;
        this.fileExtension = fileExtension;
        this.path = path;
        this.fileSize = fileSize;
        this.encoding = encoding;
        this.duration = duration;
        this.fps = fps;
        if (!id) {
            id = (0, uuid_1.v4)();
        }
        this.id = id !== null && id !== void 0 ? id : (0, uuid_1.v4)();
    }
    getId() {
        return this.id;
    }
    getTitulo() {
        return this.titulo;
    }
    getDescricao() {
        return this.descricao;
    }
    getFileName() {
        return this.fileName;
    }
    getFileExtension() {
        return this.fileExtension;
    }
    getPath() {
        return this.path;
    }
    getFileSize() {
        return this.fileSize;
    }
    getEncoding() {
        return this.encoding;
    }
    getDuration() {
        return this.duration;
    }
    getFps() {
        return this.fps;
    }
}
exports.VideoEntity = VideoEntity;
