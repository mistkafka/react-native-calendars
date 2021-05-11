function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { ActivityIndicator, Platform, View, Text, TouchableOpacity, Image } from 'react-native';
import { shouldUpdate } from '../../component-updater';
import { weekDayNames } from '../../dateutils';
import { CHANGE_MONTH_LEFT_ARROW, CHANGE_MONTH_RIGHT_ARROW, HEADER_DAY_NAMES, HEADER_LOADING_INDICATOR, HEADER_MONTH_NAME } from '../../testIDs';
import styleConstructor from './style';

class CalendarHeader extends Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "addMonth", () => {
      const {
        addMonth
      } = this.props;
      addMonth(1);
    });

    _defineProperty(this, "subtractMonth", () => {
      const {
        addMonth
      } = this.props;
      addMonth(-1);
    });

    _defineProperty(this, "onPressLeft", () => {
      const {
        onPressArrowLeft,
        month
      } = this.props;

      if (typeof onPressArrowLeft === 'function') {
        return onPressArrowLeft(this.subtractMonth, month);
      }

      return this.subtractMonth();
    });

    _defineProperty(this, "onPressRight", () => {
      const {
        onPressArrowRight,
        month
      } = this.props;

      if (typeof onPressArrowRight === 'function') {
        return onPressArrowRight(this.addMonth, month);
      }

      return this.addMonth();
    });

    _defineProperty(this, "renderWeekDays", weekDaysNames => {
      const {
        disabledDaysIndexes
      } = this.props;
      return weekDaysNames.map((day, idx) => {
        const dayStyle = [this.style.dayHeader];

        if (_.includes(disabledDaysIndexes, idx)) {
          dayStyle.push(this.style.disabledDayHeader);
        }

        return /*#__PURE__*/React.createElement(Text, {
          allowFontScaling: false,
          key: idx,
          style: dayStyle,
          numberOfLines: 1,
          accessibilityLabel: ''
        }, day);
      });
    });

    _defineProperty(this, "renderHeader", () => {
      const {
        renderHeader,
        month,
        monthFormat,
        testID,
        webAriaLevel
      } = this.props;
      const webProps = Platform.OS === 'web' ? {
        'aria-level': webAriaLevel
      } : {};

      if (renderHeader) {
        return renderHeader(month);
      }

      return /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement(Text, _extends({
        allowFontScaling: false,
        style: this.style.monthText,
        testID: testID ? `${HEADER_MONTH_NAME}-${testID}` : HEADER_MONTH_NAME
      }, webProps), month.toString(monthFormat)));
    });

    _defineProperty(this, "onAccessibilityAction", event => {
      switch (event.nativeEvent.actionName) {
        case 'decrement':
          this.onPressLeft();
          break;

        case 'increment':
          this.onPressRight();
          break;

        default:
          break;
      }
    });

    this.style = styleConstructor(props.theme);
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.month.toString('yyyy MM') !== this.props.month.toString('yyyy MM')) {
      return true;
    }

    return shouldUpdate(this.props, nextProps, ['displayLoadingIndicator', 'hideDayNames', 'firstDay', 'showWeekNumbers', 'monthFormat', 'renderArrow', 'disableArrowLeft', 'disableArrowRight']);
  }

  renderArrow(direction) {
    const {
      hideArrows,
      disableArrowLeft,
      disableArrowRight,
      renderArrow,
      testID
    } = this.props;

    if (hideArrows) {
      return /*#__PURE__*/React.createElement(View, null);
    }

    const isLeft = direction === 'left';
    const id = isLeft ? CHANGE_MONTH_LEFT_ARROW : CHANGE_MONTH_RIGHT_ARROW;
    const testId = testID ? `${id}-${testID}` : id;
    const onPress = isLeft ? this.onPressLeft : this.onPressRight;
    const imageSource = isLeft ? require('../img/previous.png') : require('../img/next.png');
    const renderArrowDirection = isLeft ? 'left' : 'right';
    const shouldDisable = isLeft ? disableArrowLeft : disableArrowRight;
    return /*#__PURE__*/React.createElement(TouchableOpacity, {
      onPress: !shouldDisable ? onPress : undefined,
      disabled: shouldDisable,
      style: this.style.arrow,
      hitSlop: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
      },
      testID: testId
    }, renderArrow ? renderArrow(renderArrowDirection) : /*#__PURE__*/React.createElement(Image, {
      source: imageSource,
      style: shouldDisable ? this.style.disabledArrowImage : this.style.arrowImage
    }));
  }

  renderIndicator() {
    const {
      displayLoadingIndicator,
      theme,
      testID
    } = this.props;

    if (displayLoadingIndicator) {
      return /*#__PURE__*/React.createElement(ActivityIndicator, {
        color: theme && theme.indicatorColor,
        testID: testID ? `${HEADER_LOADING_INDICATOR}-${testID}` : HEADER_LOADING_INDICATOR
      });
    }
  }

  renderDayNames() {
    const {
      firstDay,
      hideDayNames,
      showWeekNumbers,
      testID
    } = this.props;
    const weekDaysNames = weekDayNames(firstDay);

    if (!hideDayNames) {
      return /*#__PURE__*/React.createElement(View, {
        style: this.style.week,
        testID: testID ? `${HEADER_DAY_NAMES}-${testID}` : HEADER_DAY_NAMES
      }, showWeekNumbers && /*#__PURE__*/React.createElement(Text, {
        allowFontScaling: false,
        style: this.style.dayHeader
      }), this.renderWeekDays(weekDaysNames));
    }
  }

  render() {
    const {
      style,
      testID
    } = this.props;
    return /*#__PURE__*/React.createElement(View, {
      testID: testID,
      style: style,
      accessible: true,
      accessibilityRole: 'adjustable',
      accessibilityActions: [{
        name: 'increment',
        label: 'increment'
      }, {
        name: 'decrement',
        label: 'decrement'
      }],
      onAccessibilityAction: this.onAccessibilityAction,
      accessibilityElementsHidden: this.props.accessibilityElementsHidden // iOS
      ,
      importantForAccessibility: this.props.importantForAccessibility // Android

    }, /*#__PURE__*/React.createElement(View, {
      style: this.style.header
    }, this.renderArrow('left'), /*#__PURE__*/React.createElement(View, {
      style: this.style.headerContainer
    }, this.renderHeader(), this.renderIndicator()), this.renderArrow('right')), this.renderDayNames());
  }

}

_defineProperty(CalendarHeader, "displayName", 'IGNORE');

_defineProperty(CalendarHeader, "defaultProps", {
  monthFormat: 'MMMM yyyy',
  webAriaLevel: 1
});

export default CalendarHeader;