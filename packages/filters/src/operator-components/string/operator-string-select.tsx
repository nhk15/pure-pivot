import * as React from 'react';
import { StringOperators } from '../../model';
import { OperatorSelect, Option } from '../../operator-select';
import { StringInputProps } from './string-input';

const options: Option<StringOperators['type']>[] = [
    { value: 'string-equals', label: '=' },
    { value: 'string-not-equals', label: '!=' },
    { value: 'string-contains', label: 'contains' },
    { value: 'is-empty', label: 'is empty' },
    { value: 'is-not-empty', label: 'is not empty' }
];

export interface OperatorStringSelectProps {
    operator: StringOperators;
    onOperatorChange: (operator: StringOperators) => void;
    stringInputComponent: React.ComponentType<StringInputProps>;
}

export type OperatorStringSelectProvidedProps = 'stringInputComponent';

export class OperatorStringSelect extends React.PureComponent<OperatorStringSelectProps, never> {
    renderInputComponent() {
        if (this.props.operator.type !== 'is-empty' && this.props.operator.type !== 'is-not-empty') {
            return <this.props.stringInputComponent
                operator={this.props.operator}
                onOperatorChange={this.props.onOperatorChange}
            />;
        }
    }

    render() {
        return <React.Fragment>
            <OperatorSelect
                value={this.props.operator.type}
                options={options}
                onOptionChange={(type: StringOperators['type']) => {
                    this.props.onOperatorChange({ type, value: this.props.operator.value } as StringOperators);
                }}
            />
            {this.renderInputComponent()}
        </React.Fragment>;
    }
}
