import React, {Component, PropTypes, Children, cloneElement} from 'react';
import {findDOMNode} from 'react-dom';
import bem from '../bem';
import AnimationFrame from 'animation-frame';
import Row from '../Row';
import Column from '../Column';
import Block from '../Block';

const animationFrame = new AnimationFrame();

function defaultParentWithScrollGetter(tableNode) {
    return document;
}

function defaultScrollTopGetter(tableNode, node) {
    if (node === document.body || node === document.documentElement || node === document) {
        return document.body.scrollTop || document.documentElement.scrollTop;
    }

    return node.scrollTop;
}

function defaultScrollLeftGetter(tableNode, node) {
    if (node === document.body || node === document.documentElement || node === document) {
        return document.body.scrollLeft || document.documentElement.scrollLeft;
    }

    return node.scrollLeft;
}


function defaultTableViewportStartGetter(tableNode, nodeWithScroll) {
    return tableNode.offsetTop;
}

function defaultTableMaxViewportGetter(tableNode, nodeWithScroll) {
    return window.screen.availHeight;
}

function defaultGetCurrentFirstRowIndex({scrollTop, availHeight, viewportStart, rowHeight, rowsCount}) {
    const start = Math.floor(Math.max(0, scrollTop - viewportStart) / rowHeight);
    const preload = (availHeight / rowHeight) / 2;

    return Math.max(0, Math.floor(start - preload));
}

function defaultGetCurrentLastRowIndex({scrollTop, availHeight, viewportStart, rowHeight, rowsCount}) {
    const end = Math.floor(Math.max(0, (scrollTop - viewportStart) + availHeight) / rowHeight);
    const preload = (availHeight / rowHeight) / 2;

    return Math.min(rowsCount, Math.floor(end + preload));
}

const block = bem('Table');

class TableCell extends Component {
    render() {
        return <Block {...this.props}>
            {this.props.children}
        </Block>;
    }
}

class TableRow extends Component {
    render() {
        return <Row {...this.props} fix={false}>
            {this.props.children}
        </Row>;
    }
}

export default class Table extends Component {
    static Cell = TableCell;
    static Row = TableRow;

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
        scrollLeftGetter: defaultScrollLeftGetter,
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
        scrollLeft: 0,
        availHeight: 0,
        viewportStart: 0
    };

    scrollListener = (event) => {
        if (this.frameId) {
            animationFrame.cancel(this.frameId);
        }

        this.frameId = animationFrame.request(() => {
            this.frameId = animationFrame.request(() => {
                this.frameId = animationFrame.request(() => {
                    this.updateScrollState(this.props);
                });
            });
        });
    };

    updateScrollState(props) {
        if (!this.nodeWithScroll) {
            return;
        }
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
        const table = findDOMNode(this.refs.table);
        if (nextProps.parentWithScrollGetter(table) !== this.nodeWithScroll) {
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
            rows.push(this.props.header({
                scrollTop: this.state.scrollTop,
                availHeight: this.state.availHeight,
                viewportStart: this.state.viewportStart,
                rowsCount: this.props.rowsCount,
                rowHeight: this.props.rowHeight,
                fromIndex, toIndex
            }));
        }

        if (fakeTopCellHeightSize) {
            rows.push(<TableRow
                key="__fake-top__"
                height={fakeTopCellHeightSize + 'px'}
            ></TableRow>);
        }

        for (var index = fromIndex; index < toIndex; index++) {// eslint-disable-line no-var
            rows.push(this.props.row({
                scrollTop: this.state.scrollTop,
                availHeight: this.state.availHeight,
                viewportStart: this.state.viewportStart,
                rowsCount: this.props.rowsCount,
                rowHeight: this.props.rowHeight,
                rowIndex: index,
                fromIndex, toIndex
            }));
        }

        if (fakeBottomCellHeightSize) {
            rows.push(<TableRow
                key="__fake-bottom__"
                height={fakeBottomCellHeightSize + 'px'}
            ></TableRow>);
        }

        if (this.props.footer) {
            rows.push(this.props.footer({
                scrollTop: this.state.scrollTop,
                availHeight: this.state.availHeight,
                viewportStart: this.state.viewportStart,
                rowsCount: this.props.rowsCount,
                rowHeight: this.props.rowHeight,
                fromIndex, toIndex
            }));
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
