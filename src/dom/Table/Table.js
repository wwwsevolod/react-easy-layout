import React, {Component, PropTypes, Children, cloneElement} from 'react';
import {findDOMNode} from 'react-dom';
import bem from '../bem';

import Row from '../Row';
import Column from '../Column';
import Block from '../Block';
import Cell from './Cell';

function defaultParentWithScrollGetter(tableNode) {
    return document;
}

function defaultScrollTopGetter(tableNode, node) {
    if (node === document.body || node === document.documentElement || node === document) {
        return document.body.scrollTop || document.documentElement.scrollTop;
    }

    return node.scrollTop;
}

function defaultTableViewportStartGetter(tableNode, nodeWithScroll) {
    return tableNode.offsetTop;
}

function defaultTableMaxViewportGetter(tableNode, nodeWithScroll) {
    return window.screen.availHeight;
}

function defaultGetCurrentFirstRowIndex({scrollTop, availHeight, viewportStart, rowHeight, rowsCount}) {
    // const start = Math.floor((((scrollTop + availHeight) - viewportStart)) / rowHeight);
    const start = Math.floor(Math.max(0, scrollTop - viewportStart) / rowHeight);
    const preload = availHeight / rowHeight;

    return Math.max(0, Math.floor(start - preload));
}

function defaultGetCurrentLastRowIndex({scrollTop, availHeight, viewportStart, rowHeight, rowsCount}) {
    const end = Math.floor(Math.max(0, (scrollTop - viewportStart) + availHeight) / rowHeight);
    const preload = availHeight / rowHeight;

    return Math.min(rowsCount, Math.floor(end + preload));
}

const block = bem('Table');

export default class Table extends Component {
    static propTypes = {
        rowHeight: PropTypes.number.isRequired,
        rowsCount: PropTypes.number.isRequired,

        onRowMouseOver: PropTypes.func.isRequired,
        onRowMouseOut: PropTypes.func.isRequired,

        parentWithScrollGetter: PropTypes.func.isRequired,
        scrollTopGetter: PropTypes.func.isRequired,
        tableViewportStartGetter: PropTypes.func.isRequired,
        tableMaxViewportGetter: PropTypes.func.isRequired,
        getCurrentFirstRowIndex: PropTypes.func.isRequired,
        getCurrentLastRowIndex: PropTypes.func.isRequired,
        getPrimaryKeyValue: PropTypes.func.isRequired,

        rowClassNameGetter: PropTypes.func
    };


    static defaultProps = {
        getCurrentFirstRowIndex: defaultGetCurrentFirstRowIndex,
        getCurrentLastRowIndex: defaultGetCurrentLastRowIndex,
        parentWithScrollGetter: defaultParentWithScrollGetter,
        scrollTopGetter: defaultScrollTopGetter,
        tableViewportStartGetter: defaultTableViewportStartGetter,
        tableMaxViewportGetter: defaultTableMaxViewportGetter,
        getPrimaryKeyValue(index) {
            return index;
        },

        onRowMouseOver(index) {},
        onRowMouseOut(index) {}
    };

    state = {
        scrollTop: 0,
        availHeight: 0,
        viewportStart: 0
    };

    scrollListener = (event) => {
        this.updateScrollState(this.props);
    };

    updateScrollState(props) {
        const table = findDOMNode(this.refs.table);

        const scrollTop = props.scrollTopGetter(table, this.nodeWithScroll);
        const availHeight = props.tableMaxViewportGetter(table, this.nodeWithScroll);
        const viewportStart = props.tableViewportStartGetter(table, this.nodeWithScroll);

        let shouldUpdate = false;
        const newState = {};

        if (scrollTop !== this.state.scrollTop) {
            newState.scrollTop = scrollTop;
            shouldUpdate = true;
        }

        if (availHeight !== this.state.availHeight) {
            newState.availHeight = availHeight;
            shouldUpdate = true;
        }

        if (viewportStart !== this.state.viewportStart) {
            newState.viewportStart = viewportStart;
            shouldUpdate = true;
        }

        if (shouldUpdate) {
            this.setState(newState);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.parentWithScrollGetter() !== this.nodeWithScroll) {
            this.clearScrollListener();
            this.setUpScrollListener(nextProps);
        }
    }

    setUpScrollListener(props) {
        this.nodeWithScroll = props.parentWithScrollGetter(findDOMNode(this.refs.table));

        if (!this.nodeWithScroll) {
            return;
        }

        this.nodeWithScroll.addEventListener('scroll', this.scrollListener, false);
        this.updateScrollState(props);
    }

    clearScrollListener() {
        if (this.nodeWithScroll) {
            this.nodeWithScroll.removeEventListener('scroll', this.scrollListener, false);
        }
    }

    componentDidMount() {
        this.setUpScrollListener(this.props);
    }

    componentWillUnmount() {
        this.clearScrollListener();
    }

