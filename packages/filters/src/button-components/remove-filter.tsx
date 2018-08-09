import * as React from 'react';

export interface RemoveFilterButtonProps {
    filterKey: string;
    onClick: () => void;
}

export class RemoveFilterButton extends React.Component<RemoveFilterButtonProps, never> {
    render() {
        return <button type="button" onClick={this.props.onClick}>
            Remove
        </button>;
    }
}
