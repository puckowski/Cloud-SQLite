import { detectChanges, getState, markup, setState, textNode } from '../../../dist/sling.min';
import { getCaretCoordinates, getCaretPosition } from '../services/caret.service';
import FileService from '../services/file.service';
import { debounce } from '../services/throttle.service';

export class WordSuggestionComponent {

    constructor() {
        this.JAVASCRIPT_RESERVED_WORD_LIST = ['abstract', 'arguments', 'await', 'boolean', 'break', 'byte', 'case', 'catch',
            'char', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'double', 'else',
            'enum', 'eval', 'export', 'extends', 'false', 'final', 'finally', 'float', 'for', 'function',
            'goto', 'if', 'implements', 'import', 'in', 'instanceof', 'int', 'interface', 'let', 'long',
            'native', 'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'short', 'static',
            'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'try', 'typeof',
            'var', 'void', 'volatile', 'while', 'with', 'yield'];
        this.HTML_TAG_NAMES = ['!DOCTYPE', 'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi',
            'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist',
            'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer',
            'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'legend',
            'li', 'link', 'main', 'map', 'mark', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output',
            'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small',
            'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'svg', 'table', 'tbody', 'td', 'template', 'textarea',
            'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr']
        this.fileService = new FileService();
        this.debounce = debounce;
        this.WORD_SUGGESTION_THROTTLE_MILLISECONDS = 300;
        this.selectionText = null;
        this.occurrence = -1;
        this.x = -1;
        this.y = -1;
        this.suggestion = '';
        this.input = '';
        this.newInput = false;
        this.scrollY = 0;
        this.onSourceHasNewInput = () => {
            this.newInput = true;
        };
        this.processSourceHasNewInput = this.debounce(() => this.onSourceHasNewInput(), this.WORD_SUGGESTION_THROTTLE_MILLISECONDS);
        this.CHECK_DIRTY_INTERVAL = 300;
        this.onDataChanged = () => {
            this.suggestion = '';
            this.input = '';
        }
        this.onSuggestionDismiss = () => {
            this.suggestion = '';
            detectChanges();
        }
    }

    slOnInit() {
        const state = getState();
        const sub = state.getSourceHasNewInputSubject();
        if (!sub.getHasSubscription(this.processSourceHasNewInput)) {
            sub.subscribe(this.processSourceHasNewInput);
        }

        const dataSub = state.getDataSubject();
        if (!dataSub.getHasSubscription(this.onDataChanged)) {
            dataSub.subscribe(this.onDataChanged);
        }

        const dismissSubject = state.getDismissSuggestionSubject();
        if (!dismissSubject.getHasSubscription(this.onSuggestionDismiss)) {
            dismissSubject.subscribe(this.onSuggestionDismiss);
        }

        s.DETACHED_SET_INTERVAL(() => {
            if (this.newInput) {
                const textAreaEle = document.getElementById('tryit-sling-div');
                const selectionEnd = getCaretPosition(textAreaEle);
                if (textAreaEle && selectionEnd >= 16) {
                    this.selectionText = textAreaEle.textContent.slice(selectionEnd - 16, selectionEnd);
                    this.occurrence = this.countOccurrences(textAreaEle.textContent, this.selectionText);

                    const state = getState();
                    const fileIndex = state.getEditIndex();
                    const fileData = this.fileService.getFileData(fileIndex);

                    const selectionIndices = this.getIndicesOf(this.selectionText, fileData, true);
                    const index = selectionIndices[this.occurrence - 1];

                    let after = fileData.substring(index);
                    after = after.substring(0, this.selectionText.length);

                    if (after && after.includes('<')) {
                        this.input = after.substring(after.lastIndexOf('<') + 1);
                        this.input = this.input.trim();

                        if (this.input.includes(' ')) {
                            this.input = after.substring(after.lastIndexOf(' ') + 1);
                            this.input = this.input.trim();
                        }

                        if (this.input.includes('\n')) {
                            this.input = after.substring(after.lastIndexOf('\n') + 1);
                            this.input = this.input.trim();
                        }

                        this.determineSuggestionIfPossible(fileData, index, textAreaEle);
                    } else if (after && after.includes(' ')) {
                        this.input = after.substring(after.lastIndexOf(' ') + 1);
                        this.input = this.input.trim();

                        if (this.input.includes('\n')) {
                            this.input = after.substring(after.lastIndexOf('\n') + 1);
                            this.input = this.input.trim();
                        }

                        this.determineSuggestionIfPossible(fileData, index, textAreaEle);
                    } else if (after && after.includes('\n')) {
                        this.input = after.substring(after.lastIndexOf('\n') + 1);
                        this.input = this.input.trim();

                        this.determineSuggestionIfPossible(fileData, index, textAreaEle);
                    } else {
                        this.suggestion = null;
                        detectChanges();
                    }
                }

                this.newInput = false;
            }
        }, this.CHECK_DIRTY_INTERVAL);

        document.addEventListener('keydown', this.onDocumentKeyDown.bind(this));
    }

