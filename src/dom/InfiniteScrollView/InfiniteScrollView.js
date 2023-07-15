import React, {Component, Children, cloneElement} from 'react';
import PropTypes from 'prop-types';
import {findDOMNode} from 'react-dom';
import bem from '../bem';
import Column from '../Column';
import {
    getTiles,
    getHeightFromTiles,
    selectRowsAndOffsetFromVisibleTiles,
    selectVisibleTilesAndOffset,
    appendNewTilesIfPossible
} from './Tiles';
import LogicTile from './LogicTile';

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

let cancelFrame;
let requestFrame;

if (typeof cancelAnimationFrame !== 'undefined' && typeof requestAnimationFrame !== 'undefined') {
    requestFrame = requestAnimationFrame;
    cancelFrame = cancelAnimationFrame;
} else {
    requestFrame = (cb) => setTimeout(cb, 32);
    cancelFrame = (id) => clearTimeout(id);
}

const defaultArray = [];

const block = bem('InfiniteScrollView');

export default class InfiniteScrollView extends Component {
    static propTypes = {
        rowHeight: PropTypes.number.isRequired,
        rowsCount: PropTypes.number.isRequired,

        customRowsHeights: PropTypes.arrayOf(PropTypes.shape({
            index: PropTypes.number,
            height: PropTypes.number
        })),

        stateCallback: PropTypes.func,
        beforeStateChangeCallback: PropTypes.func,

        parentWithScrollGetter: PropTypes.func.isRequired,
        scrollTopGetter: PropTypes.func.isRequired,
        viewportStartGetter: PropTypes.func.isRequired,
        maxViewportGetter: PropTypes.func.isRequired,
        getPrimaryKeyValue: PropTypes.func.isRequired,

        tileSize: PropTypes.number.isRequired,

        timeToInvalidateLogicTilesCache: PropTypes.number.isRequired,

        shouldUpdateRow: PropTypes.func,
        renderHeader: PropTypes.func,
        renderRow: PropTypes.func,
        renderFooter: PropTypes.func
    };


    static defaultProps = {
        parentWithScrollGetter: defaultParentWithScrollGetter,
        scrollTopGetter: defaultScrollTopGetter,
        scrollLeftGetter: defaultScrollLeftGetter,
        viewportStartGetter: defaultViewportStartGetter,
        maxViewportGetter: defaultMaxViewportGetter,

        timeToInvalidateLogicTilesCache: 5000,

        tileSize: 20,

        getPrimaryKeyValue(index) {
            return index;
        }
    };

    state = {
        logicTilesDebounced: [],
        currentLogicTiles: [],

        offsetTop: 0,
        currentOffsetTop: 0,

        toIndex: 0,
        fromIndex: 0,

        scrollTop: 0,
        scrollLeft: 0,
        availHeight: 0,
        viewportStart: 0,

        totalHeightStyle: {
            height: '0px'
        },

        additionalHeightFakeTop: 0,
        additionalHeightFakeBottom: 0
    };

    scrollListener = (event) => {
        if (this.frame) {
            cancelFrame(this.frame);
        }
        this.frame = requestFrame(() => {
            // this.frame = requestFrame(() => {
                this.updateScrollState(this.props);
            // });
        });
    };

    needToUpdateTiles(customRowsHeights, rowsCount, rowHeight, availHeight) {
        if (this.prevCustomRowsHeights !== customRowsHeights) {
            return true;
        }

        if (this.prevRowsCount !== rowsCount) {
            return true;
        }

        if (this.prevRowHeight !== rowHeight) {
            return true;
        }

        if (this.prevAvailHeight !== availHeight) {
            return true;
        }

        return false;
    }

    getTilesAndHeight(customRowsHeights, rowsCount, rowHeight, availHeight) {
        if (!this.tiles || this.needToUpdateTiles(customRowsHeights, rowsCount, rowHeight, availHeight)) {
            this.prevCustomRowsHeights = customRowsHeights;
            this.prevRowsCount = rowsCount;
            this.prevRowHeight = rowHeight;
            this.prevAvailHeight = availHeight;

            const tileHeight = Math.floor(availHeight / 2 / rowHeight + 1) * rowHeight;

            this.tiles = getTiles(
                customRowsHeights || [],
                rowsCount,
                rowHeight,
                tileHeight
            );

            this.fullHeight = getHeightFromTiles(this.tiles, tileHeight);
        }

        return {
            tiles: this.tiles,
            height: this.fullHeight
        };
    }

    getViewState(props, scrollTop, viewportStart, availHeight) {
        const virtualScrollTop = Math.max(0, scrollTop - viewportStart);

        const {tiles, height} = this.getTilesAndHeight(
            props.customRowsHeights || defaultArray,
            props.rowsCount,
            props.rowHeight,
            availHeight
        );

        let customHeights = {};

        if (this.props.customRowsHeights) {
            customHeights = this.props.customRowsHeights.reduce((accum, item) => {
                accum[item.index] = item.height;
                return accum;
            }, {});
        }

        const logicTilesAndOffset = selectVisibleTilesAndOffset(
            tiles,
            props.rowsCount,
            virtualScrollTop,
            Math.floor(availHeight / 2 / props.rowHeight + 1) * props.rowHeight,
            availHeight,
            props.rowHeight,
            customHeights,
            props.tileSize
        );

        if (!logicTilesAndOffset.logicTiles.length) {
            return {
                currentLogicTiles: [],
                logicTilesDebounced: [],
                currentOffsetTop: 0,
                fromIndex: 0,
                toIndex: 0,
                height: 0,
                offsetTop: 0
            };
        }

        const {prevTiles, offsetTop} = appendNewTilesIfPossible(
            this.state.logicTilesDebounced,
            logicTilesAndOffset.logicTiles,
            this.state.offsetTop,
            logicTilesAndOffset.offsetTop
        );

        return {
            fromIndex: logicTilesAndOffset.logicTiles[0].indexFrom,
            toIndex: logicTilesAndOffset.logicTiles[logicTilesAndOffset.logicTiles.length - 1].indexTo,
            currentLogicTiles: logicTilesAndOffset.logicTiles,
            logicTilesDebounced: prevTiles,
            height,
            currentOffsetTop: logicTilesAndOffset.offsetTop,
            offsetTop
        };
    }

