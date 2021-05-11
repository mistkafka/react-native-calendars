function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import _ from 'lodash';
import XDate from 'xdate';
import React, { Component } from 'react';
import { FlatList, ActivityIndicator, View } from 'react-native';
import { extractComponentProps } from '../../component-updater';
import dateutils from '../../dateutils';
import styleConstructor from './style';
import Reservation from './reservation';

class ReservationList extends Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "onScroll", event => {
      const yOffset = event.nativeEvent.contentOffset.y;

      _.invoke(this.props, 'onScroll', yOffset);

      let topRowOffset = 0;
      let topRow;

      for (topRow = 0; topRow < this.heights.length; topRow++) {
        if (topRowOffset + this.heights[topRow] / 2 >= yOffset) {
          break;
        }

        topRowOffset += this.heights[topRow];
      }

      const row = this.state.reservations[topRow];
      if (!row) return;
      const day = row.day;
      const sameDate = dateutils.sameDate(day, this.selectedDay);

      if (!sameDate && this.scrollOver) {
        this.selectedDay = day.clone();

        _.invoke(this.props, 'onDayChange', day.clone());
      }
    });

    _defineProperty(this, "onMoveShouldSetResponderCapture", () => {
      this.onListTouch();
      return false;
    });

    _defineProperty(this, "renderRow", ({
      item,
      index
    }) => {
      const reservationProps = extractComponentProps(Reservation, this.props);
      return /*#__PURE__*/React.createElement(View, {
        onLayout: this.onRowLayoutChange.bind(this, index)
      }, /*#__PURE__*/React.createElement(Reservation, _extends({}, reservationProps, {
        item: item
      })));
    });

    this.style = styleConstructor(props.theme);
    this.state = {
      reservations: []
    };
    this.heights = [];
    this.selectedDay = props.selectedDay;
    this.scrollOver = true;
  }

  componentDidMount() {
    this.updateDataSource(this.getReservations(this.props).reservations);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (!dateutils.sameDate(prevProps.topDay, this.props.topDay)) {
        this.setState({
          reservations: []
        }, () => this.updateReservations(this.props));
      } else {
        this.updateReservations(this.props);
      }
    }
  }

  updateDataSource(reservations) {
    this.setState({
      reservations
    });
  }

  updateReservations(props) {
    const {
      selectedDay
    } = props;
    const reservations = this.getReservations(props);

    if (this.list && !dateutils.sameDate(selectedDay, this.selectedDay)) {
      let scrollPosition = 0;

      for (let i = 0; i < reservations.scrollPosition; i++) {
        scrollPosition += this.heights[i] || 0;
      }

      this.scrollOver = false;
      this.list.scrollToOffset({
        offset: scrollPosition,
        animated: true
      });
    }

    this.selectedDay = selectedDay;
    this.updateDataSource(reservations.reservations);
  }

  getReservationsForDay(iterator, props) {
    const day = iterator.clone();
    const res = props.reservations[day.toString('yyyy-MM-dd')];

    if (res && res.length) {
      return res.map((reservation, i) => {
        return {
          reservation,
          date: i ? false : day,
          day
        };
      });
    } else if (res) {
      return [{
        date: iterator.clone(),
        day
      }];
    } else {
      return false;
    }
  }

  getReservations(props) {
    const {
      selectedDay,
      showOnlySelectedDayItems
    } = props;

    if (!props.reservations || !selectedDay) {
      return {
        reservations: [],
        scrollPosition: 0
      };
    }

    let reservations = [];

    if (this.state.reservations && this.state.reservations.length) {
      const iterator = this.state.reservations[0].day.clone();

      while (iterator.getTime() < selectedDay.getTime()) {
        const res = this.getReservationsForDay(iterator, props);

        if (!res) {
          reservations = [];
          break;
        } else {
          reservations = reservations.concat(res);
        }

        iterator.addDays(1);
      }
    }

    const scrollPosition = reservations.length;
    const iterator = selectedDay.clone();

    if (showOnlySelectedDayItems) {
      const res = this.getReservationsForDay(iterator, props);

      if (res) {
        reservations = res;
      }

      iterator.addDays(1);
    } else {
      for (let i = 0; i < 31; i++) {
        const res = this.getReservationsForDay(iterator, props);

        if (res) {
          reservations = reservations.concat(res);
        }

        iterator.addDays(1);
      }
    }

    return {
      reservations,
      scrollPosition
    };
  }

  onListTouch() {
    this.scrollOver = true;
  }

  onRowLayoutChange(ind, event) {
    this.heights[ind] = event.nativeEvent.layout.height;
  }

  render() {
    const {
      reservations,
      selectedDay,
      theme,
      style
    } = this.props;

    if (!reservations || !reservations[selectedDay.toString('yyyy-MM-dd')]) {
      if (_.isFunction(this.props.renderEmptyData)) {
        return _.invoke(this.props, 'renderEmptyData');
      }

      return /*#__PURE__*/React.createElement(ActivityIndicator, {
        style: this.style.indicator,
        color: theme && theme.indicatorColor
      });
    }

    return /*#__PURE__*/React.createElement(FlatList, {
      ref: c => this.list = c,
      style: style,
      contentContainerStyle: this.style.content,
      data: this.state.reservations,
      renderItem: this.renderRow,
      keyExtractor: (item, index) => String(index),
      showsVerticalScrollIndicator: false,
      scrollEventThrottle: 200,
      onMoveShouldSetResponderCapture: this.onMoveShouldSetResponderCapture,
      onScroll: this.onScroll,
      refreshControl: this.props.refreshControl,
      refreshing: this.props.refreshing,
      onRefresh: this.props.onRefresh,
      onScrollBeginDrag: this.props.onScrollBeginDrag,
      onScrollEndDrag: this.props.onScrollEndDrag,
      onMomentumScrollBegin: this.props.onMomentumScrollBegin,
      onMomentumScrollEnd: this.props.onMomentumScrollEnd
    });
  }

}

_defineProperty(ReservationList, "displayName", 'IGNORE');

_defineProperty(ReservationList, "defaultProps", {
  refreshing: false,
  selectedDay: XDate(true)
});

export default ReservationList;