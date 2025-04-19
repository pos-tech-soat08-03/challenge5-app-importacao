import { v4 as uuidv4 } from 'uuid';
export class VideoEntity {
    id;
    titulo;
    descricao;
    fileName;
    fileExtension;
    path;
    fileSize;
    encoding;
    duration; // in seconds
    fps;
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
            id = uuidv4();
        }
        this.id = id ?? uuidv4();
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
