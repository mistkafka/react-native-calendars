function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { shouldUpdate } from '../../../component-updater';
import styleConstructor from './style';
import Marking from '../marking';
export default class BasicDay extends Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "onPress", () => {
      _.invoke(this.props, 'onPress', this.props.date);
    });

    _defineProperty(this, "onLongPress", () => {
      _.invoke(this.props, 'onLongPress', this.props.date);
    });

    this.style = styleConstructor(props.theme);
  }

  shouldComponentUpdate(nextProps) {
    return shouldUpdate(this.props, nextProps, ['children', 'state', 'markingType', 'marking', 'onPress', 'onLongPress', 'date']);
  }

  get marking() {
    let marking = this.props.marking || {};

    if (marking && marking.constructor === Array && marking.length) {
      marking = {
        marking: true
      };
    }

    return marking;
  }

  shouldDisableTouchEvent() {
    const {
      disableAllTouchEventsForDisabledDays
    } = this.props;
    const {
      disableTouchEvent
    } = this.marking;
    let disableTouch = false;

    if (typeof disableTouchEvent === 'boolean') {
      disableTouch = disableTouchEvent;
    } else if (typeof disableAllTouchEventsForDisabledDays === 'boolean' && this.isDisabled()) {
      disableTouch = disableAllTouchEventsForDisabledDays;
    }

    return disableTouch;
  }

  isDisabled() {
    return typeof this.marking.disabled !== 'undefined' ? this.marking.disabled : this.props.state === 'disabled';
  }

  isToday() {
    return this.props.state === 'today';
  }

  isMultiDot() {
    return this.props.markingType === Marking.markingTypes.multiDot;
  }

  isMultiPeriod() {
    return this.props.markingType === Marking.markingTypes.multiPeriod;
  }

  isCustom() {
    return this.props.markingType === Marking.markingTypes.custom;
  }

  getContainerStyle() {
    const {
      customStyles,
      selected,
      selectedColor
    } = this.props.marking;
    const style = [this.style.base];

    if (selected) {
      style.push(this.style.selected);

      if (selectedColor) {
        style.push({
          backgroundColor: selectedColor
        });
      }
    } else if (this.isToday()) {
      style.push(this.style.today);
    } //Custom marking type


    if (this.isCustom() && customStyles && customStyles.container) {
      if (customStyles.container.borderRadius === undefined) {
        customStyles.container.borderRadius = 16;
      }

      style.push(customStyles.container);
    }

    return style;
  }

  getTextStyle() {
    const {
      customStyles,
      selected,
      selectedTextColor
    } = this.props.marking;
    const style = [this.style.text];

    if (selected) {
      style.push(this.style.selectedText);

      if (selectedTextColor) {
        style.push({
          color: selectedTextColor
        });
      }
    } else if (this.isDisabled()) {
      style.push(this.style.disabledText);
    } else if (this.isToday()) {
      style.push(this.style.todayText);
    } //Custom marking type


    if (this.isCustom() && customStyles && customStyles.text) {
      style.push(customStyles.text);
    }

    return style;
  }

  renderMarking() {
    const {
      theme,
      markingType
    } = this.props;
    const {
      selected,
      marked,
      dotColor,
      dots,
      periods
    } = this.marking;
    return /*#__PURE__*/React.createElement(Marking, {
      type: markingType,
      theme: theme,
      marked: this.isMultiDot() ? true : marked,
      selected: selected,
      disabled: this.isDisabled(),
      today: this.isToday(),
      dotColor: dotColor,
      dots: dots,
      periods: periods
    });
  }

  renderText() {
    return /*#__PURE__*/React.createElement(Text, {
      allowFontScaling: false,
      style: this.getTextStyle()
    }, String(this.props.children));
  }

  renderContent() {
    return /*#__PURE__*/React.createElement(Fragment, null, this.renderText(), this.renderMarking());
  }

  renderContainer() {
    const {
      activeOpacity
    } = this.marking;
    return /*#__PURE__*/React.createElement(TouchableOpacity, {
      testID: this.props.testID,
      style: this.getContainerStyle(),
      disabled: this.shouldDisableTouchEvent(),
      activeOpacity: activeOpacity,
      onPress: !this.shouldDisableTouchEvent() ? this.onPress : undefined,
      onLongPress: !this.shouldDisableTouchEvent() ? this.onLongPress : undefined,
      accessible: true,
      accessibilityRole: this.isDisabled() ? undefined : 'button',
      accessibilityLabel: this.props.accessibilityLabel
    }, this.isMultiPeriod() ? this.renderText() : this.renderContent());
  }

  renderPeriodsContainer() {
    return /*#__PURE__*/React.createElement(View, {
      style: this.style.container
    }, this.renderContainer(), this.renderMarking());
  }

  render() {
    return this.isMultiPeriod() ? this.renderPeriodsContainer() : this.renderContainer();
  }

}

_defineProperty(BasicDay, "displayName", 'IGNORE');