function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import _ from 'lodash';
import XDate from 'xdate';
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { xdateToData } from '../../interface';
import dateutils from '../../dateutils';
import { RESERVATION_DATE } from '../../testIDs';
import styleConstructor from './style';

class Reservation extends Component {
  constructor(props) {
    super(props);
    this.style = styleConstructor(props.theme);
  }

  shouldComponentUpdate(nextProps) {
    const r1 = this.props.item;
    const r2 = nextProps.item;
    let changed = true;

    if (!r1 && !r2) {
      changed = false;
    } else if (r1 && r2) {
      if (r1.day.getTime() !== r2.day.getTime()) {
        changed = true;
      } else if (!r1.reservation && !r2.reservation) {
        changed = false;
      } else if (r1.reservation && r2.reservation) {
        if (!r1.date && !r2.date || r1.date && r2.date) {
          if (_.isFunction(this.props.rowHasChanged)) {
            changed = this.props.rowHasChanged(r1.reservation, r2.reservation);
          }
        }
      }
    }

    return changed;
  }

  renderDate(date, item) {
    if (_.isFunction(this.props.renderDay)) {
      return this.props.renderDay(date ? xdateToData(date) : undefined, item);
    }

    const today = dateutils.sameDate(date, XDate()) ? this.style.today : undefined;

    if (date) {
      return /*#__PURE__*/React.createElement(View, {
        style: this.style.day,
        testID: RESERVATION_DATE
      }, /*#__PURE__*/React.createElement(Text, {
        allowFontScaling: false,
        style: [this.style.dayNum, today]
      }, date.getDate()), /*#__PURE__*/React.createElement(Text, {
        allowFontScaling: false,
        style: [this.style.dayText, today]
      }, XDate.locales[XDate.defaultLocale].dayNamesShort[date.getDay()]));
    } else {
      return /*#__PURE__*/React.createElement(View, {
        style: this.style.day
      });
    }
  }

  render() {
    const {
      reservation,
      date
    } = this.props.item;
    let content;

    if (reservation) {
      const firstItem = date ? true : false;

      if (_.isFunction(this.props.renderItem)) {
        content = this.props.renderItem(reservation, firstItem);
      }
    } else if (_.isFunction(this.props.renderEmptyDate)) {
      content = this.props.renderEmptyDate(date);
    }

    return /*#__PURE__*/React.createElement(View, {
      style: this.style.container
    }, this.renderDate(date, reservation), /*#__PURE__*/React.createElement(View, {
      style: this.style.innerContainer
    }, content));
  }

}

_defineProperty(Reservation, "displayName", 'IGNORE');

export default Reservation;