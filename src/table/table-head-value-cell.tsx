import * as React from 'react';
import { TableDescription, ColumnDescriptor, ValueHeaderRow } from './model';

export interface TableHeadValueCellProps<D> {
    scope: 'row' | 'col';
    colStart: number;
    id: string;
    row: ValueHeaderRow<D>;
    column: ColumnDescriptor<D>;
    tableDescription: TableDescription<D>;
}

export class TableHeadValueCell<D> extends React.Component<TableHeadValueCellProps<D>, never> {
    render() {
        const { colStart, tableDescription, id, row, column, ...other } = this.props;
        return <th {...other} />;
    }
}
