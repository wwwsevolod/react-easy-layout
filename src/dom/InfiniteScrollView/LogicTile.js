import React, {Component, PropTypes, Children, cloneElement} from 'react';

export default class LogicTile extends Component {
    static propTypes = {
        fromIndex: PropTypes.number.isRequired,
        toIndex: PropTypes.number.isRequired,
        renderRow: PropTypes.func.isRequired,
        shouldUpdateRow: PropTypes.func,
        customHeights: PropTypes.objectOf(PropTypes.number).isRequired,
        rowHeight: PropTypes.number.isRequired
    };

    shouldComponentUpdate(nextProps) {
        if (
            nextProps.toIndex !== this.props.toIndex
            || nextProps.fromIndex !== this.props.fromIndex
            || nextProps.rowHeight !== this.props.rowHeight
        ) {
            return true;
        }

        if (nextProps.shouldUpdateRow) {
            for (var index = nextProps.fromIndex; index < nextProps.toIndex; index++) { // eslint-disable-line no-var
                if (nextProps.customHeights[index] !== this.props.customHeights[index]) {
                    return true;
                }

                if (nextProps.shouldUpdateRow(index)) {
                    return true;
                }
            }
        }

        return false;
    }

    render() {
        const rows = [];

        for (let index = this.props.fromIndex; index < this.props.toIndex; index++) {
            const height = index in this.props.customHeights ? this.props.customHeights[index] : this.props.rowHeight;

            rows.push(this.props.renderRow({
                height,
                index,
                key: index,
                defaultHeight: this.props.rowHeight
            }));
        }

        return <div data-wtf={this.props.wtfKey}>
            {rows}
        </div>;
    }
}