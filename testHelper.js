import React from 'react';
import chai, {expect} from 'chai';
import chaiEnzyme from 'chai-enzyme';
import * as TestUtils from 'react-addons-test-utils';
import {mount, render, shallow} from 'enzyme';

if (typeof global === 'undefined') {
    window.global = window;
}

chai.use(chaiEnzyme());

global.TestUtils = TestUtils;
global.React = React;
global.expect = chai.expect;
global.renderElement = shallow;
