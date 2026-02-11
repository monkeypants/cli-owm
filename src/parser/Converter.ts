import {IProvideFeatureSwitches, WardleyMap} from './types/base';
import AcceleratorExtractionStrategy from './strategies/AcceleratorExtractionStrategy';
import AnchorExtractionStrategy from './strategies/AnchorExtractionStrategy';
import AnnotationExtractionStrategy from './strategies/AnnotationExtractionStrategy';
import AttitudeExtractionStrategy from './strategies/AttitudeExtractionStrategy';
import ComponentExtractionStrategy from './strategies/ComponentExtractionStrategy';
import EvolveExtractionStrategy from './strategies/EvolveExtractionStrategy';
import LinksExtractionStrategy from './strategies/LinksExtractionStrategy';
import NoteExtractionStrategy from './strategies/NoteExtractionStrategy';
import PipelineExtractionStrategy from './strategies/PipelineExtractionStrategy';
import PresentationExtractionStrategy from './strategies/PresentationExtractionStrategy';
import SubMapExtractionStrategy from './strategies/SubMapExtractionStrategy';
import TitleExtractionStrategy from './strategies/TitleExtractionStrategy';
import UrlExtractionStrategy from './strategies/UrlExtractionStrategy';
import XAxisLabelsExtractionStrategy from './strategies/XAxisLabelsExtractionStrategy';

export default class Converter {
    featureSwitches: IProvideFeatureSwitches;
    constructor(featureSwitches: IProvideFeatureSwitches) {
        this.featureSwitches = featureSwitches;
    }

    parse(data: string) {
        const t = this.stripComments(data);
        const strategies = [
            new TitleExtractionStrategy(t),
            new XAxisLabelsExtractionStrategy(t),
            new PresentationExtractionStrategy(t),
            new NoteExtractionStrategy(t),
            new AnnotationExtractionStrategy(t),
            new ComponentExtractionStrategy(t),
            new PipelineExtractionStrategy(t, this.featureSwitches),
            new EvolveExtractionStrategy(t),
            new AnchorExtractionStrategy(t),
            new LinksExtractionStrategy(t),
            new SubMapExtractionStrategy(t),
            new UrlExtractionStrategy(t),
            new AttitudeExtractionStrategy(t),
            new AcceleratorExtractionStrategy(t),
        ];
        const errorContainer = {errors: [] as any[]};

        const nullPresentation = {
            style: '',
            annotations: {visibility: 0, maturity: 0},
            size: {width: 0, height: 0},
        };
        let wardleyMap: WardleyMap = {
            links: [],
            anchors: [],
            evolved: [],
            pipelines: [],
            elements: [],
            annotations: [],
            notes: [],
            presentation: nullPresentation,
            evolution: [],
            submaps: [],
            urls: [],
            attitudes: [],
            accelerators: [],
            title: '',
            errors: [],
        };
        strategies.forEach(strategy => {
            const strategyResult = strategy.apply();
            wardleyMap = Object.assign(wardleyMap, strategyResult);
            if (strategyResult.errors && strategyResult.errors.length > 0)
                errorContainer.errors = errorContainer.errors.concat(strategyResult.errors);
        });
        return Object.assign(wardleyMap, errorContainer);
    }

    stripComments(data: string) {
        const doubleSlashRemoved = data.split('\n').map(line => {
            if (line.trim().indexOf('url') === 0) {
                return line;
            }
            return line.split('//')[0];
        });

        const lines = doubleSlashRemoved;
        const linesToKeep = [];
        let open = false;

        for (let i = 0; i < lines.length; i++) {
            const currentLine = lines[i];
            if (currentLine.indexOf('/*') > -1) {
                open = true;
                linesToKeep.push(currentLine.split('/*')[0].trim());
            } else if (open) {
                if (currentLine.indexOf('*/') > -1) {
                    open = false;
                    linesToKeep.push(currentLine.split('*/')[1].trim());
                }
            } else if (open === false) {
                linesToKeep.push(currentLine);
            }
        }

        return linesToKeep.join('\n');
    }
}
