import {PropTypes} from 'react';

import {
    SPACE_BETWEEN,
    SPACE_AROUND,
    CENTER,
    TO_START,
    TO_END,
    BASELINE,
    STRETCH,
    TYPE_COLUMN,
    TYPE_COLUMN_REVERSE,
    TYPE_ROW,
    TYPE_ROW_REVERSE,
    WRAP_NOWRAP,
    WRAP_WRAP,
    AUTO,
    WRAP_REVERSE
} from './constants';

export const alignPropType = PropTypes.oneOf([
    CENTER,
    TO_START,
    TO_END,
    STRETCH,
    BASELINE
]);

export const selfAlignPropType = PropTypes.oneOf([
    CENTER,
    TO_START,
    TO_END,
    STRETCH,
    AUTO,
    BASELINE
]);

export const contentPropType = PropTypes.oneOf([
    SPACE_BETWEEN,
    SPACE_AROUND,
    CENTER,
    TO_START,
    TO_END,
    STRETCH,
    BASELINE
]);

export const justifyPropType = PropTypes.oneOf([
    SPACE_BETWEEN,
    SPACE_AROUND,
    CENTER,
    TO_START,
    TO_END
]);
