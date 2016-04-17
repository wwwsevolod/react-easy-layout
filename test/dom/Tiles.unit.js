import {getTiles} from 'dom/InfiniteScrollView/Tiles';

describe('Tiles — engine that powers InfiniteScrollView', () => {
    it('should generate tiles for case where rowHeight is multiple for tileHeight and no custom heights', () => {
        expect(getTiles(
            [],
            30,
            100,
            500
        )).to.be.deep.equal([
            {
                indexFrom: 0,
                indexTo: 5,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: false,
                heightDiff: 0
            },
            {
                indexFrom: 5,
                indexTo: 10,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: false,
                heightDiff: 0
            },
            {
                indexFrom: 10,
                indexTo: 15,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: false,
                heightDiff: 0
            },
            {
                indexFrom: 15,
                indexTo: 20,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: false,
                heightDiff: 0
            },
            {
                indexFrom: 20,
                indexTo: 25,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: false,
                heightDiff: 0
            },
            {
                indexFrom: 25,
                indexTo: 30,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: false,
                heightDiff: 0
            }
        ]);

        expect(getTiles(
            [],
            3,
            100,
            500
        )).to.be.deep.equal([
            {
                indexFrom: 0,
                indexTo: 3,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: false,
                heightDiff: 200
            }
        ]);

        expect(getTiles(
            [],
            6,
            100,
            500
        )).to.be.deep.equal([
            {
                indexFrom: 0,
                indexTo: 5,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: false,
                heightDiff: 0
            },
            {
                indexFrom: 5,
                indexTo: 6,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: false,
                heightDiff: 400
            }
        ]);
    });

    it('should generate tiles when rowHeight is not multiple for tileHeight without additional heights', () => {
        expect(getTiles(
            [],
            3,
            30,
            100
        )).to.be.deep.equal([
            {
                indexFrom: 0,
                indexTo: 3,
                heightDiff: 10,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: false
            }
        ]);

        expect(getTiles(
            [],
            4,
            30,
            100
        )).to.be.deep.equal([
            {
                indexFrom: 0,
                indexTo: 4,
                heightDiff: 0,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: true
            },
            {
                indexFrom: 3,
                indexTo: 4,
                heightDiff: 80,
                linkedHead: 0,
                offsetTopDiff: 0,
                hasLinkedTail: false
            }
        ]);

        expect(getTiles(
            [],
            13,
            30,
            100
        )).to.be.deep.equal([
            {
                indexFrom: 0,
                indexTo: 4,
                heightDiff: 0,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: true
            },
            {
                indexFrom: 3,
                indexTo: 7,
                heightDiff: 0,
                linkedHead: 0,
                offsetTopDiff: 0,
                hasLinkedTail: true
            },
            {
                indexFrom: 6,
                indexTo: 10,
                heightDiff: 0,
                linkedHead: 1,
                offsetTopDiff: 0,
                hasLinkedTail: false
            },
            {
                indexFrom: 10,
                indexTo: 13,
                heightDiff: 10,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: false
            }
        ]);

        expect(getTiles(
            [],
            21,
            30,
            100
        )).to.be.deep.equal([
            {
                indexFrom: 0,
                indexTo: 4,
                heightDiff: 0,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: true
            },
            {
                indexFrom: 3,
                indexTo: 7,
                heightDiff: 0,
                linkedHead: 0,
                offsetTopDiff: 0,
                hasLinkedTail: true
            },
            {
                indexFrom: 6,
                indexTo: 10,
                heightDiff: 0,
                linkedHead: 1,
                offsetTopDiff: 0,
                hasLinkedTail: false
            },
            {
                indexFrom: 10,
                indexTo: 14,
                heightDiff: 0,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: true
            },
            {
                indexFrom: 13,
                indexTo: 17,
                heightDiff: 0,
                linkedHead: 3,
                offsetTopDiff: 0,
                hasLinkedTail: true
            },
            {
                indexFrom: 16,
                indexTo: 20,
                heightDiff: 0,
                linkedHead: 4,
                offsetTopDiff: 0,
                hasLinkedTail: false
            },
            {
                indexFrom: 20,
                indexTo: 21,
                heightDiff: 70,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: false
            }
        ]);
    });

    it('should generate tiles with custom rows heights', () => {
        expect(getTiles(
            [{
                index: 0,
                height: 50
            }],
            1,
            30,
            100
        )).to.be.deep.equal([
            {
                indexFrom: 0,
                indexTo: 1,
                heightDiff: 50,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: false
            }
        ]);

        expect(getTiles(
            [{
                index: 3,
                height: 50
            }],
            4,
            100,
            300
        )).to.be.deep.equal([
            {
                indexFrom: 0,
                indexTo: 3,
                heightDiff: 0,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: false
            },
            {
                indexFrom: 3,
                indexTo: 4,
                heightDiff: 250,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: false
            }
        ]);

        expect(getTiles(
            [{
                index: 3,
                height: 50
            }],
            4,
            30,
            100
        )).to.be.deep.equal([
            {
                indexFrom: 0,
                indexTo: 4,
                heightDiff: 0,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: true
            },
            {
                indexFrom: 3,
                indexTo: 4,
                heightDiff: 60,
                linkedHead: 0,
                offsetTopDiff: 0,
                hasLinkedTail: false
            }
        ]);

        expect(getTiles(
            [{
                index: 3,
                height: 50
            }],
            13,
            30,
            100
        )).to.be.deep.equal([
            {
                indexFrom: 0,
                indexTo: 4,
                heightDiff: 0,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: true
            },
            {
                indexFrom: 3,
                indexTo: 6,
                heightDiff: 0,
                linkedHead: 0,
                offsetTopDiff: 0,
                hasLinkedTail: false
            },
            {
                indexFrom: 6,
                indexTo: 10,
                heightDiff: 0,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: true
            },
            {
                indexFrom: 9,
                indexTo: 13,
                heightDiff: 0,
                linkedHead: 2,
                offsetTopDiff: 0,
                hasLinkedTail: true
            },
            {
                indexFrom: 12,
                indexTo: 13,
                heightDiff: 90,
                linkedHead: 3,
                offsetTopDiff: 0,
                hasLinkedTail: false
            }
        ]);
    });

    it('should generate tiles with custom rows heights when custom row height have height more than viewport', () => {
        expect(getTiles(
            [{
                index: 0,
                height: 350
            }],
            1,
            30,
            100
        )).to.be.deep.equal([
            {
                indexFrom: 0,
                indexTo: 1,
                heightDiff: 0,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: true
            },
            {
                indexFrom: 0,
                indexTo: 1,
                heightDiff: 0,
                linkedHead: 0,
                offsetTopDiff: 0,
                hasLinkedTail: true
            },
            {
                indexFrom: 0,
                indexTo: 1,
                heightDiff: 0,
                linkedHead: 0,
                offsetTopDiff: 0,
                hasLinkedTail: true
            },
            {
                indexFrom: 0,
                indexTo: 1,
                heightDiff: 50,
                linkedHead: 0,
                offsetTopDiff: 0,
                hasLinkedTail: false
            }
        ]);

        expect(getTiles(
            [{
                index: 1,
                height: 350
            }],
            3,
            30,
            100
        )).to.be.deep.equal([
            {
                indexFrom: 0,
                indexTo: 2,
                heightDiff: 0,
                linkedHead: -1,
                offsetTopDiff: 0,
                hasLinkedTail: true   
            },
            {
                indexFrom: 1,
                indexTo: 2,
                heightDiff: 0,
                linkedHead: 0,
                offsetTopDiff: 0,
                hasLinkedTail: true
            },
            {
                indexFrom: 1,
                indexTo: 2,
                heightDiff: 0,
                linkedHead: 0,
                offsetTopDiff: 0,
                hasLinkedTail: true
            },
            {
                indexFrom: 1,
                indexTo: 3,
                heightDiff: 0,
                linkedHead: 0,
                offsetTopDiff: 0,
                hasLinkedTail: true
            },
            {
                indexFrom: 2,
                indexTo: 3,
                heightDiff: 90,
                linkedHead: 3,
                offsetTopDiff: 0,
                hasLinkedTail: false
            }
        ]);
    });
});