    slAfterInit() {
        this.attachScrollListener();
    }

    getTextWidth(text, font) {
        const canvas = this.getTextWidth.canvas || (this.getTextWidth.canvas = document.createElement("canvas"));
        const context = canvas.getContext("2d");
        context.font = font;
        const metrics = context.measureText(text);
        return metrics.width;
    }

    attachScrollListener() {
        const slingTextArea = document.getElementById('tryit-sling-div');
        if (slingTextArea) {
            slingTextArea.addEventListener("scroll", function (textArea, event) {
                this.updateScrollY(textArea);
            }.bind(this, slingTextArea), false);
        }
    }

    updateScrollY(textArea) {
        this.scrollY = textArea.scrollTop;

        const state = getState();
        state.getDismissSuggestionSubject().next(true);
        setState(state);
    }

    determineSuggestionIfPossible(fileData, index, textAreaEle) {
        if (this.input.startsWith('{')) {
            this.input = this.input.substring(this.input.indexOf('{') + 1);
            this.input = this.input.trim();
        }

        if (this.input && this.input.length > 0) {
            const freqMap = this.buildWordFrequencyMap(fileData);

            let suggestionRank = 0;

            for (const key of Object.keys(freqMap)) {
                if (key.startsWith(this.input) && key !== this.input && freqMap[key] > suggestionRank) {
                    suggestionRank = freqMap[key];
                    this.suggestion = key;
                }
            }

            if (this.suggestion && this.suggestion.length > 0) {
                if (this.suggestion === this.input) {
                    this.suggestion = null;
                    detectChanges();
                } else {
                    const currentPos = getCaretPosition(textAreaEle);
                    const caret = getCaretCoordinates(textAreaEle, currentPos);

                    if (caret) {
                        const lineHeight = this.getLineHeight(textAreaEle);

                        this.x = caret.left;

                        const state = getState();
                        let font = '400 13.3333px Arial';

                        if (state.getLowResolution()) {
                            font = '400 26px Arial';
                        }

                        const textWidth = this.getTextWidth(this.suggestion, font);

                        if (this.x + textWidth > window.outerWidth) {
                            this.x -= textWidth;
                            this.x -= this.convertRemToPixels(0.5);
                        }

                        this.y = caret.top - lineHeight - this.convertRemToPixels(0.5);

                        if (textAreaEle.scrollTop > 0) {
                            this.y -= textAreaEle.scrollTop;
                        }

                        detectChanges();
                    }
                }
            }
        }
    }

    convertRemToPixels(rem) {
        return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }

    getLineHeight(el) {
        const temp = document.createElement(el.nodeName);
        let ret;
        temp.setAttribute('style', 'margin:0; padding:0; '
            + 'font-family:' + (el.style.fontFamily || 'inherit') + '; '
            + 'font-size:' + (el.style.fontSize || 'inherit'));
        temp.innerHTML = 'A';

        el.parentNode.appendChild(temp);
        ret = temp.clientHeight;
        temp.parentNode.removeChild(temp);

        return ret;
    }

    buildWordFrequencyMap(string) {
        let words = [];
        let word = '';

        for (let i = 0; i < string.length; ++i) {
            if (string[i] !== '\n' && string[i] !== ' ' && string[i] !== '(' && string[i] !== '{' && string[i] !== ';') {
                word += string[i];
            } else if (word.length > 0) {
                const trimmed = word.trim();
                if (trimmed.length > 0) {
                    words.push(trimmed);
                }
                word = '';
            }
        }

        words = words.concat(this.JAVASCRIPT_RESERVED_WORD_LIST);
        words = words.concat(this.HTML_TAG_NAMES);

        const freqMap = {};
        words.forEach(function (w) {
            if (w === 'constructor') {
                let data = '' + freqMap[w];

                if (!data) {
                    freqMap[w] = 1;
                } else if (typeof data === 'string' && data.includes('}')) {
                    data = data.substring(data.lastIndexOf('}') + 1).trim();
                    const newVal = Number(data) + 1;
                    freqMap[w] = newVal;
                } else {
                    freqMap[w] += 1;
                }
            } else {
                if (!freqMap[w]) {
                    freqMap[w] = 0;
                }
                freqMap[w] += 1;
            }
        });

        return freqMap;
    }

