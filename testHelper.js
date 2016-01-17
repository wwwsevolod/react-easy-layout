import React from 'react';
import chai, {expect} from 'chai';
import jsxChai from 'jsx-chai';
import * as TestUtils from 'react-addons-test-utils';

if (typeof global === 'undefined') {
    window.global = window;
}

chai.use(jsxChai);

global.TestUtils = TestUtils;
global.React = React;
global.expect = chai.expect;
global.renderElement = (...args) => {
    const renderer = TestUtils.createRenderer();
    renderer.render(...args);

    return renderer.getRenderOutput();
};
