import { getState, markup, textNode, setState } from '../../../dist/sling.min';
import FileService from '../services/file.service';

export class ResetDialogComponent {

    constructor() {
        this.fileService = new FileService();
        this.CSS_MODE_STANDARD = 0;
    }

    slAfterInit() {
        const root = document.getElementById('tryit-sling-reset');
        root.showModal();
    }

    onClose() {
        const root = document.getElementById('tryit-sling-reset');
        root.close();
    }

    onResetConfirmed() {
        const root = document.getElementById('tryit-sling-reset');
        root.close();

        localStorage.removeItem('tryitCount');
        localStorage.removeItem('height');
        localStorage.removeItem('filelist');
        localStorage.removeItem('cssmode');
        localStorage.removeItem('lowresolution');
        this.fileService.initializeFileList();

        const state = getState();

        state.setShowHelp(false);
        let mod = state.getHeightModifier();
        mod = 0;
        state.setHeightModifier(mod);
        state.setManualLowResolution(null);
        setState(state);

        let font = ' font: 400 13.3333px Arial;';

        if (state.getLowResolution()) {
            font = ' font: 400 20px Arial;';
        }

        this.showToast('Code Editor reset.', font);
    }

    showToast(message, font) {
        const toastContainer = document.getElementById('tryit-sling-toast');

        toastContainer.innerText = message;
        toastContainer.style.display = 'block';
        toastContainer.style.font = font;

        s.DETACHED_SET_TIMEOUT(() => {
            toastContainer.style.display = 'none';
        }, 4000);
    }

    view() {
        const state = getState();

        let font = ' font: 400 13.3333px Arial;';

        if (state.getLowResolution()) {
            font = ' font: 400 20px Arial;';
        }

        return markup('dialog', {
            attrs: {
                id: 'tryit-sling-reset',
                style: 'position: fixed; max-width: 75%; max-height: 75%; margin: auto auto;' + font
            },
            children: [
                markup('p', {
                    children: [
                        textNode('Are you sure you wish to delete all data? All code not saved to storage will be lost.')
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.onResetConfirmed.bind(this),
                        style: 'margin-bottom: 0.25rem; background-color: rgba(0,0,0,0.7); border: none; color: rgb(255, 255, 255); margin-right: 0.5rem; margin-top: 0.5rem; align-self: center; padding: 1px 6px;' + font
                    }, children: [
                        textNode('Confirm')
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.onClose.bind(this),
                        style: 'margin-bottom: 0.25rem; background-color: rgba(0,0,0,0.7); border: none; color: rgb(255, 255, 255); align-self: center; padding: 1px 6px;' + font
                    }, children: [
                        textNode('Close')
                    ]
                })
            ]
        })
    }
}

export default ResetDialogComponent;
