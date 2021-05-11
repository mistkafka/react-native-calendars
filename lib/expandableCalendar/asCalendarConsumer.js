function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { Component } from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';
import CalendarContext from './calendarContext';

function asCalendarConsumer(WrappedComponent) {
  class CalendarConsumer extends Component {
    render() {
      return /*#__PURE__*/React.createElement(CalendarContext.Consumer, null, context => /*#__PURE__*/React.createElement(WrappedComponent, _extends({
        ref: r => this.contentRef = r,
        context: context
      }, this.props)));
    }

  }

  hoistNonReactStatic(CalendarConsumer, WrappedComponent);
  return CalendarConsumer;
}

export default asCalendarConsumer;