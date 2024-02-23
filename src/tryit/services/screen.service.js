import { detectChanges, getState, setState } from "../../../dist/sling.min";

class ScreenService {

    constructor() {
        this.COLLAPSED_MODE_WIDTH = 768;
        this.LOW_RESOLUTION_AREA = 1152000;
        this.NORMAL_DPI_PRODUCT = 100;//9216;
        this.lastWindowWidth = null;
    }

    onWindowResize() {
        if (this.lastWindowWidth === window.outerWidth) {
            return;
        }

        const state = getState();


        this.lastWindowWidth = window.outerWidth;

        const resolution = window.outerHeight * window.outerWidth;

        const devicePixelRatio = window.devicePixelRatio || 1;
        const dpiX = document.getElementById('tryit-dpi').offsetWidth * devicePixelRatio;
        const dpiY = document.getElementById('tryit-dpi').offsetHeight * devicePixelRatio;
        const dpiProduct = dpiX * dpiY;

        if (resolution <= this.LOW_RESOLUTION_AREA && dpiProduct > this.NORMAL_DPI_PRODUCT) {
            state.setLowResolution(true);
        } else {
            state.setLowResolution(false);
        }

        if (window.outerWidth < window.outerHeight) {
            state.setPortraitMode(true);
            state.setCollapsedMode(false);
        } else if (window.outerWidth <= this.COLLAPSED_MODE_WIDTH) {
            state.setCollapsedMode(true);
            state.setPortraitMode(false);
        } else {
            state.setCollapsedMode(false);
            state.setPortraitMode(false);
        }

        setTimeout(() => {
            state.getDataSubject().next(true);
        }, 0);

        setState(state);
        detectChanges();
    }

    addResizeListener() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.onWindowResize();
    }
}

export default ScreenService;