    renderColumns() {
        const fromIndex = this.props.getCurrentFirstRowIndex({
            scrollTop: this.state.scrollTop,
            availHeight: this.state.availHeight,
            viewportStart: this.state.viewportStart,
            rowsCount: this.props.rowsCount,
            rowHeight: this.props.rowHeight
        });

        const toIndex = this.props.getCurrentLastRowIndex({
            scrollTop: this.state.scrollTop,
            availHeight: this.state.availHeight,
            viewportStart: this.state.viewportStart,
            rowsCount: this.props.rowsCount,
            rowHeight: this.props.rowHeight
        });

        const fakeTopCellHeightSize = fromIndex * this.props.rowHeight;
        const fakeBottomCellHeightSize = Math.max(0, this.props.rowsCount - toIndex) * this.props.rowHeight;

        const headerRow = [];
        const rows = [];

        if (fakeTopCellHeightSize) {
            rows.push(<Row key="__@fake-top@__" fix={false}>
                <Cell height={`${fakeTopCellHeightSize}px`} />
            </Row>);
        }

        const columns = Children.map(this.props.children, (column, index) => {
            if (column.props.header) {
                const header = column.props.header({
                    columnKey: column.columnKey,
                    height: this.props.rowHeight,
                    scrollTop: this.state.scrollTop,
                    availHeight: this.state.availHeight,
                    viewportStart: this.state.viewportStart,
                    rowsCount: this.props.rowsCount,
                    rowHeight: this.props.rowHeight
                });

                const child = header.type === Cell ? cloneElement(header, Object.assign({
                }, header.props, {
                    height: `${this.props.rowHeight}px`,
                    width: `${column.props.width}px`,
                    key: '__@header@__' + index
                }), header.props.children) : (<Cell
                    height={`${this.props.rowHeight}px`}
                    width={`${column.props.width}px`}
                    key={'__@header@__' + index}
                >
                    {header}
                </Cell>);

                headerRow.push(header);
            }

            return column;
        });

        rows.push(<Row key="__@heaader@__" fix={false}>
            {headerRow}
        </Row>);

        for (let index = fromIndex; index < toIndex; index++) {
            const row = [];
            columns.forEach((column, colIndex) => {
                let className = block('Row');

                if (this.props.rowClassNameGetter) {
                    className += ' ' + this.props.rowClassNameGetter(index, column.columnKey);
                }

                const cell = column.props.cell({
                    columnKey: column.columnKey,
                    rowIndex: index,
                    height: this.props.rowHeight,
                    scrollTop: this.state.scrollTop,
                    availHeight: this.state.availHeight,
                    viewportStart: this.state.viewportStart,
                    rowsCount: this.props.rowsCount,
                    rowHeight: this.props.rowHeight
                });

                const {onMouseOver, onMouseOut} = cell.props;

                const child = cell.type === Cell ? cloneElement(cell, Object.assign({
                }, cell.props, {
                    height: `${this.props.rowHeight}px`,
                    className: (cell.props.className || '') + ' ' + className,
                    // onMouseOver: (event) => {
                    //     if (onMouseOver) {
                    //         onMouseOver(event);
                    //     }
                    //
                    //     this.props.onRowMouseOver(index);
                    // },
                    // onMouseOut: (event) => {
                    //     if (onMouseOut) {
                    //         onMouseOut(event);
                    //     }
                    //
                    //     this.props.onRowMouseOut(index);
                    // },
                    key: colIndex
                }), cell.props.children) : (<Cell
                    onMouseOver={(event) => this.props.onRowMouseOver(index)}
                    onMouseOut={(event) => this.props.onRowMouseOut(index)}
                    className={className}
                    height={`${this.props.rowHeight}px`}
                    key={colIndex}
                >
                    {cell}
                </Cell>);


                row.push(child);
            });

            rows.push(<Row key={'row'+index} fix={false}>
                {row}
            </Row>);
        }

        if (fakeBottomCellHeightSize) {
            rows.push(<Row key="__@fake-bottom@__" fix={false}>
                <Cell height={`${fakeBottomCellHeightSize}px`} />
            </Row>);
        }

        const footerRow = [];

        columns.forEach((column, index) => {
            if (column.props.footer) {
                const footer = column.props.footer({
                    columnKey: column.columnKey,
                    height: this.props.rowHeight,
                    scrollTop: this.state.scrollTop,
                    availHeight: this.state.availHeight,
                    viewportStart: this.state.viewportStart,
                    rowsCount: this.props.rowsCount,
                    rowHeight: this.props.rowHeight
                });

                const child = footer.type === Cell ? cloneElement(footer, Object.assign({
                }, footer.props, {
                    height: `${this.props.rowHeight}px`,
                    key: '__@footer@__' + index
                }), footer.props.children) : (<Cell
                    height={`${this.props.rowHeight}px`}
                    key={'__@footer@__' + index}
                >
                    {footer}
                </Cell>);

                footerRow.push(footer);
            }
        });

        rows.push(<Row key="__@foooter@__" fix={false}>
            {footerRow}
        </Row>);

        return rows;
    }

    render() {
        return <Column
            ref="table"
            wrap={Column.NOWRAP}
            fix={false}
        >
            {this.renderColumns()}
        </Column>;
    }
}
