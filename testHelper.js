import React from 'react';
import chai, {expect} from 'chai';
import chaiEnzyme from 'chai-enzyme';
import * as TestUtils from 'react-addons-test-utils';
import {mount, render, shallow} from 'enzyme';
import {jsdom} from 'jsdom';

const exposedProperties = ['window', 'navigator', 'document'];

if (typeof global === 'undefined') {
    window.global = window;
}

if (!global.window) {
    global.document = jsdom('');
    global.window = document.defaultView;
    Object.keys(document.defaultView).forEach((property) => {
        if (typeof global[property] === 'undefined') {
            exposedProperties.push(property);
            global[property] = document.defaultView[property];
        }
    });

    global.navigator = {
        userAgent: 'node.js'
    };
}

global.React = React;
global.mount = mount;
global.render = render;
global.shallow = shallow;
global.renderElement = shallow;
global.TestUtils = TestUtils;
global.expect = expect;

chai.use(chaiEnzyme());
