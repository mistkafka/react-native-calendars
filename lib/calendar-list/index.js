function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import _ from 'lodash';
import XDate from 'xdate';
import React, { Component } from 'react';
import { FlatList, Platform, Dimensions, View } from 'react-native';
import { extractComponentProps } from '../component-updater';
import { xdateToData, parseDate } from '../interface';
import dateutils from '../dateutils';
import { STATIC_HEADER } from '../testIDs';
import styleConstructor from './style';
import CalendarListItem from './item';
import CalendarHeader from '../calendar/header/index';
const {
  width
} = Dimensions.get('window');
/**
 * @description: Calendar List component for both vertical and horizontal calendars
 * @extends: Calendar
 * @extendslink: docs/Calendar
 * @example: https://github.com/wix/react-native-calendars/blob/master/example/src/screens/calendarsList.js
 * @gif: https://github.com/wix/react-native-calendars/blob/master/demo/calendar-list.gif
 */

class CalendarList extends Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "scrollToMonth", m => {
      const {
        horizontal,
        calendarHeight,
        calendarWidth,
        pastScrollRange
      } = this.props;
      const month = parseDate(m);
      const scrollTo = month || this.state.openDate;
      let diffMonths = Math.round(this.state.openDate.clone().setDate(1).diffMonths(scrollTo.clone().setDate(1)));
      const size = horizontal ? calendarWidth : calendarHeight;
      const scrollAmount = size * pastScrollRange + diffMonths * size;
      this.listView.scrollToOffset({
        offset: scrollAmount,
        animated: false
      });
    });

    _defineProperty(this, "getItemLayout", (data, index) => {
      const {
        horizontal,
        calendarHeight,
        calendarWidth
      } = this.props;
      return {
        length: horizontal ? calendarWidth : calendarHeight,
        offset: (horizontal ? calendarWidth : calendarHeight) * index,
        index
      };
    });

    _defineProperty(this, "addMonth", count => {
      this.updateMonth(this.state.currentMonth.clone().addMonths(count, true));
    });

    _defineProperty(this, "onViewableItemsChanged", ({
      viewableItems
    }) => {
      function rowIsCloseToViewable(index, distance) {
        for (let i = 0; i < viewableItems.length; i++) {
          if (Math.abs(index - parseInt(viewableItems[i].index)) <= distance) {
            return true;
          }
        }

        return false;
      }

      const rowclone = this.state.rows;
      const newrows = [];
      const visibleMonths = [];

      for (let i = 0; i < rowclone.length; i++) {
        let val = rowclone[i];
        const rowShouldBeRendered = rowIsCloseToViewable(i, 1);

        if (rowShouldBeRendered && !rowclone[i].getTime) {
          val = this.state.openDate.clone().addMonths(i - this.props.pastScrollRange, true);
        } else if (!rowShouldBeRendered) {
          val = this.state.texts[i];
        }

        newrows.push(val);

        if (rowIsCloseToViewable(i, 0)) {
          visibleMonths.push(xdateToData(val));
        }
      }

      _.invoke(this.props, 'onVisibleMonthsChange', visibleMonths);

      this.setState({
        rows: newrows,
        currentMonth: parseDate(visibleMonths[0])
      });
    });

    _defineProperty(this, "renderItem", ({
      item
    }) => {
      const {
        calendarStyle,
        horizontal,
        calendarWidth,
        testID,
        ...others
      } = this.props;
      return /*#__PURE__*/React.createElement(CalendarListItem, _extends({}, others, {
        item: item,
        testID: `${testID}_${item}`,
        style: calendarStyle,
        calendarWidth: horizontal ? calendarWidth : undefined,
        scrollToMonth: this.scrollToMonth
      }));
    });

    this.style = styleConstructor(props.theme);
    this.viewabilityConfig = {
      itemVisiblePercentThreshold: 20
    };
    const rows = [];
    const texts = [];
    const date = parseDate(props.current) || XDate();

    for (let i = 0; i <= props.pastScrollRange + props.futureScrollRange; i++) {
      const rangeDate = date.clone().addMonths(i - props.pastScrollRange, true);
      const rangeDateStr = rangeDate.toString('MMM yyyy');
      texts.push(rangeDateStr);
      /*
       * This selects range around current shown month [-0, +2] or [-1, +1] month for detail calendar rendering.
       * If `this.pastScrollRange` is `undefined` it's equal to `false` or 0 in next condition.
       */

      if (props.pastScrollRange - 1 <= i && i <= props.pastScrollRange + 1 || !props.pastScrollRange && i <= props.pastScrollRange + 2) {
        rows.push(rangeDate);
      } else {
        rows.push(rangeDateStr);
      }
    }

    this.state = {
      rows,
      texts,
      openDate: date,
      currentMonth: parseDate(props.current)
    };
  }

  componentDidUpdate(prevProps) {
    const prevCurrent = parseDate(prevProps.current);
    const current = parseDate(this.props.current);

    if (current && prevCurrent && current.getTime() !== prevCurrent.getTime()) {
      this.scrollToMonth(current);
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const rowclone = prevState.rows;
    const newrows = [];

    for (let i = 0; i < rowclone.length; i++) {
      let val = prevState.texts[i];

      if (rowclone[i].getTime) {
        val = rowclone[i].clone();
        val.propbump = rowclone[i].propbump ? rowclone[i].propbump + 1 : 1;
      }

      newrows.push(val);
    }

    return {
      rows: newrows
    };
  }

  scrollToDay(d, offset, animated) {
    const {
      horizontal,
      calendarHeight,
      calendarWidth,
      pastScrollRange,
      firstDay
    } = this.props;
    const day = parseDate(d);
    const diffMonths = Math.round(this.state.openDate.clone().setDate(1).diffMonths(day.clone().setDate(1)));
    const size = horizontal ? calendarWidth : calendarHeight;
    let scrollAmount = size * pastScrollRange + diffMonths * size + (offset || 0);

    if (!horizontal) {
      let week = 0;
      const days = dateutils.page(day, firstDay);

      for (let i = 0; i < days.length; i++) {
        week = Math.floor(i / 7);

        if (dateutils.sameDate(days[i], day)) {
          scrollAmount += 46 * week;
          break;
        }
      }
    }

    this.listView.scrollToOffset({
      offset: scrollAmount,
      animated
    });
  }

  getMonthIndex(month) {
    let diffMonths = this.state.openDate.diffMonths(month) + this.props.pastScrollRange;
    return diffMonths;
  }

  updateMonth(day, doNotTriggerListeners) {
    if (day.toString('yyyy MM') === this.state.currentMonth.toString('yyyy MM')) {
      return;
    }

    this.setState({
      currentMonth: day.clone()
    }, () => {
      this.scrollToMonth(this.state.currentMonth);

      if (!doNotTriggerListeners) {
        const currMont = this.state.currentMonth.clone();

        _.invoke(this.props, 'onMonthChange', xdateToData(currMont));

        _.invoke(this.props, 'onVisibleMonthsChange', [xdateToData(currMont)]);
      }
    });
  }

  renderStaticHeader() {
    const {
      staticHeader,
      horizontal,
      headerStyle
    } = this.props;
    const useStaticHeader = staticHeader && horizontal;
    const headerProps = extractComponentProps(CalendarHeader, this.props);

    if (useStaticHeader) {
      return /*#__PURE__*/React.createElement(CalendarHeader, _extends({}, headerProps, {
        testID: STATIC_HEADER,
        style: [this.style.staticHeader, headerStyle],
        month: this.state.currentMonth,
        addMonth: this.addMonth,
        accessibilityElementsHidden: true // iOS
        ,
        importantForAccessibility: 'no-hide-descendants' // Android

      }));
    }
  }

  render() {
    const {
      style,
      pastScrollRange,
      futureScrollRange,
      horizontal,
      showScrollIndicator,
      testID
    } = this.props;
    return /*#__PURE__*/React.createElement(View, null, /*#__PURE__*/React.createElement(FlatList, {
      ref: c => this.listView = c,
      style: [this.style.container, style],
      initialListSize: pastScrollRange + futureScrollRange + 1 // ListView deprecated
      ,
      data: this.state.rows,
      renderItem: this.renderItem,
      getItemLayout: this.getItemLayout,
      onViewableItemsChanged: this.onViewableItemsChanged,
      viewabilityConfig: this.viewabilityConfig,
      initialScrollIndex: this.state.openDate ? this.getMonthIndex(this.state.openDate) : false,
      showsVerticalScrollIndicator: showScrollIndicator,
      showsHorizontalScrollIndicator: horizontal && showScrollIndicator,
      testID: testID,
      onLayout: this.props.onLayout,
      removeClippedSubviews: this.props.removeClippedSubviews,
      pagingEnabled: this.props.pagingEnabled,
      scrollEnabled: this.props.scrollEnabled,
      scrollsToTop: this.props.scrollsToTop,
      horizontal: this.props.horizontal,
      keyboardShouldPersistTaps: this.props.keyboardShouldPersistTaps,
      keyExtractor: this.props.keyExtractor,
      onEndReachedThreshold: this.props.onEndReachedThreshold,
      onEndReached: this.props.onEndReached
    }), this.renderStaticHeader());
  }

}

_defineProperty(CalendarList, "displayName", 'CalendarList');

_defineProperty(CalendarList, "defaultProps", {
  calendarWidth: width,
  calendarHeight: 360,
  pastScrollRange: 50,
  futureScrollRange: 50,
  showScrollIndicator: false,
  horizontal: false,
  scrollsToTop: false,
  scrollEnabled: true,
  removeClippedSubviews: Platform.OS === 'android',
  keyExtractor: (item, index) => String(index)
});

export default CalendarList;