import {InfiniteScrollView} from '../InfiniteScrollView';
import React, {Component, Children, cloneElement} from 'react';
import PropTypes from 'prop-types';
import bem from '../bem';
import TableRow from './TableRow';
import Block from '../Block';

const block = bem('Table');

function TableCell(props) {
    return <Block {...props} static={true}>
        {Children.map(props.children, (item) => {
            if (typeof item !== 'object') {
                return item;
            }

            return cloneElement(item, Object.assign({}, item.props, {
                width: props.width,
                index: props.index,
                rowIndex: props.rowIndex
            }));
        })}
    </Block>;
}

TableCell.propTypes = {
    width: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    rowIndex: PropTypes.number,
    index: PropTypes.number
};

export default class Table extends Component {
    static Row = TableRow;
    static Cell = TableCell;

    static propTypes = {
        columnWidths: PropTypes.objectOf(PropTypes.number).isRequired,
        columns: PropTypes.arrayOf(PropTypes.string)
    };

    static childContextTypes = {
        tableColumns: PropTypes.arrayOf(PropTypes.string),
        tableCellWidths: PropTypes.objectOf(PropTypes.number).isRequired
    };

    getChildContext() {
        return {
            tableColumns: this.props.columns,
            tableCellWidths: this.props.columnWidths
        };
    }

    render() {
        return <InfiniteScrollView {...this.props}>
            {this.props.children}
        </InfiniteScrollView>;
    }
}
