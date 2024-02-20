import { getState } from "../../../dist/sling.min";

class FileService {

    constructor() {
        this.SLING_DEMO_HTML =
            '<html>\n' +
            '<body>\n' +
            '    <div id="divRouterOutlet"></div>\n' +
            '</body>\n' +
            '</html>';

        this.SLING_DEMO_CSS =
            '.visible {\n' +
            '    animation: fadein 800ms ease-in-out;\n' +
            '}\n\n' +
            '.hide {\n' +
            '    animation: fadeout 800ms ease-in-out;\n' +
            '}\n\n' +
            '@keyframes fadein {\n' +
            '    from {\n' +
            '        opacity: 0;\n' +
            '        transform: translateY(-3%);\n' +
            '    }\n\n' +
            '    to {\n' +
            '        opacity: 1;\n' +
            '        transform: translateY(0%);\n' +
            '    }\n' +
            '}\n\n' +
            '@keyframes fadeout {\n' +
            '    from {\n' +
            '        opacity: 1;\n' +
            '        transform: translateY(0%);\n' +
            '    }\n\n' +
            '    to {\n' +
            '        opacity: 0;\n' +
            '        transform: translateY(3%);\n' +
            '    }\n' +
            '}';

        this.SLING_DEMO_JAVASCRIPT =
            'import {\n' +
            '    textNode,\n' +
            '    markup,\n' +
            '    addRoute,\n' +
            '    route\n' +
            '} from "https://cdn.jsdelivr.net/npm/slingjs@19.0.1/sling.min.js";\n' +
            '\n' +
            'class HideComponent {\n' +
            '    hideWelcome() {\n' +
            '        route("show");\n' +
            '    }\n' +
            '\n' +
            '    slDetachedOnNodeDestroy(node) {\n' +
            '        return node;\n' +
            '    }\n' +
            '\n' +
            '    view() {\n' +
            '        return markup("div", {\n' +
            '            attrs: {\n' +
            '                id: "divRouterOutlet",\n' +
            '                class: "visible",\n' +
            '                style: "display: flex; justify-content: center; align-items: center; height: 100%;",\n' +
            '                slanimatedestroy: "hide",\n' +
            '                slanimatedestroytarget: this.slDetachedOnNodeDestroy.bind(this)\n' +
            '            },\n' +
            '            children: [\n' +
            '                markup("h1", {\n' +
            '                    children: [\n' +
            '                        textNode("Hello, world!"),\n' +
            '                        markup("button", {\n' +
            '                            attrs: {\n' +
            '                                onclick: this.hideWelcome.bind(this)\n' +
            '                            },\n' +
            '                            children: [textNode("Hide")]\n' +
            '                        })\n' +
            '                    ]\n' +
            '                })\n' +
            '            ]\n' +
            '        });\n' +
            '    }\n' +
            '}\n' +
            '\n' +
            'class ShowComponent {\n' +
            '    hideWelcome() {\n' +
            '        route("hide");\n' +
            '    }\n' +
            '\n' +
            '    slDetachedOnNodeDestroy(node) {\n' +
            '        return node;\n' +
            '    }\n' +
            '\n' +
            '    view() {\n' +
            '        return markup("div", {\n' +
            '            attrs: {\n' +
            '                id: "divRouterOutlet",\n' +
            '                class: "visible",\n' +
            '                style: "display: flex; justify-content: center; align-items: center; height: 100%;",\n' +
            '                slanimatedestroy: "hide",\n' +
            '                slanimatedestroytarget: this.slDetachedOnNodeDestroy.bind(this)\n' +
            '            },\n' +
            '            children: [\n' +
            '                markup("h1", {\n' +
            '                    children: [\n' +
            '                        markup("button", {\n' +
            '                            attrs: {\n' +
            '                                onclick: this.hideWelcome.bind(this)\n' +
            '                            },\n' +
            '                            children: [textNode("Show")]\n' +
            '                        })\n' +
            '                    ]\n' +
            '                })\n' +
            '            ]\n' +
            '        });\n' +
            '    }\n' +
            '}\n' +
            '\n' +
            'addRoute("hide", {\n' +
            '    component: new HideComponent(),\n' +
            '    root: "divRouterOutlet",\n' +
            '    animateDestroy: true\n' +
            '});\n' +
            'addRoute("show", {\n' +
            '    component: new ShowComponent(),\n' +
            '    root: "divRouterOutlet",\n' +
            '    animateDestroy: true\n' +
            '});\n' +
            '\n' +
            'route("hide");';

        this.fileListObject = 'filelist';
        this.initializeFileList();
        this.filesParam = 'files';
        this.modeParam = 'mode';
    }

    buildSlingDemo() {
        const fileList = this.getFileList();
        const length = fileList.length;
        this.addFile(this.SLING_DEMO_HTML, false, false);
        this.setFileName(length, 'Sling Demo HTML');
        this.addFile(this.SLING_DEMO_CSS, false, true);
        this.setFileName(length + 1, 'Sling Demo CSS');
        this.addFile(this.SLING_DEMO_JAVASCRIPT, true, false);
        this.setFileName(length + 2, 'Sling Demo JavaScript');
        return length;
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
