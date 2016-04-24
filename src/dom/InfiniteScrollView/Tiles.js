
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
            rowsCount - 1,
            Math.floor(normalizedOffsetTop / tileHeight)
        )
    );

    let tileFrom = tiles[tileIndexFrom];

    const tileIndexTo = Math.min(
        rowsCount - 1,
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