    countOccurrences(string, subString, allowOverlapping = false) {
        string += "";
        subString += "";
        if (subString.length <= 0) return (string.length + 1);

        var n = 0,
            pos = 0,
            step = allowOverlapping ? 1 : subString.length;

        while (true) {
            pos = string.indexOf(subString, pos);
            if (pos >= 0) {
                ++n;
                pos += step;
            } else break;
        }
        return n;
    }

    getIndicesOf(searchStr, str, caseSensitive) {
        const searchStrLen = searchStr.length;
        if (searchStrLen == 0) {
            return [];
        }
        let startIndex = 0, index, indices = [];
        if (!caseSensitive) {
            str = str.toLowerCase();
            searchStr = searchStr.toLowerCase();
        }
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices.push(index);
            startIndex = index + searchStrLen;
        }
        return indices;
    }

    onDocumentKeyDown(event) {
        if (event && event.keyCode === 9) {
            event.preventDefault();
            this.insertTab();
        } else if (this.suggestion && this.suggestion.length > 0 && this.input && this.input.length > 0) {
            if (event && (event.ctrlKey || event.metaKey) && event.keyCode === 65) {
                event.preventDefault();
                this.insertSuggestion();
            }
        }
    }

    insertTab() {
        const state = getState();
        const fileIndex = state.getEditIndex();
        const fileData = this.fileService.getFileData(fileIndex);

        const textAreaEle = document.getElementById('tryit-sling-div');
        const selectionEnd = getCaretPosition(textAreaEle);

        let before = fileData.substring(0, selectionEnd);
        let charsInserted = 4;

        let after = fileData.substring(selectionEnd);
        if (after === '' && before.endsWith('\n')) {
            before = before.substring(0, before.length - 1);
            charsInserted--;
        }
        
        after = '    ' + after;

        this.fileService.updateFileData(fileIndex, before + after);
        state.setCaretPositionToRestore(selectionEnd + charsInserted);

        this.suggestion = null;
        this.input = null;

        const sub = state.getDataSubject();
        sub.next(true);
    }

    insertSuggestion() {
        const state = getState();
        const fileIndex = state.getEditIndex();
        const fileData = this.fileService.getFileData(fileIndex);

        const textAreaEle = document.getElementById('tryit-sling-div');
        const selectionEnd = getCaretPosition(textAreaEle);

        let before = fileData.substring(0, selectionEnd);
        const inputLocation = before.lastIndexOf(this.input);
        if (inputLocation >= 0) {
            const beforeInput = before.substring(0, inputLocation);
            const afterInput = before.substring(inputLocation + this.input.length);
            before = beforeInput + afterInput;
        }

        let after = fileData.substring(selectionEnd);
        after = this.suggestion + after;

        this.fileService.updateFileData(fileIndex, before + after);
        state.setCaretPositionToRestore(selectionEnd + (this.suggestion.length - this.input.length));

        this.suggestion = null;
        this.input = null;

        const sub = state.getDataSubject();
        sub.next(true);
    }

    view() {
        const state = getState();

        let font = ' font: 400 13.3333px Arial;';

        if (state.getLowResolution()) {
            font = ' font: 400 26px Arial;';
        }

        let leftAndTopAndDisplay = 'left: ' + this.x + 'px; top: ' + this.y + 'px;';

        if (!this.suggestion || this.suggestion.length === 0) {
            leftAndTopAndDisplay += ' display: none;';
        }

        return markup('div', {
            attrs: {
                id: 'tryit-sling-suggestion',
                style: leftAndTopAndDisplay + 'position: fixed; padding: 0.25rem; background-color: rgb(60, 68, 83); color: rgb(204, 204, 204); z-index: 1000;' + font,
                onclick: this.insertSuggestion.bind(this)
            },
            children: [
                textNode(this.suggestion)
            ]
        });
    }
}

export default WordSuggestionComponent;
