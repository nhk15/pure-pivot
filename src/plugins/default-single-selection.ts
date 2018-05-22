import { ConfigurationBuilder, Configuration } from '../configuration';
import { Filter } from '../filters/model';

export class DefaultSingleSelection<D> {
    private previous: ConfigurationBuilder<D>;

    constructor(previous: ConfigurationBuilder<D>) {
        this.previous = previous;
    }

    build(): Configuration<D> {
        const result = this.previous.build();

        if (result.selections.length <= 0) {
            result.selections = [{
                id: 'pure-pivot-default-selection',
                label: 'Identity',
                grouper: (data) => {
                    const dataIndices: number[] = [];

                    for (let i = 0; i < data.length; i++) {
                        dataIndices.push(i);
                    }

                    return {
                        groupIndices: dataIndices,
                        groupLabels: dataIndices.map((index) => (index + 1).toString())
                    };
                }
            }];
        }

        return result;
    }
}