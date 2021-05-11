function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import _ from 'lodash';
import XDate from 'xdate';
import React, { Component } from 'react';
import { View } from 'react-native';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import dateutils from '../dateutils';
import { xdateToData, parseDate } from '../interface';
import shouldComponentUpdate from './updater';
import { extractComponentProps } from '../component-updater';
import { WEEK_NUMBER } from '../testIDs';
import styleConstructor from './style';
import CalendarHeader from './header';
import BasicDay from './day/basic';
import Day from './day/index';
const EmptyArray = [];
/**
 * @description: Calendar component
 * @example: https://github.com/wix/react-native-calendars/blob/master/example/src/screens/calendars.js
 * @gif: https://github.com/wix/react-native-calendars/blob/master/demo/calendar.gif
 */

class Calendar extends Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "addMonth", count => {
      this.updateMonth(this.state.currentMonth.clone().addMonths(count, true));
    });

    _defineProperty(this, "updateMonth", (day, doNotTriggerListeners) => {
      if (day.toString('yyyy MM') === this.state.currentMonth.toString('yyyy MM')) {
        return;
      }

      this.setState({
        currentMonth: day.clone()
      }, () => {
        if (!doNotTriggerListeners) {
          const currMont = this.state.currentMonth.clone();

          _.invoke(this.props, 'onMonthChange', xdateToData(currMont));

          _.invoke(this.props, 'onVisibleMonthsChange', [xdateToData(currMont)]);
        }
      });
    });

    _defineProperty(this, "pressDay", date => {
      this._handleDayInteraction(date, this.props.onDayPress);
    });

    _defineProperty(this, "longPressDay", date => {
      this._handleDayInteraction(date, this.props.onDayLongPress);
    });

    _defineProperty(this, "onSwipe", gestureName => {
      const {
        SWIPE_UP,
        SWIPE_DOWN,
        SWIPE_LEFT,
        SWIPE_RIGHT
      } = swipeDirections;

      switch (gestureName) {
        case SWIPE_UP:
        case SWIPE_DOWN:
          break;

        case SWIPE_LEFT:
          this.onSwipeLeft();
          break;

        case SWIPE_RIGHT:
          this.onSwipeRight();
          break;
      }
    });

    _defineProperty(this, "onSwipeLeft", () => {
      this.header.onPressRight();
    });

    _defineProperty(this, "onSwipeRight", () => {
      this.header.onPressLeft();
    });

    this.style = styleConstructor(props.theme);
    this.state = {
      currentMonth: props.current ? parseDate(props.current) : XDate()
    };
    this.shouldComponentUpdate = shouldComponentUpdate;
  }

  _handleDayInteraction(date, interaction) {
    const {
      disableMonthChange
    } = this.props;
    const day = parseDate(date);
    const minDate = parseDate(this.props.minDate);
    const maxDate = parseDate(this.props.maxDate);

    if (!(minDate && !dateutils.isGTE(day, minDate)) && !(maxDate && !dateutils.isLTE(day, maxDate))) {
      const shouldUpdateMonth = disableMonthChange === undefined || !disableMonthChange;

      if (shouldUpdateMonth) {
        this.updateMonth(day);
      }

      if (interaction) {
        interaction(xdateToData(day));
      }
    }
  }

  getDateMarking(day) {
    const {
      markedDates
    } = this.props;

    if (!markedDates) {
      return false;
    }

    const dates = markedDates[day.toString('yyyy-MM-dd')] || EmptyArray;

    if (dates.length || dates) {
      return dates;
    } else {
      return false;
    }
  }

  getState(day) {
    const {
      disabledByDefault
    } = this.props;
    const minDate = parseDate(this.props.minDate);
    const maxDate = parseDate(this.props.maxDate);
    let state = '';

    if (disabledByDefault) {
      state = 'disabled';
    } else if (dateutils.isDateNotInTheRange(minDate, maxDate, day)) {
      state = 'disabled';
    } else if (!dateutils.sameMonth(day, this.state.currentMonth)) {
      state = 'disabled';
    } else if (dateutils.sameDate(day, XDate())) {
      state = 'today';
    }

    return state;
  }

  renderWeekNumber(weekNumber) {
    return /*#__PURE__*/React.createElement(View, {
      style: this.style.dayContainer,
      key: `week-container-${weekNumber}`
    }, /*#__PURE__*/React.createElement(BasicDay, {
      key: `week-${weekNumber}`,
      marking: {
        disableTouchEvent: true
      },
      state: "disabled",
      theme: this.props.theme,
      testID: `${WEEK_NUMBER}-${weekNumber}`
    }, weekNumber));
  }

  renderDay(day, id) {
    const {
      hideExtraDays
    } = this.props;
    const dayProps = extractComponentProps(Day, this.props);

    if (!dateutils.sameMonth(day, this.state.currentMonth) && hideExtraDays) {
      return /*#__PURE__*/React.createElement(View, {
        key: id,
        style: this.style.emptyDayContainer
      });
    }

    return /*#__PURE__*/React.createElement(View, {
      style: this.style.dayContainer,
      key: id
    }, /*#__PURE__*/React.createElement(Day, _extends({}, dayProps, {
      day: day,
      state: this.getState(day),
      marking: this.getDateMarking(day),
      onPress: this.pressDay,
      onLongPress: this.longPressDay
    })));
  }

  renderWeek(days, id) {
    const week = [];
    days.forEach((day, id2) => {
      week.push(this.renderDay(day, id2));
    }, this);

    if (this.props.showWeekNumbers) {
      week.unshift(this.renderWeekNumber(days[days.length - 1].getWeek()));
    }

    return /*#__PURE__*/React.createElement(View, {
      style: this.style.week,
      key: id
    }, week);
  }

  renderMonth() {
    const {
      currentMonth
    } = this.state;
    const {
      firstDay,
      showSixWeeks,
      hideExtraDays
    } = this.props;
    const shouldShowSixWeeks = showSixWeeks && !hideExtraDays;
    const days = dateutils.page(currentMonth, firstDay, shouldShowSixWeeks);
    const weeks = [];

    while (days.length) {
      weeks.push(this.renderWeek(days.splice(0, 7), weeks.length));
    }

    return /*#__PURE__*/React.createElement(View, {
      style: this.style.monthView
    }, weeks);
  }

  renderHeader() {
    const {
      customHeader,
      headerStyle,
      displayLoadingIndicator,
      markedDates,
      testID
    } = this.props;
    const current = parseDate(this.props.current);
    let indicator;

    if (current) {
      const lastMonthOfDay = current.clone().addMonths(1, true).setDate(1).addDays(-1).toString('yyyy-MM-dd');

      if (displayLoadingIndicator && !(markedDates && markedDates[lastMonthOfDay])) {
        indicator = true;
      }
    }

    const headerProps = extractComponentProps(CalendarHeader, this.props);
    const props = { ...headerProps,
      testID: testID,
      style: headerStyle,
      ref: c => this.header = c,
      month: this.state.currentMonth,
      addMonth: this.addMonth,
      displayLoadingIndicator: indicator
    };
    const CustomHeader = customHeader;
    const HeaderComponent = customHeader ? CustomHeader : CalendarHeader;
    return /*#__PURE__*/React.createElement(HeaderComponent, props);
  }

  render() {
    const {
      enableSwipeMonths,
      style
    } = this.props;
    const GestureComponent = enableSwipeMonths ? GestureRecognizer : View;
    const gestureProps = enableSwipeMonths ? {
      onSwipe: (direction, state) => this.onSwipe(direction, state)
    } : {};
    return /*#__PURE__*/React.createElement(GestureComponent, gestureProps, /*#__PURE__*/React.createElement(View, {
      style: [this.style.container, style],
      accessibilityElementsHidden: this.props.accessibilityElementsHidden // iOS
      ,
      importantForAccessibility: this.props.importantForAccessibility // Android

    }, this.renderHeader(), this.renderMonth()));
  }

}

_defineProperty(Calendar, "displayName", 'Calendar');

_defineProperty(Calendar, "defaultProps", {
  enableSwipeMonths: false
});

export default Calendar;