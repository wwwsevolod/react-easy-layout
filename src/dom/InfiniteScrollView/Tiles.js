
export function getTiles(customRowsHeights, rowsCount, rowHeight, tileHeight) {
    const sortedHeights = customRowsHeights.slice().sort((item1, item2) => item1.index - item2.index);

    const tiles = [];

    let currentHeightModifierIndex = 0;
    let currentTileHeight = 0;

    let currentTile = null;

    let prevIndex = -1;

    let leftAfterPrevious = false;

    for (let index = 0; index < rowsCount; index++) {
        if (prevIndex === index) {
            throw new Error(`CYCLE ${index}, ${currentTileHeight},`
                + ` ${JSON.stringify(tiles)}, ${JSON.stringify(currentTile)}`);
        }

        prevIndex = index;

        if (!currentTile) {
            currentTile = {
                indexFrom: index,
                indexTo: 0,

                heightDiff: 0,
                offsetTopDiff: 0,

                linkedHead: -1,
                hasLinkedTail: false
            };
        }

        const nextModifiedHeight = sortedHeights[currentHeightModifierIndex];

        if (nextModifiedHeight && index === nextModifiedHeight.index) {
            currentHeightModifierIndex++;
        }

        let countToAdd = 1;

        if (!nextModifiedHeight || index !== nextModifiedHeight.index) {
            countToAdd = Math.floor((tileHeight - currentTileHeight) / rowHeight);
            
            if (tileHeight - (currentTileHeight + countToAdd * rowHeight) > 0) {
                countToAdd += 1;
            }

            countToAdd = Math.min(
                countToAdd,
                rowsCount - index
            );
        }

        if (nextModifiedHeight) {
            if (index === nextModifiedHeight.index) {
                countToAdd = 1;
            } else {
                countToAdd = Math.min(
                    nextModifiedHeight.index - index,
                    countToAdd
                );
            }
        }

        const prevColHeight = currentTileHeight;

        if (!nextModifiedHeight || index !== nextModifiedHeight.index) {
            currentTileHeight += countToAdd * rowHeight;
        } else {
            currentTileHeight += nextModifiedHeight.height;
        }

        if (currentTileHeight === tileHeight) {
            currentTile.indexTo = index + countToAdd;
            tiles.push(currentTile);
            currentTile = null;
            currentTileHeight = 0;
        } else if (currentTileHeight > tileHeight) {
            currentTile.indexTo = index + countToAdd;

            let offsetTopDiff = 0;

            if (nextModifiedHeight && index === nextModifiedHeight.index) {
                offsetTopDiff = currentTileHeight - nextModifiedHeight.height;
            } else {
                offsetTopDiff = currentTileHeight - rowHeight;
            }

            currentTileHeight = currentTileHeight - tileHeight;

            const tailsCount = index + countToAdd + Math.floor(currentTileHeight / tileHeight) + 1;
            currentTile.hasLinkedTail = !!tailsCount;
            const indexOfTileToLink = tiles.length;

            tiles.push(currentTile);

            while (currentTileHeight > tileHeight) {
                currentTileHeight -= tileHeight;

                currentTile = {
                    indexFrom: index + countToAdd - 1,
                    indexTo: index + countToAdd,

                    heightDiff: 0,
                    offsetTopDiff: offsetTopDiff,

                    linkedHead: indexOfTileToLink,
                    hasLinkedTail: true
                };

                tiles.push(currentTile);
            }

            currentTile = {
                indexFrom: index + countToAdd - 1,
                indexTo: 0,

                heightDiff: 0,
                offsetTopDiff: offsetTopDiff,

                linkedHead: indexOfTileToLink,
                hasLinkedTail: false
            };

            if (index + countToAdd === rowsCount) {
                currentTile.indexTo = index + countToAdd;
                currentTile.heightDiff = tileHeight - currentTileHeight;
                tiles.push(currentTile);
            }
        } else if (!nextModifiedHeight || index + countToAdd === rowsCount) {
            currentTile.indexTo = rowsCount;
            currentTile.heightDiff = tileHeight - currentTileHeight;
            tiles.push(currentTile);
        }

        index += countToAdd - 1;
    }

    return tiles;
}

export function getHeightFromTiles(tiles, tileHeight) {
    if (!tiles.length) {
        return 0;
    }

    return (tiles.length * tileHeight) - tiles[tiles.length - 1].heightDiff;
}

export function selectRowsAndOffsetFromVisibleTiles(
    tiles,
    rowsCount,
    normalizedOffsetTop,
    tileHeight,
    availHeight
) {
    if (!tiles.length) {
        return {
            indexFrom: 0,
            indexTo: 0,
            offsetTop: 0
        };
    }

    const needToAddOneMore = !!(availHeight % tileHeight);

    const tileIndexFrom = Math.max(
        0,
        Math.min(
            tiles.length - 1,
            Math.floor(normalizedOffsetTop / tileHeight)
        )
    );

    let tileFrom = tiles[tileIndexFrom];

    const tileIndexTo = Math.min(
        tiles.length - 1,
        tileIndexFrom + Math.floor(availHeight / tileHeight) + (needToAddOneMore ? 1 : 0)
    );

    const tileTo = tiles[tileIndexTo];

    const offsetTop = (tileFrom.linkedHead !== -1 ? tileFrom.linkedHead + 1 : tileIndexFrom) * tileHeight;
    const offsetTopDiff = tileFrom.offsetTopDiff;

    return {
        indexFrom: tileFrom.linkedHead !== -1 ?
            tiles[tileFrom.linkedHead].indexTo - 1 : tileFrom.indexFrom,
        indexTo: tileTo.indexTo,
        offsetTop: offsetTop - (offsetTopDiff ? (tileHeight - offsetTopDiff) : 0)
    };
}

