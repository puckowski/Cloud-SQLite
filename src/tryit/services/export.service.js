
class ExportService {

    constructor() {
    }

    downloadFile(filename, text) {
        const blob = new Blob([text], { type: 'text/html;charset=utf-8;' });

        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

export default ExportService;
