import { getState } from "../../../dist/sling.min";

class FileService {

    constructor() {
        this.CLOUD_SQLITE_SAMPLE = 
        'CREATE TABLE IF NOT EXISTS users (\n' +
        '    user_id INTEGER PRIMARY KEY,\n' +
        '    username TEXT NOT NULL,\n' +
        '    email TEXT NOT NULL UNIQUE,\n' +
        '    password TEXT NOT NULL\n' +
        ');\n' +
        '\n' +
        'INSERT OR IGNORE INTO users (user_id, username, email, password) VALUES (1, \'bob\', \'bob@example.com\', \'qwerty\');\n' +
        'INSERT OR IGNORE INTO users (user_id, username, email, password) VALUES (2, \'frank\', \'frank@example.com\', \'123456\');\n' +
        '\n' +
        'SELECT * FROM users;\n' +
        '\n' +
        'CREATE VIEW IF NOT EXISTS active_users AS\n' +
        'SELECT user_id, username, email FROM users WHERE password <> \'\';\n' +
        '\n' +
        'CREATE TABLE IF NOT EXISTS addresses (\n' +
        '    line1 TEXT NOT NULL,\n' +
        '    line2 TEXT NULL\n' +
        ');\n';

        this.fileListObject = 'filelist';
        this.initializeFileList();
        this.filesParam = 'files';
        this.modeParam = 'mode';
    }

    buildDemo() {
        let fileData = this.getFileData(0);
        if (fileData === '\n') {
            fileData = '';
        }
        fileData += this.CLOUD_SQLITE_SAMPLE;
        this.updateFileData(0, fileData);
    }

    getFile(index) {
        const fileList = this.getFileList();
        return fileList.find(file => file.index === index);
    }

    getFileData(index) {
        const fileList = this.getFileList();
        const file = fileList.find(file => file.index === index);

        if (file) {
            return file.data;
        }

        return '';
    }

    getFileList() {
        const data = localStorage.getItem(this.fileListObject);
        return JSON.parse(data);
    }

    addFile(data = null, injectScript = false, injectCss = false) {
        const fileList = this.getFileList();

        let nextFree = 0;
        const usedIndices = new Set(fileList.map(file => file.index));
        while (usedIndices.has(nextFree)) {
            nextFree++;
        }

        const fileObj = this.getFileObject(nextFree);

        if (data !== null && data !== undefined) {
            fileObj.data = data;
            fileObj.injectScript = injectScript;
            fileObj.injectCss = injectCss;
        }

        fileList.push(fileObj);
        this.setFileList(fileList);
    }

    removeFile(index) {
        let fileList = this.getFileList();
        fileList = fileList.filter(file => file.index !== index);
        this.setFileList(fileList);
    }

    updateFileData(index, data) {
        const fileList = this.getFileList();
        const file = fileList.find(file => file.index === index);
        if (file) file.data = data;
        this.setFileList(fileList);

        const state = getState();
        const sourceSubject = state.getSourceHasNewInputSubject();
        sourceSubject.next(true);
    }

    updateFileInject(index, value = null) {
        const fileList = this.getFileList();
        const file = fileList.find(file => file.index === index);
        if (file) {
            file.injectScript = !file.injectScript;

            if (file.injectScript) {
                file.injectCss = false;
            }
        }
        this.setFileList(fileList);
    }

    updateFileInjectCss(index, value = null) {
        const fileList = this.getFileList();
        const file = fileList.find(file => file.index === index);
        if (file) {
            file.injectCss = !file.injectCss;

            if (file.injectCss) {
                file.injectScript = false;
            }
        }
        this.setFileList(fileList);
    }

    setFileName(index, name) {
        const fileList = this.getFileList();
        const file = fileList.find(file => file.index === index);
        if (file) file.name = name;
        this.setFileList(fileList);
    }

    setFileList(fileList) {
        localStorage.setItem(this.fileListObject, JSON.stringify(fileList));
    }

    getFileObject(fileCount) {
        return {
            name: '',
            index: fileCount,
            data: '',
            injectScript: false,
            injectCss: false
        };
    }

    initializeFileList() {
        const fileList = localStorage.getItem(this.fileListObject);

        if (fileList == null || fileList == undefined) {
            this.setFileList([this.getFileObject(0)]);
        } else {
            const data = JSON.parse(fileList);

            if (!Array.isArray(data) || data.length === 0) {
                this.setFileList([this.getFileObject(0)]);
            }
        }
    }

    setCssModeFromUrl() {
        const url = new URL(window.location.href);

        if (url.searchParams.has(this.modeParam)) {
            const modeParam = decodeURIComponent(atob(url.searchParams.get(this.modeParam)));
            const cssModeParam = parseInt(modeParam);

            const state = getState();
            state.setCssMode(cssModeParam);
        }
    }
}

export default FileService;
