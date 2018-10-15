import { ValueReducers } from './values/model';
import { Groups } from './groups/model';
import { applyGrouping, Grouping, RecursiveGroup } from './groups/apply-grouping';
import { applyFilters } from './filters/apply-filter';
import { Comparators, SortingGroup } from './sorting/model';
import { applySorting } from './sorting/apply-sorting';
import { Configuration } from './configuration';
import { GroupDescriptor, DataColumnDescriptor, GroupColumnDescriptor, GroupHeaderRow, ValueHeaderRow, BodyRow, TableDescription, BodyCell, HeadColumnDescriptor } from './table/model';
import { defaultGenerateTableDescriptionPlugins } from './plugins/default-plugins';

function createColumnDescriptors<D>(recursiveColumns: RecursiveGroup[], values: ValueReducers<D>, groupDescriptors: GroupDescriptor[] = []): { dataColumns: DataColumnDescriptor<D, {}>[], groupColumns: GroupColumnDescriptor[] } {
    const dataColumns: DataColumnDescriptor<D, {}>[] = [];
    const groupColumns: GroupColumnDescriptor[] = [];

    for (const column of recursiveColumns) {
        const childGroupDescriptors = [
            ...groupDescriptors,
            {
                groupId: column.groupId,
                groupIndex: column.groupIndex
            }
        ];
        groupColumns.push({
            type: 'group-column',
            label: column.label,
            subColumnSize: column.subGroupCount,
            groupDescriptors: childGroupDescriptors
        });
        if (column.childGroups) {
            const childColumns = createColumnDescriptors(column.childGroups, values, childGroupDescriptors);
            for (const childDataColumn of childColumns.dataColumns) {
                dataColumns.push(childDataColumn);
            }
            for (const childGroupColumn of childColumns.groupColumns) {
                groupColumns.push(childGroupColumn);
            }
        } else {
            for (const valueDescription of values) {
                dataColumns.push({
                    type: 'data-column',
                    groupDescriptors: childGroupDescriptors,
                    valueDescription
                });
            }
        }
    }

    return { dataColumns, groupColumns };
}

function createGroupHeaderRows<D>(groupColumns: GroupColumnDescriptor[], groups: Groups<D>): GroupHeaderRow[] {
    const rows: GroupHeaderRow[] = [];
    for (let i = 0; i < groups.length; i++) {
        rows.push({
            type: 'group-header-row',
            groupId: groups[i].id,
            groupLabel: groups[i].label,
            level: i,
            groups: []
        });
    }
    for (const column of groupColumns) {
        rows[column.groupDescriptors.length - 1].groups.push(column);
    }
    return rows;
}

function createValueHeaderRow<D>(dataColumns: DataColumnDescriptor<D, {}>[]): ValueHeaderRow<D> {
    return {
        type: 'value-header-row',
        dataColumns
    };
}

function createBodyRows<D>(recursiveRows: RecursiveGroup[], sortedIndices: number[], columns: Grouping, dataColumns: DataColumnDescriptor<D, {}>[], data: D[], values: ValueReducers<D>, sorting: Comparators<D>, level: number = 0, accumulator: BodyRow<D>[] = []): BodyRow<D>[] {
    const rowsWithData: SortingGroup<D>[] = recursiveRows.map((rows) => {
        const rowIndices: number[] = [];
        for (let i = rows.dataIndexStart; i < rows.dataIndexEnd; i++) {
            rowIndices.push(sortedIndices[i]);
        }

        const indicesByGroup = columns.groupDataIndices(rows.dataIndexStart, rows.dataIndexEnd);
        const cells: BodyCell<D, {}>[] = [];
        for (let i = 0; i < indicesByGroup.length; i++) {
            const groupData = indicesByGroup[i].map((index) => data[index]);
            for (let j = 0; j < values.length; j++) {
                const column = dataColumns[i * values.length + j];
                cells.push({
                    data: groupData,
                    value: column.valueDescription.reducer(groupData),
                    column
                });
            }
        }

        return {
            ...rows,
            rowData: rowIndices.map((index) => data[index]),
            cells
        };
    });

    if (sorting.length >= 1) {
        rowsWithData.sort((rows1, rows2) => {
            return applySorting(sorting, rows1, rows2);
        });
    }

    for (let i = 0; i < rowsWithData.length; i++) {
        const rows = rowsWithData[i];
        accumulator.push({
            type: 'body-row',
            level,
            label: rows.label,
            cells: rows.cells,
            index: i
        });

        if (rows.childGroups) {
            createBodyRows(rows.childGroups, sortedIndices, columns, dataColumns, data, values, sorting, level + 1, accumulator);
        }
    }

    return accumulator;
}

export const generateTableDescription = defaultGenerateTableDescriptionPlugins.reduce((generateTableDescription, plugin) => plugin(generateTableDescription), <D>(configuration: Configuration<D>, data: D[], bodySelectedRow?: BodyRow<D>): TableDescription<D> => {
    const filteredData = applyFilters(configuration.filters, data);
    const columns = applyGrouping(configuration.groups, filteredData);
    const rows = applyGrouping(configuration.selections, filteredData);

    const columnDescriptors = createColumnDescriptors(columns.recursiveGroups, configuration.values);
    const valueHeaderRow = createValueHeaderRow(columnDescriptors.dataColumns);
    const groupHeaderRows = createGroupHeaderRows(columnDescriptors.groupColumns, configuration.groups);
    const sorting = configuration.sorting.map((sorter) => sorter(valueHeaderRow.dataColumns));
    const bodyRows = createBodyRows(rows.recursiveGroups, rows.sortedIndices, columns, columnDescriptors.dataColumns, filteredData, configuration.values, sorting);
    const headColumns: HeadColumnDescriptor[] = configuration.headColumn ? [{ type: 'head-column', id: 'head' }] : [];

    return {
        headColumnCount: headColumns.length,
        bodyColumnCount: valueHeaderRow.dataColumns.length,
        columnCount: headColumns.length + valueHeaderRow.dataColumns.length,
        headRowCount: 1 + groupHeaderRows.length,
        bodyRowCount: bodyRows.length,
        rowCount: 1 + groupHeaderRows.length + bodyRows.length,
        valueCount: configuration.values.length,
        values: configuration.values,
        headGroupRows: groupHeaderRows,
        headValueRow: valueHeaderRow,
        columns: [...headColumns, ...columnDescriptors.dataColumns],
        bodyRows,
        bodySelectedRow
    };
});