export function selectVisibleTilesAndOffset(
    tiles,
    rowsCount,
    normalizedOffsetTop,
    tileHeight,
    availHeight,
    defaultRowHeight,
    customRowsHeightsHashMap,
    tileSize
) {
    if (!tiles.length) {
        return {
            logicTiles: [],
            offsetTop: 0
        };
    }

    const needToAddOneMore = !!(availHeight % tileHeight);

    const tileIndexFrom = Math.max(
        0,
        Math.min(
            tiles.length - 1,
            Math.floor(normalizedOffsetTop / tileHeight)
        )
    );

    let tileFrom = tiles[tileIndexFrom];

    const tileIndexTo = Math.min(
        tiles.length - 1,
        tileIndexFrom + Math.floor(availHeight / tileHeight) + (needToAddOneMore ? 1 : 0)
    );

    const tileTo = tiles[tileIndexTo];

    const offsetTop = (tileFrom.linkedHead !== -1 ? tileFrom.linkedHead + 1 : tileIndexFrom) * tileHeight;
    
    const offsetTopDiff = tileFrom.offsetTopDiff;

    let finalOffsetTop = offsetTop - (offsetTopDiff ? (tileHeight - offsetTopDiff) : 0);

    let indexFrom = tileFrom.linkedHead !== -1 ?
        tiles[tileFrom.linkedHead].indexTo - 1 : tileFrom.indexFrom;

    let needToTile = indexFrom % tileSize;

    while (needToTile) {
        indexFrom--;
        needToTile--;

        if (indexFrom in customRowsHeightsHashMap) {
            finalOffsetTop -= customRowsHeightsHashMap[indexFrom];
        } else {
            finalOffsetTop -= defaultRowHeight;
        }
    }

    let indexTo = tileTo.indexTo;

    while(indexTo % tileSize && indexTo < rowsCount) {
        indexTo++;
    }

    const logicTiles = [];

    while (indexFrom < indexTo) {
        if (indexFrom + tileSize < indexTo) {
            logicTiles.push({
                indexFrom,
                indexTo: indexFrom + tileSize
            });
        } else {
            logicTiles.push({
                indexFrom,
                indexTo
            });
        }
        indexFrom += tileSize;
    }

    return {
        logicTiles,
        offsetTop: finalOffsetTop
    };
}

export function appendNewTilesIfPossible(prevTiles, tiles, offsetTopPrev, offsetTop) {
    if (!tiles.length) {
        return {
            offsetTop: 0,
            prevTiles: []
        };
    }

    const defaultReturnValue = {
        offsetTop,
        prevTiles: tiles
    };

    if (!prevTiles.length) {
        return defaultReturnValue;
    }
    
    const firstPrevTile = prevTiles[0];
    const lastPrevTile = prevTiles[prevTiles.length - 1];

    const firstCurrentTile = tiles[0];
    const lastCurrentTile = tiles[tiles.length - 1];

    if (firstPrevTile.indexFrom === lastCurrentTile.indexTo) {
        return {
            offsetTop,
            prevTiles: [...tiles, ...prevTiles]
        };
    }

    if (lastPrevTile.indexTo === firstCurrentTile.indexFrom) {
        return {
            offsetTop,
            prevTiles: [...prevTiles, ...tiles]
        };
    }

    if (firstPrevTile.indexFrom >= firstCurrentTile.indexFrom && lastPrevTile.indexTo <= lastCurrentTile.indexTo) {
        return {
            offsetTop,
            prevTiles: tiles
        };
    }

    if (firstPrevTile.indexFrom <= firstCurrentTile.indexFrom && lastPrevTile.indexTo >= lastCurrentTile.indexTo) {
        return {
            offsetTop: offsetTopPrev,
            prevTiles: prevTiles
        };
    }

    if (firstCurrentTile.indexFrom > lastPrevTile.indexTo) {
        return defaultReturnValue;
    }

    if (lastCurrentTile.indexTo < firstPrevTile.indexFrom) {
        return defaultReturnValue;
    }

    if (firstCurrentTile.indexFrom < firstPrevTile.indexFrom) {
        for (let i = 0; i < prevTiles.length; i++) {
            const index = i;
            if (prevTiles[index].indexFrom === lastCurrentTile.indexTo) {
                return {
                    offsetTop: offsetTop,
                    prevTiles: [
                        ...tiles,
                        ...prevTiles.slice(index, prevTiles.length)
                    ]
                };
            }
        }
    } else {
        for (let i = 0; i < prevTiles.length; i++) {
            const index = prevTiles.length - i - 1;
            if (prevTiles[index].indexTo === firstCurrentTile.indexFrom) {
                return {
                    offsetTop: offsetTopPrev,
                    prevTiles: [
                        ...prevTiles.slice(0, index + 1),
                        ...tiles
                    ]
                };
            }
        }
    }

    return defaultReturnValue;
}
