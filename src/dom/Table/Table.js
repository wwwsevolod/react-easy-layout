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
        headerHeight: PropTypes.number,
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

        header: PropTypes.func,
        row: PropTypes.func.isRequired,
        footer: PropTypes.func,

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
        toIndex: 0,
        fromIndex: 0,
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

        const fromIndex = this.props.getCurrentFirstRowIndex({
            scrollTop: scrollTop,
            availHeight: availHeight,
            viewportStart: viewportStart,
            rowsCount: this.props.rowsCount,
            rowHeight: this.props.rowHeight
        });

        const toIndex = this.props.getCurrentLastRowIndex({
            scrollTop: scrollTop,
            availHeight: availHeight,
            viewportStart: viewportStart,
            rowsCount: this.props.rowsCount,
            rowHeight: this.props.rowHeight
        });

        if (toIndex === this.state.toIndex && fromIndex === this.state.fromIndex) {
            shouldUpdate = false;
        } else {
            newState.toIndex = toIndex;
            newState.fromIndex = fromIndex;
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

    renderRows() {
        const {fromIndex, toIndex} = this.state;

        const fakeTopCellHeightSize = fromIndex * this.props.rowHeight;
        const fakeBottomCellHeightSize = Math.max(0, this.props.rowsCount - toIndex) * this.props.rowHeight;

        const rows = [];

        if (this.props.header) {
            rows.push(this.props.header());
        }

        if (fakeTopCellHeightSize) {
            rows.push(<Row
                key="__fake-top__"
                height={fakeTopCellHeightSize + 'px'}
            ></Row>);
        }

        for (var index = fromIndex; index < toIndex; index++) {// eslint-disable-line no-var
            rows.push(this.props.row({
                scrollTop: this.state.scrollTop,
                availHeight: this.state.availHeight,
                viewportStart: this.state.viewportStart,
                rowsCount: this.props.rowsCount,
                rowHeight: this.props.rowHeight,
                rowIndex: index
            }));
        }

        if (fakeBottomCellHeightSize) {
            rows.push(<Row
                key="__fake-bottom__"
                height={fakeBottomCellHeightSize + 'px'}
            ></Row>);
        }

        if (this.props.footer) {
            rows.push(this.props.footer());
        }

        return rows;
    }

    render() {
        return <Column
            ref="table"
            wrap={Row.NOWRAP}
            fix={false}
        >
            {this.renderRows()}
        </Column>;
    }
}
