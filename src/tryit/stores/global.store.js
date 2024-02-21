import { BehaviorSubject } from '../../../dist/sling-reactive.min';
import FileService from '../services/file.service';

class StoreGlobal {
    constructor() {
        this.editIndex = 0;
        this.dataUpdated = BehaviorSubject(false);
        this.heightModifierObject = 'height';
        this.initializeHeightModifier();
        this.inlineHeight = '';
        this.collapsedMode = false;
        this.showPreview = false;
        this.version = '0.3';
        this.showHelp = false;
        this.sourceHasNewInput = BehaviorSubject(false);
        this.invalidScriptIndices = BehaviorSubject([]);
        this.hasHighlighted = BehaviorSubject(false);
        this.caretPositionToRestore = 0;
        this.preserveFocus = false;
        this.portraitMode = false;
        this.lowResolution = false;
        this.manualLowResolution = null;
        this.fileService = new FileService();
        this.dismissSuggestionSubject = BehaviorSubject(false);
        this.lowResolutionObject = 'lowresolution';
        this.initializeLowResolution();
        this.exportSqlSubject = BehaviorSubject(false);
        this.sqliteReadySubject = BehaviorSubject(false);
        this.clearResultsSubject = BehaviorSubject(false);
    }

    getClearResultsSubject() {
        return this.clearResultsSubject;
    }

    getSqliteReadySubject() {
        return this.sqliteReadySubject;
    }

    getSqliteReady() {
        return this.sqliteReadySubject.getData();
    }

    getExportSqlSubject() {
        return this.exportSqlSubject;
    }

    getDismissSuggestionSubject() {
        return this.dismissSuggestionSubject;
    }

    getLowResolution() {
        const isManualNormalResolution = this.manualLowResolution === false;

        if (isManualNormalResolution) {
            return false;
        } else {
            return this.lowResolution || this.manualLowResolution;
        }
    }

    setLowResolution(state) {
        this.lowResolution = state;
    }

    setManualLowResolution(state) {
        this.manualLowResolution = state;
        localStorage.setItem(this.lowResolutionObject, this.manualLowResolution);
    }

    getPortraitMode() {
        return this.portraitMode;
    }

    setPortraitMode(mode) {
        this.portraitMode = mode;
    }

    getHasHighlightedSubject() {
        return this.hasHighlighted;
    }

    setPreserveFocus(preserveState) {
        this.preserveFocus = preserveState;
    }

    getPreserveFocus() {
        return this.preserveFocus;
    }

    getCaretPositionToRestore() {
        return this.caretPositionToRestore;
    }

    setCaretPositionToRestore(position) {
        this.caretPositionToRestore = position;
    }

    getInvalidScriptIndexSubject() {
        return this.invalidScriptIndices;
    }

    getShowHelp() {
        return this.showHelp;
    }

    setShowHelp(helpState) {
        this.showHelp = helpState;
    }

    getVersion() {
        return this.version;
    }

    getShowPreview() {
        return this.showPreview;
    }

    setShowPreview(newShowPreview) {
        this.showPreview = newShowPreview;
    }

    getCollapsedMode() {
        return this.collapsedMode;
    }

    setCollapsedMode(newMode) {
        this.collapsedMode = newMode;
    }

    getInlineHeight() {
        return this.inlineHeight;
    }

    setInlineHeight(inlineHeight) {
        this.inlineHeight = inlineHeight;
    }

    getSourceHasNewInputSubject() {
        return this.sourceHasNewInput;
    }

    getDataSubject() {
        return this.dataUpdated;
    }

    getEditIndex() {
        return this.editIndex;
    }

    setEditIndex(newIndex) {
        const fileList = this.fileService.getFileList();
        const usedIndices = new Set(fileList.map(file => file.index));

        if (usedIndices.has(newIndex)) {
            this.editIndex = newIndex;
        } else {
            this.editIndex = 0;
        }
    }

    getHeightModifier() {
        return this.heightModifier;
    }

    setHeightModifier(newModifier) {
        this.heightModifier = newModifier;
        localStorage.setItem(this.heightModifierObject, this.heightModifier);
    }

    initializeHeightModifier() {
        const heightModifierStored = localStorage.getItem(this.heightModifierObject);

        if (heightModifierStored !== null) {
            this.heightModifier = parseInt(heightModifierStored);
        } else {
            this.heightModifier = 0;
        }
    }

    initializeLowResolution() {
        const lowResolutionStored = localStorage.getItem(this.lowResolutionObject);

        if (lowResolutionStored !== null) {
            this.manualLowResolution = lowResolutionStored === 'true';
        } else {
            this.manualLowResolution = null;
        }
    }
}

export default StoreGlobal;
