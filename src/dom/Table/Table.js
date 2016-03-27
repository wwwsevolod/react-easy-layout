import {InfiniteScrollView} from '../InfiniteScrollView';
import React, {Component, PropTypes, Children, cloneElement} from 'react';
import bem from '../bem';
import TableRow from './TableRow';
import Block from '../Block';

const block = bem('Table');

function TableCell(props) {
    return <Block {...props} static={true}>
        {props.children}
    </Block>;
}

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
