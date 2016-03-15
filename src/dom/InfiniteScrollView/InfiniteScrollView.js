import React, {Component, PropTypes, Children, cloneElement} from 'react';
import {findDOMNode} from 'react-dom';
import bem from '../bem';
import AnimationFrame from 'animation-frame';
import Column from '../Column';

const animationFrame = new AnimationFrame();

function defaultParentWithScrollGetter(viewNode) {
    return document;
}

function defaultScrollTopGetter(viewNode, node) {
    if (node === document.body || node === document.documentElement || node === document) {
        return document.body.scrollTop || document.documentElement.scrollTop;
    }

    return node.scrollTop;
}

function defaultScrollLeftGetter(viewNode, node) {
    if (node === document.body || node === document.documentElement || node === document) {
        return document.body.scrollLeft || document.documentElement.scrollLeft;
    }

    return node.scrollLeft;
}


function defaultViewportStartGetter(viewNode, nodeWithScroll) {
    return viewNode.offsetTop;
}

function defaultMaxViewportGetter(viewNode, nodeWithScroll) {
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

const block = bem('InfiniteScrollView');

export default class InfiniteScrollView extends Component {
    static propTypes = {
        rowHeight: PropTypes.number.isRequired,
        rowsCount: PropTypes.number.isRequired,

        parentWithScrollGetter: PropTypes.func.isRequired,
        scrollTopGetter: PropTypes.func.isRequired,
        viewportStartGetter: PropTypes.func.isRequired,
        maxViewportGetter: PropTypes.func.isRequired,
        getCurrentFirstRowIndex: PropTypes.func.isRequired,
        getCurrentLastRowIndex: PropTypes.func.isRequired,
        getPrimaryKeyValue: PropTypes.func.isRequired
    };


    static defaultProps = {
        getCurrentFirstRowIndex: defaultGetCurrentFirstRowIndex,
        getCurrentLastRowIndex: defaultGetCurrentLastRowIndex,
        parentWithScrollGetter: defaultParentWithScrollGetter,
        scrollTopGetter: defaultScrollTopGetter,
        scrollLeftGetter: defaultScrollLeftGetter,
        viewportStartGetter: defaultViewportStartGetter,
        maxViewportGetter: defaultMaxViewportGetter,

        getPrimaryKeyValue(index) {
            return index;
        }
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
        const infiniteScrollView = findDOMNode(this.refs.infiniteScrollView);

        const scrollTop = props.scrollTopGetter(infiniteScrollView, this.nodeWithScroll);
        const scrollLeft = props.scrollLeftGetter(infiniteScrollView, this.nodeWithScroll);
        const availHeight = props.maxViewportGetter(infiniteScrollView, this.nodeWithScroll);
        const viewportStart = props.viewportStartGetter(infiniteScrollView, this.nodeWithScroll);

        let shouldUpdate = false;
        const newState = {};

        newState.scrollTop = scrollTop;
        if (scrollTop !== this.state.scrollTop) {
            shouldUpdate = true;
        }

        newState.availHeight = availHeight;
        if (availHeight !== this.state.availHeight) {
            shouldUpdate = true;
        }

        newState.viewportStart = viewportStart;
        if (viewportStart !== this.state.viewportStart) {
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

        newState.toIndex = toIndex;
        newState.fromIndex = fromIndex;

        if (toIndex === this.state.toIndex && fromIndex === this.state.fromIndex) {
            shouldUpdate = false;
        } else {
            shouldUpdate = true;
        }

        newState.scrollLeft = scrollLeft;
        if (this.state.scrollLeft !== scrollLeft) {
            shouldUpdate = true;
        }

        if (shouldUpdate) {
            this.setState(newState);
        }
    }

    componentWillReceiveProps(nextProps) {
        const infiniteScrollView = findDOMNode(this.refs.infiniteScrollView);
        if (nextProps.parentWithScrollGetter(infiniteScrollView) !== this.nodeWithScroll) {
            this.clearScrollListener();
            this.setUpScrollListener(nextProps);
        }
    }

    setUpScrollListener(props) {
        this.nodeWithScroll = props.parentWithScrollGetter(findDOMNode(this.refs.infiniteScrollView));

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

    getChildren() {
        const result = {
            headerChildren: null,
            rowChildren: null,
            footerChildren: null
        };

        const {children} = this.props;

        if (!Array.isArray(children) && !children.props.key) {
            result.rowChildren = children;
        } else {
            Children.forEach(children, (child) => {
                if ((!child.key || child.key === 'row') && !result.rowChildren) {
                    result.rowChildren = child;
                } else if (child.key === 'header') {
                    result.headerChildren = child;
                } else if (child.key === 'footer') {
                    result.footerChildren = child;
                } else {
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Two or more row childern (with key="row" or without key at all).'); 
                    }
                }
            });
        }

        return result;
    }

    renderRows() {
        const {fromIndex, toIndex} = this.state;

        const fakeTopCellHeightSize = fromIndex * this.props.rowHeight;
        const fakeBottomCellHeightSize = Math.max(0, this.props.rowsCount - toIndex) * this.props.rowHeight;

        const rows = [];

        const {headerChildren, rowChildren, footerChildren} = this.getChildren();

        if (headerChildren) {
            rows.push(cloneElement(headerChildren, Object.assign(
                {},
                headerChildren.props,
                {
                    scrollTop: this.state.scrollTop,
                    scrollLeft: this.state.scrollLeft,
                    availHeight: this.state.availHeight,
                    viewportStart: this.state.viewportStart,
                    rowsCount: this.props.rowsCount,
                    height: this.props.rowHeight,
                    fromIndex,
                    toIndex
                }
            )));
        }

        if (fakeTopCellHeightSize && rowChildren) {
            rows.push(<div
                key="__fake-top__"
                style={{height: fakeTopCellHeightSize}}
            ></div>);
        }

        if (rowChildren) {
            for (let index = fromIndex; index < toIndex; index++) {
                const primaryKey = this.props.getPrimaryKeyValue(index);

                rows.push(cloneElement(rowChildren, Object.assign(
                    {},
                    rowChildren.props,
                    {
                        scrollTop: this.state.scrollTop,
                        scrollLeft: this.state.scrollLeft,
                        availHeight: this.state.availHeight,
                        viewportStart: this.state.viewportStart,
                        rowsCount: this.props.rowsCount,
                        height: this.props.rowHeight,
                        index,
                        fromIndex,
                        toIndex,
                        primaryKey,
                        key: primaryKey
                    }
                )));
            }
        }

        if (fakeBottomCellHeightSize && rowChildren) {
            rows.push(<div
                key="__fake-bottom__"
                style={{height: fakeBottomCellHeightSize}}
            ></div>);
        }

        if (footerChildren) {
            rows.push(cloneElement(footerChildren, Object.assign(
                {},
                footerChildren.props,
                {
                    scrollTop: this.state.scrollTop,
                    scrollLeft: this.state.scrollLeft,
                    availHeight: this.state.availHeight,
                    viewportStart: this.state.viewportStart,
                    rowsCount: this.props.rowsCount,
                    height: this.props.rowHeight,
                    fromIndex,
                    toIndex
                }
            )));
        }

        return rows;
    }

    render() {
        return <Column
            ref="infiniteScrollView"
            wrap={Column.NOWRAP}
            fix={false}
        >
            {this.renderRows()}
        </Column>;
    }
}
