import { mount, setState } from "../dist/sling.min";
import TryitEditorComponent from "./tryit/components/tryit-editor.component";
import ScreenService from "./tryit/services/screen.service";
import StoreGlobal from "./tryit/stores/global.store";

const storeGlobal = new StoreGlobal();
setState(storeGlobal);

const screenService = new ScreenService();
screenService.addResizeListener();

mount('tryit-root', new TryitEditorComponent());
