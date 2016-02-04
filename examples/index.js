import React from 'react';
import {render} from 'react-dom';
import {Column, Block, Row} from '../src';
import {Cell, Table} from '../src/dom-table';
import 'normalize.css';
import '../src/dom/easy-layout.css';
import './index.css';

render(
    <div className="App">
        <div className="RowExample">
            <Row>
                <Block static={true}>
                    <div className="RowExample__Left">
                    Left
                    </div>
                </Block>
                <Block>
                    <div className="RowExample__Right">
                    Right
                    </div>
                </Block>
            </Row>
        </div>
        <div className="RowExample">
            <Row>
                <Block static={true}>
                    <div className="RowExample__Left">
                    Left
                    </div>
                </Block>
                <Block>
                    <div className="RowExample__Right">
                    Right
                    </div>
                </Block>
                <Block static={true}>
                    <div className="RowExample__Left">
                    Left
                    </div>
                </Block>
                <Block static={true}>
                    <div className="RowExample__Left">
                    Left
                    </div>
                </Block>
            </Row>
        </div>
        <div className="RowExample">
            <Row height="100%" fix={false}>
                <Block static={true}>
                    <div className="RowExample__Left">
                    Left
                    </div>
                </Block>
                <Block alignSelf={Block.TO_END}>
                    <div className="RowExample__Right">
                    Right
                    </div>
                </Block>
                <Block static={true}>
                    <div className="RowExample__Left">
                    Left
                    </div>
                </Block>
                <Block static={true}>
                    <div className="RowExample__Left">
                    Left
                    </div>
                </Block>
            </Row>
        </div>
        <div className="RowExample">
            <Row height="100%">
                <Column>
                    <Block static={true}>
                        <div className="RowExample__Left">
                            Left
                        </div>
                    </Block>
                    <Block alignSelf={Block.TO_END}>
                        <div className="RowExample__Right">
                            Right
                        </div>
                    </Block>
                    <Block static={true}>
                        <div className="RowExample__Left">
                            Left
                        </div>
                    </Block>
                    <Block static={true}>
                        <div className="RowExample__Left">
                            Left
                        </div>
                    </Block>
                </Column>
            </Row>
        </div>
        <div className="TableExample">
            <Table
                rowHeight={30}
                rowsCount={100000}
                rowClassNameGetter={(index) => index % 2 ? 'odd' : 'even'}

                header={() => <Row
                    key="__header__"
                >
                    <Block static={true} width="100px">
                        ID
                    </Block>
                    <Block static={true} width="200px">
                        ID1
                    </Block>
                    <Block static={true} width="100px">
                        ID2
                    </Block>
                    <Block>
                        ID3
                    </Block>
                    <Block static={true} width="100px">
                        ID
                    </Block>
                    <Block static={true} width="200px">
                        ID1
                    </Block>
                    <Block static={true} width="100px">
                        ID2
                    </Block>
                    <Block>
                        ID3
                    </Block>
                </Row>}

                row={({rowIndex}) => <Row
                    key={'row' + rowIndex}
                    height="30px"
                >
                    <Block static={true} width="100px">
                        id: {rowIndex}
                    </Block>
                    <Block static={true} width="200px">
                        count: {Math.floor(rowIndex * 1000)}
                    </Block>
                    <Block static={true} width="100px">
                        asd: {rowIndex + 100500}
                    </Block>
                    <Block>
                        isOdd: {rowIndex % 2 !== 0 ? 'true' : 'false'}
                    </Block>
                    <Block static={true} width="100px">
                        id: {rowIndex}
                    </Block>
                    <Block static={true} width="200px">
                        count: {Math.floor(rowIndex * 1000)}
                    </Block>
                    <Block static={true} width="100px">
                        asd: {rowIndex + 100500}
                    </Block>
                    <Block>
                        isOdd: {rowIndex % 2 !== 0 ? 'true' : 'false'}
                    </Block>
                </Row>}

                footer={() => <Row
                    key="__footer__"
                >
                    <Block static={true} width="100px">
                        footer
                    </Block>
                    <Block static={true} width="200px">
                        footer1
                    </Block>
                    <Block static={true} width="100px">
                        footer2
                    </Block>
                    <Block>
                        footer3
                    </Block>
                    <Block static={true} width="100px">
                        footer
                    </Block>
                    <Block static={true} width="200px">
                        footer1
                    </Block>
                    <Block static={true} width="100px">
                        footer2
                    </Block>
                    <Block>
                        footer3
                    </Block>
                </Row>}
            />
        </div>
    </div>,
    document.querySelector('#app')
);
