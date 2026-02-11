import {UnifiedConverter} from './parser/UnifiedConverter';
import {IProvideFeatureSwitches} from './parser/types/base';
import {UnifiedWardleyMap} from './parser/types/unified/map';

export {render} from './render';
export type {RenderOptions} from './render';
export type {UnifiedWardleyMap} from './parser/types/unified/map';
export type {MapTheme} from './themes';
export {themes, Plain, Wardley, Handwritten, Dark, Colour} from './themes';

const defaultFeatureSwitches: IProvideFeatureSwitches = {
    enableDashboard: false,
    enableNewPipelines: true,
    enableLinkContext: true,
    enableAccelerators: true,
    enableDoubleClickRename: false,
    showToggleFullscreen: false,
    showMapToolbar: false,
    showMiniMap: false,
    allowMapZoomMouseWheel: false,
    enableModernComponents: true,
};

export function parse(mapText: string): UnifiedWardleyMap {
    const converter = new UnifiedConverter(defaultFeatureSwitches);
    return converter.parse(mapText);
}
