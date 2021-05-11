function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import React, { Component } from 'react';
import { View } from 'react-native';
import { shouldUpdate, extractComponentProps } from '../../../component-updater';
import styleConstructor from './style';
import Dot from '../dot';
const MARKING_TYPES = {
  dot: 'dot',
  multiDot: 'multi-dot',
  period: 'period',
  multiPeriod: 'multi-period',
  custom: 'custom'
};
export default class Marking extends Component {
  constructor(props) {
    super(props);
    this.style = styleConstructor(props.theme);
  }

  shouldComponentUpdate(nextProps) {
    return shouldUpdate(this.props, nextProps, ['type', 'selected', 'marked', 'today', 'disabled', 'disableTouchEvent', 'activeOpacity', 'selectedColor', 'selectedTextColor', 'dotColor', 'dots', 'periods']);
  }

  getItems(items) {
    const {
      type
    } = this.props;

    if (items && Array.isArray(items) && items.length > 0) {
      // Filter out items so that we process only those which have color property
      const validItems = items.filter(d => d && d.color);
      return validItems.map((item, index) => {
        return type === MARKING_TYPES.multiDot ? this.renderDot(index, item) : this.renderPeriod(index, item);
      });
    }
  }

  renderMarkingByType() {
    const {
      type,
      dots,
      periods
    } = this.props;

    switch (type) {
      case MARKING_TYPES.multiDot:
        return this.renderMultiMarkings(this.style.dots, dots);

      case MARKING_TYPES.multiPeriod:
        return this.renderMultiMarkings(this.style.periods, periods);

      default:
        return this.renderDot();
    }
  }

  renderMultiMarkings(containerStyle, items) {
    return /*#__PURE__*/React.createElement(View, {
      style: containerStyle
    }, this.getItems(items));
  }

  renderPeriod(index, item) {
    const {
      color,
      startingDay,
      endingDay
    } = item;
    const style = [this.style.period, {
      backgroundColor: color
    }];

    if (startingDay) {
      style.push(this.style.startingDay);
    }

    if (endingDay) {
      style.push(this.style.endingDay);
    }

    return /*#__PURE__*/React.createElement(View, {
      key: index,
      style: style
    });
  }

  renderDot(index, item) {
    const {
      selected,
      dotColor
    } = this.props;
    const dotProps = extractComponentProps(Dot, this.props);
    let key = index;
    let color = dotColor;

    if (item) {
      if (item.key) {
        key = item.key;
      }

      color = selected && item.selectedDotColor ? item.selectedDotColor : item.color;
    }

    return /*#__PURE__*/React.createElement(Dot, _extends({}, dotProps, {
      key: key,
      color: color
    }));
  }

  render() {
    return this.renderMarkingByType();
  }

}

_defineProperty(Marking, "displayName", 'IGNORE');

_defineProperty(Marking, "markingTypes", MARKING_TYPES);