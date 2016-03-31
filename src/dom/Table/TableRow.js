import {InfiniteScrollView} from '../InfiniteScrollView';
import React, {Component, PropTypes, Children, cloneElement} from 'react';
import bem from '../bem';
import Row from '../Row';

const block = bem('TableRow');

export default class TableRow extends Component {
    static contextTypes = {
        tableColumns: PropTypes.arrayOf(PropTypes.string),
        tableCellWidths: PropTypes.objectOf(PropTypes.number).isRequired
    };

    static propTypes = {
        height: PropTypes.number.isRequired,
        index: PropTypes.number.isRequired,
        children(props) {
            let children = Children.toArray(props.children);

            for (let child of children) {
                if (!child.props.field) {
                    return new Error('Child of Table.Row must have `field` property');
                }
            }
        }
    };

    renderColumns() {
        if (!this.context.tableColumns) {
            return Children.map(this.props.children, (child) => cloneElement(child, Object.assign(
                {}, 
                child.props,
                {
                    width: this.context.tableCellWidths[child.props.field] || 0,
                    index: this.props.index
                }
            )));
        }

        if (!this.context.tableColumns.length) {
            return null;
        }

        const columns = this.context.tableColumns.reduce((accum, field, index) => {
            accum[field] = index;

            return accum;
        }, {});

        let span = 0;

        return Children.toArray(this.props.children).filter((item) => {
            return item.props.field in columns;
        }).sort((child1, child2) => {
            return columns[child1.props.field] - columns[child2.props.field];
        }).map((child, index) => {
            let width = this.context.tableCellWidths[child.props.field] || 0;

            if (index !== (columns[child.props.field] - span)) {
                let currentSpan = columns[child.props.field] - span - index;
                span += currentSpan;

                while (currentSpan--) {
                    width = width + this.context.tableCellWidths[this.context.tableColumns[index]] || 0;
                }
            }

            return cloneElement(child, Object.assign({}, child.props, {
                width,
                index: this.props.index
            }));
        });
    }

    render() {
        return <div style={{height: this.props.height}}>
            {this.renderColumns()}
        </div>;
    }
}
