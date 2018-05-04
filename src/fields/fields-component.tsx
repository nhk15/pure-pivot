import * as React from 'react';
import { Fields } from './model';
import { ObjectKeys } from '../util/keys';
import { FieldComponentProps } from './field-component';

export interface FieldsComponentProps<D extends { [Key in keyof D]: D[Key] }> {
    fields: Fields<D>;
    fieldComponent: React.ComponentType<FieldComponentProps<D>>;
}

export class FieldsComponent<D extends { [Key in keyof D]: D[Key] }> extends React.Component<FieldsComponentProps<D>, never> {
    render() {
        return <ul>
            {ObjectKeys(this.props.fields).map((key) =>
                <this.props.fieldComponent key={key} field={this.props.fields[key]} fieldName={key} />
            )}
        </ul>;
    }
}