    updateScrollState(props) {
        if (!this.nodeWithScroll) {
            return;
        }
        if (!this.refs.infiniteScrollView) {
            return;
        }

        const infiniteScrollView = findDOMNode(this.refs.infiniteScrollView);
        const newState = {};

        newState.scrollLeft = props.scrollLeftGetter(infiniteScrollView, this.nodeWithScroll);

        const availHeight = props.maxViewportGetter(infiniteScrollView, this.nodeWithScroll);
        const scrollTop = props.scrollTopGetter(infiniteScrollView, this.nodeWithScroll);
        const viewportStart = props.viewportStartGetter(infiniteScrollView, this.nodeWithScroll);


        newState.scrollTop = scrollTop;
        newState.availHeight = availHeight;
        newState.viewportStart = viewportStart;

        const {
            fromIndex,
            toIndex,
            height,
            offsetTop,
            currentLogicTiles,
            currentOffsetTop,
            logicTilesDebounced
        } = this.getViewState(
            props,
            scrollTop,
            viewportStart,
            availHeight
        );

        if (this.state.totalHeightStyle.height !== `${height}px`) {
            newState.totalHeightStyle = {
                height: `${height}px`
            };
        }

        newState.currentLogicTiles = currentLogicTiles;
        newState.currentOffsetTop = currentOffsetTop;
        newState.logicTilesDebounced = logicTilesDebounced;
        newState.fromIndex = fromIndex;
        newState.toIndex = toIndex;
        newState.offsetTop = offsetTop;


        if (props.beforeStateChangeCallback) {
            props.beforeStateChangeCallback();
        }

        clearTimeout(this.timerOfDebouncedTilesInvalation);

        this.setState(newState, () => {
            clearTimeout(this.timerOfDebouncedTilesInvalation);
            this.timerOfDebouncedTilesInvalation = setTimeout(() => {
                this.setState({
                    logicTilesDebounced: this.state.currentLogicTiles,
                    offsetTop: this.state.currentOffsetTop
                });
            }, this.props.timeToInvalidateLogicTilesCache);

            if (props.stateCallback) {
                props.stateCallback();
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        if (!this.refs.infiniteScrollView) {
            return;
        }
        const infiniteScrollView = findDOMNode(this.refs.infiniteScrollView);
        if (nextProps.parentWithScrollGetter(infiniteScrollView) !== this.nodeWithScroll) {
            this.clearScrollListener();
            this.setUpScrollListener(nextProps);
        } else {
            this.updateScrollState(nextProps);
        }
    }

    setUpScrollListener(props) {
        if (!this.refs.infiniteScrollView) {
            return;
        }
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
        if (this.frame) {
            cancelFrame(this.frame);
        }
    }

    render() {
        const {fromIndex, toIndex, additionalHeightFakeTop} = this.state;

        let headerElement = null;

        if (this.props.renderHeader) {
            headerElement = this.props.renderHeader({
                scrollTop: this.state.scrollTop,
                scrollLeft: this.state.scrollLeft,
                availHeight: this.state.availHeight,
                viewportStart: this.state.viewportStart,
                rowsCount: this.props.rowsCount,
                height: this.props.rowHeight,
                defaultHeight: this.props.rowHeight,
                fromIndex,
                toIndex
            });
        }

        let customHeights = {};

        if (this.props.customRowsHeights) {
            customHeights = this.props.customRowsHeights.reduce((accum, item) => {
                accum[item.index] = item.height;
                return accum;
            }, {});
        }

        const tiles = [];

        if (this.props.renderRow) {
            for (let tile of this.state.logicTilesDebounced) {
                tiles.push(<LogicTile
                    key={tile.indexFrom}
                    wtfKey={tile.indexFrom}

                    fromIndex={tile.indexFrom}
                    toIndex={tile.indexTo}
                    renderRow={this.props.renderRow}
                    shouldUpdateRow={this.props.shouldUpdateRow}
                    customHeights={customHeights}
                    rowHeight={this.props.rowHeight}
                />);
            }
        }


        let footerElement = null;

        if (this.props.renderFooter) {
            footerElement = this.props.renderFooter({
                scrollTop: this.state.scrollTop,
                scrollLeft: this.state.scrollLeft,
                availHeight: this.state.availHeight,
                viewportStart: this.state.viewportStart,
                rowsCount: this.props.rowsCount,
                height: this.props.rowHeight,
                fromIndex,
                toIndex,
                defaultHeight: this.props.rowHeight
            });
        }

        return <div>
            {headerElement}
            <div style={this.state.totalHeightStyle} key="__real-rows__" ref="infiniteScrollView">
                {tiles.length ? <div
                    className="InfiniteScrollView__Offset"
                    style={{transform: `translateY(${this.state.offsetTop}px)`}}
                >
                    {tiles}
                </div> : null}
            </div>
            {footerElement}
        </div>;
    }
}
