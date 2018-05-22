import * as React from 'react';
import { Filters, Filter } from './filters/model';
import { TableProps, TableProvidedProps, Table } from './table/table';
import { ValueReducers, ValueReducerDescription } from './values/model';
import { Groups, Grouper } from './groups/model';
import { Selections } from './selections/model';
import { inferValues } from './values/infer-values';
import { defaultPlugins } from './plugins/default-plugins';

export interface Configuration<D> {
    data: D[];
    filters: Filters<D>;
    groups: Groups<D>;
    selections: Selections<D>;
    values: ValueReducers<D>;
    // filtersComponent: React.ComponentType<Pick<FiltersComponentProps<D>, Exclude<keyof FiltersComponentProps<D>, FiltersComponentProvidedProps>>>;
    tableComponent: React.ComponentType<Pick<TableProps<D>, Exclude<keyof TableProps<D>, TableProvidedProps>>>;
}

// export interface ConfigurationBuilder<D> {
//     withPlugin: <CB2 extends this>(plugin: (configurationBuilder: this) => CB2) => CB2;
//     withPluginV2: <Capabilties extends { [Key: string]: (builder: ConfigurationBuilder<D>) => (...parameters: any[]) => any }>(capabilities: Capabilties) => ;
//     withFilters: (filters: Filters<D>) => this;
//     withFilter: (filter: Filter<D>) => this;
//     withValues: (values: ValueReducers<D>) => this;
//     withValue: (value: ValueReducerDescription<D>) => this;
//     withGroups: (groups: Groups<D>) => this;
//     withGroup: (group: Grouper<D>) => this;
//     withSelections: (selections: Selections<D>) => this;
//     withSelection: (selection: Grouper<D>) => this;
//     build: () => Configuration<D>;
// }

// export type CapabilityFunction<D, CB1 extends ConfigurationBuilder<D>, C extends { [Key: string]: any[] }, K extends keyof C>
//     = (...parameters: C[K]) => ExtendedConfigurationBuilder<D, CB1, C>;

// export type ExtendedConfigurationBuilder<D, CB1 extends ConfigurationBuilder<D>, C extends { [Key: string]: (...parameters: any[]) => any }>
//     = CB1 & { [Key in keyof C]: CapabilityFunction<D, CB1, C, Key> };

// interface ConfigurationBuilderProperties<D> {
//     filters: Filters<D>;
//     groups: Groups<D>;
//     selections: Selections<D>;
//     values: ValueReducers<D>;
//     tableComponent: React.ComponentType<TableProps<D>>;
// }

// interface MyCoolCapabilities {
//     honk: () => void;
// }

// type WithCapabilities<Capabilties extends { [Key: string]: (...parameters: any[]) => any }> = {};

// export function configurationBuilder<D>(data: D[]): ConfigurationBuilder<D> {
//     const properties: ConfigurationBuilderProperties<D> = {
//         filters: [],
//         groups: [],
//         selections: [],
//         values: inferValues(),
//         tableComponent: Table
//     };

//     let builder: ConfigurationBuilder<D> = {
//         withPlugin: (plugin) => {
//             const newBuilder = plugin(builder);
//             builder = newBuilder;
//             return newBuilder;
//         },
//         withFilter: (filter) => {
//             properties.filters = [...properties.filters, filter];
//             return builder;
//         },
//         withFilters: (filters) => {
//             properties.filters = filters;
//             return builder;
//         },
//         withValues: (values: ValueReducers<D>) => {
//             properties.values = values;
//             return builder;
//         },
//         withValue: (value: ValueReducerDescription<D>) => {
//             properties.values = [...properties.values, value];
//             return builder;
//         },
//         withGroups: (groups: Groups<D>) => {
//             properties.groups = groups;
//             return builder;
//         },
//         withGroup: (group: Grouper<D>) => {
//             properties.groups = [...properties.groups, group];
//             return builder;
//         },
//         withSelections: (selections: Selections<D>) => {
//             properties.selections = selections;
//             return builder;
//         },
//         withSelection: (selection: Grouper<D>) => {
//             properties.selections = [...properties.selections, selection];
//             return builder;
//         },
//         build: () => {
//             return {
//                 data,
//                 filters: properties.filters,
//                 groups: properties.groups,
//                 selections: properties.selections,
//                 values: properties.values,
//                 tableComponent: properties.tableComponent
//             };
//         }
//     };

//     return builder;
// }

export function highOrderConfigurationBuilder<D, CB1 extends ConfigurationBuilder<D>>(configurationBuilder: CB1) {
    return Object.assign({}, configurationBuilder, {
        honk: () => console.log('HONK')
    });
}

