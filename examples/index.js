import React from 'react';
import {render} from 'react-dom';
import {Column, Block, Row} from '../src';
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
            <Row height="100%">
                <Block static={true}>
                    <div className="RowExample__Left">
                        Left
                    </div>
                </Block>
                <Block align={Block.TO_END}>
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
    </div>,
    document.querySelector('#app')
);
