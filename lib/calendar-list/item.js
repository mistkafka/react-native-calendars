function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { extractComponentProps } from '../component-updater';
import Calendar from '../calendar';
import styleConstructor from './style';

class CalendarListItem extends Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "onPressArrowLeft", (_, month) => {
      const {
        onPressArrowLeft,
        scrollToMonth
      } = this.props;
      const monthClone = month.clone();

      if (onPressArrowLeft) {
        onPressArrowLeft(_, monthClone);
      } else if (scrollToMonth) {
        const currentMonth = monthClone.getMonth();
        monthClone.addMonths(-1); // Make sure we actually get the previous month, not just 30 days before currentMonth.

        while (monthClone.getMonth() === currentMonth) {
          monthClone.setDate(monthClone.getDate() - 1);
        }

        scrollToMonth(monthClone);
      }
    });

    _defineProperty(this, "onPressArrowRight", (_, month) => {
      const {
        onPressArrowRight,
        scrollToMonth
      } = this.props;
      const monthClone = month.clone();

      if (onPressArrowRight) {
        onPressArrowRight(_, monthClone);
      } else if (scrollToMonth) {
        monthClone.addMonths(1);
        scrollToMonth(monthClone);
      }
    });

    this.style = styleConstructor(props.theme);
  }

  shouldComponentUpdate(nextProps) {
    const r1 = this.props.item;
    const r2 = nextProps.item;
    return r1.toString('yyyy MM') !== r2.toString('yyyy MM') || !!(r2.propbump && r2.propbump !== r1.propbump);
  }

  render() {
    const {
      item,
      horizontal,
      calendarHeight,
      calendarWidth,
      testID,
      style,
      headerStyle,
      onPressArrowLeft,
      onPressArrowRight
    } = this.props;
    const calendarProps = extractComponentProps(Calendar, this.props);

    if (item.getTime) {
      return /*#__PURE__*/React.createElement(Calendar, _extends({}, calendarProps, {
        testID: testID,
        current: item,
        style: [{
          height: calendarHeight,
          width: calendarWidth
        }, this.style.calendar, style],
        headerStyle: horizontal ? headerStyle : undefined,
        disableMonthChange: true,
        onPressArrowLeft: horizontal ? this.onPressArrowLeft : onPressArrowLeft,
        onPressArrowRight: horizontal ? this.onPressArrowRight : onPressArrowRight
      }));
    } else {
      const text = item.toString();
      return /*#__PURE__*/React.createElement(View, {
        style: [{
          height: calendarHeight,
          width: calendarWidth
        }, this.style.placeholder]
      }, /*#__PURE__*/React.createElement(Text, {
        allowFontScaling: false,
        style: this.style.placeholderText
      }, text));
    }
  }

}

_defineProperty(CalendarListItem, "displayName", 'IGNORE');

_defineProperty(CalendarListItem, "defaultProps", {
  hideArrows: true,
  hideExtraDays: true
});

export default CalendarListItem;