export class ConfigurationBuilder<D> {
    data: D[];
    filters: Filters<D>;
    groups: Groups<D>;
    selections: Selections<D>;
    values: ValueReducers<D>;
    // filterComponent: React.ComponentType<FilterComponentProps<D[keyof D]>>;
    // andFilterComponent: React.ComponentType<AndFilterComponentProps<D[keyof D]>>;
    // notFilterComponent: React.ComponentType<NotFilterComponentProps<D[keyof D]>>;
    // equalsFilterComponent: React.ComponentType<EqualsFilterComponentProps<D[keyof D]>>;
    // filterDescriptionComponent: React.ComponentType<FilterDescriptionComponentProps<D, keyof D>>;
    // filtersComponent: React.ComponentType<FiltersComponentProps<D>>;
    tableComponent: React.ComponentType<TableProps<D>>;

    constructor(data: D[]) {
        this.data = data;
        this.filters = [];
        this.groups = [];
        this.selections = [];
        this.values = [];
        // this.filterComponent = FilterComponent;
        // this.andFilterComponent = AndFilterComponent;
        // this.notFilterComponent = NotFilterComponent;
        // this.equalsFilterComponent = EqualsFilterComponent;
        // this.filterDescriptionComponent = FilterDescriptionComponent;
        // this.filtersComponent = FiltersComponent;
        this.tableComponent = Table;

        return defaultPlugins.reduce((instance, plugin) => instance.withPlugin(plugin), this);
    }

    withPlugin<CB2 extends Partial<ConfigurationBuilder<D>>>(plugin: { new(previous: ConfigurationBuilder<D>): CB2 }): this & CB2 {
        // General hackery - not nice - welcome to JavaScript.
        const instance = new plugin(this) as any;
        const overrideMehods = new Set(Object.getOwnPropertyNames(plugin.prototype));
        const thisProto = Object.getPrototypeOf(this);
        const instanceProto = Object.getPrototypeOf(instance);
        const newProto = Object.assign(
            Object.create(Object.getPrototypeOf(instanceProto)),
            instanceProto
        );
        const that = this;
        for (const key of Object.keys(thisProto)) {
            if (!overrideMehods.has(key)) {
                newProto[key] = function (...args: any[]) {
                    if (key === 'withPlugin') {
                        return thisProto[key].apply(this, args);
                    } else {
                        thisProto[key].apply(that, args);
                        return this;
                    }
                };
            }
        }
        Object.setPrototypeOf(instance, newProto);
        return instance;
    }

    withFilter(filter: Filter<D>) {
        this.filters = [...this.filters, filter];
        return this;
    }

    withFilters(filters: Filters<D>) {
        this.filters = filters;
        return this;
    }

    // withFilter<F extends keyof D>(filter: FilterDescription<D, F>) {
    //     this.filters = [...this.filters, filter];
    //     return this;
    // }

    // withFilterComponent(filterComponent: React.ComponentType<FilterComponentProps<D[keyof D]>>) {
    //     this.filterComponent = filterComponent;
    //     return this;
    // }

    // withAndFilterComponent(andFilterComponent: React.ComponentType<AndFilterComponentProps<D[keyof D]>>) {
    //     this.andFilterComponent = andFilterComponent;
    //     return this;
    // }

    // withFilterDescriptionComponent(filterDescriptionComponent: React.ComponentType<FilterDescriptionComponentProps<D, keyof D>>) {
    //     this.filterDescriptionComponent = filterDescriptionComponent;
    //     return this;
    // }

    // withFiltersComponent(filtersComponent: React.ComponentType<FiltersComponentProps<D>>) {
    //     this.filtersComponent = filtersComponent;
    //     return this;
    // }

    withValues(values: ValueReducers<D>) {
        this.values = values;
        return this;
    }

    withValue(value: ValueReducerDescription<D>) {
        this.values = [...this.values, value];
        return this;
    }

    withGroups(groups: Groups<D>) {
        this.groups = groups;
        return this;
    }

    withGroup(group: Grouper<D>) {
        console.log(this);
        this.groups = [...this.groups, group];
        return this;
    }

    withSelections(selections: Selections<D>) {
        this.selections = selections;
        return this;
    }

    withSelection(selection: Grouper<D>) {
        this.selections = [...this.selections, selection];
        return this;
    }

    build(): Configuration<D> {
        // const filterComponentProvidedProps: { [Key: string]: React.ComponentType<any> } = {
        //     andFilterComponent: this.andFilterComponent,
        //     notFilterComponent: this.notFilterComponent,
        //     equalsFilterComponent: this.equalsFilterComponent
        // };

        // const specificFilterComponentProvidedProps = {
        //     filterComponent: providePropsComponentFactory(this.filterComponent, filterComponentProvidedProps)
        // };

        // for (const key of Object.keys(filterComponentProvidedProps)) {
        //     filterComponentProvidedProps[key] = providePropsComponentFactory(filterComponentProvidedProps[key], specificFilterComponentProvidedProps);
        // }

        return {
            data: this.data,
            filters: this.filters,
            groups: this.groups,
            selections: this.selections,
            values: this.values,
            // filtersComponent: providePropsComponentFactory(this.filtersComponent, {
            //     filterDescriptionComponent: providePropsComponentFactory(this.filterDescriptionComponent, {
            //         filterComponent: specificFilterComponentProvidedProps.filterComponent
            //     })
            // }),
            tableComponent: this.tableComponent
        };
    }
}