function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import _ from 'lodash';
import React, { Component } from 'react';
import { SectionList, Text } from 'react-native';
import XDate from 'xdate';
import moment from 'moment';
import dateutils from '../dateutils';
import styleConstructor from './style';
import asCalendarConsumer from './asCalendarConsumer';

const commons = require('./commons');

const UPDATE_SOURCES = commons.UPDATE_SOURCES;
/**
 * @description: AgendaList component
 * @note: Should be wrapped with 'CalendarProvider'
 * @extends: SectionList
 * @example: https://github.com/wix/react-native-calendars/blob/master/example/src/screens/expandableCalendar.js
 */

class AgendaList extends Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "onViewableItemsChanged", ({
      viewableItems
    }) => {
      if (viewableItems && !this.sectionScroll) {
        const topSection = _.get(viewableItems[0], 'section.title');

        if (topSection && topSection !== this._topSection) {
          this._topSection = topSection;

          if (this.didScroll) {
            // to avoid setDate() on first load (while setting the initial context.date value)
            _.invoke(this.props.context, 'setDate', this._topSection, UPDATE_SOURCES.LIST_DRAG);
          }
        }
      }
    });

    _defineProperty(this, "onScroll", event => {
      if (!this.didScroll) {
        this.didScroll = true;
      }

      _.invoke(this.props, 'onScroll', event);
    });

    _defineProperty(this, "onMomentumScrollBegin", event => {
      _.invoke(this.props.context, 'setDisabled', true);

      _.invoke(this.props, 'onMomentumScrollBegin', event);
    });

    _defineProperty(this, "onMomentumScrollEnd", event => {
      // when list momentum ends AND when scrollToSection scroll ends
      this.sectionScroll = false;

      _.invoke(this.props.context, 'setDisabled', false);

      _.invoke(this.props, 'onMomentumScrollEnd', event);
    });

    _defineProperty(this, "onHeaderLayout", ({
      nativeEvent
    }) => {
      this.sectionHeight = nativeEvent.layout.height;
    });

    _defineProperty(this, "renderSectionHeader", ({
      section: {
        title
      }
    }) => {
      const {
        renderSectionHeader,
        dayFormatter,
        dayFormat,
        useMoment,
        markToday,
        sectionStyle
      } = this.props;

      if (renderSectionHeader) {
        return renderSectionHeader(title);
      }

      let sectionTitle = title;

      if (dayFormatter) {
        sectionTitle = dayFormatter(title);
      } else if (dayFormat) {
        if (useMoment) {
          sectionTitle = moment(title).format(dayFormat);
        } else {
          sectionTitle = XDate(title).toString(dayFormat);
        }
      }

      if (markToday) {
        const todayString = XDate.locales[XDate.defaultLocale].today || commons.todayString;
        const isToday = dateutils.sameDate(XDate(), XDate(title));
        sectionTitle = isToday ? `${todayString}, ${sectionTitle}` : sectionTitle;
      }

      return /*#__PURE__*/React.createElement(Text, {
        allowFontScaling: false,
        style: [this.style.sectionText, sectionStyle],
        onLayout: this.onHeaderLayout
      }, sectionTitle);
    });

    _defineProperty(this, "keyExtractor", (item, index) => {
      const {
        keyExtractor
      } = this.props;
      return _.isFunction(keyExtractor) ? keyExtractor(item, index) : String(index);
    });

    this.style = styleConstructor(props.theme);
    this._topSection = _.get(props, 'sections[0].title');
    this.didScroll = false;
    this.sectionScroll = false;
    this.viewabilityConfig = {
      itemVisiblePercentThreshold: 20 // 50 means if 50% of the item is visible

    };
    this.list = /*#__PURE__*/React.createRef();
  }

  getSectionIndex(date) {
    let i;

    _.map(this.props.sections, (section, index) => {
      // NOTE: sections titles should match current date format!!!
      if (section.title === date) {
        i = index;
        return;
      }
    });

    return i;
  }

  componentDidMount() {
    const {
      date
    } = this.props.context;

    if (date !== this._topSection) {
      setTimeout(() => {
        const sectionIndex = this.getSectionIndex(date);
        this.scrollToSection(sectionIndex);
      }, 500);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      updateSource,
      date
    } = this.props.context;

    if (date !== prevProps.context.date) {
      // NOTE: on first init data should set first section to the current date!!!
      if (updateSource !== UPDATE_SOURCES.LIST_DRAG && updateSource !== UPDATE_SOURCES.CALENDAR_INIT) {
        const sectionIndex = this.getSectionIndex(date);
        this.scrollToSection(sectionIndex);
      }
    }
  }

  scrollToSection(sectionIndex) {
    if (this.list.current && sectionIndex !== undefined) {
      this.sectionScroll = true; // to avoid setDate() in onViewableItemsChanged

      this._topSection = this.props.sections[sectionIndex].title;
      this.list.current.scrollToLocation({
        animated: true,
        sectionIndex: sectionIndex,
        itemIndex: 0,
        viewPosition: 0,
        // position at the top
        viewOffset: commons.isAndroid ? this.sectionHeight : 0
      });
    }
  }

  render() {
    return /*#__PURE__*/React.createElement(SectionList, _extends({}, this.props, {
      ref: this.list,
      keyExtractor: this.keyExtractor,
      showsVerticalScrollIndicator: false,
      onViewableItemsChanged: this.onViewableItemsChanged,
      viewabilityConfig: this.viewabilityConfig,
      renderSectionHeader: this.renderSectionHeader,
      onScroll: this.onScroll,
      onMomentumScrollBegin: this.onMomentumScrollBegin,
      onMomentumScrollEnd: this.onMomentumScrollEnd,
      onScrollToIndexFailed: info => {
        console.warn('onScrollToIndexFailed info: ', info);
      } // getItemLayout={this.getItemLayout} // onViewableItemsChanged is not updated when list scrolls!!!

    }));
  } // getItemLayout = (data, index) => {
  //   return {length: commons.screenWidth, offset: commons.screenWidth  * index, index};
  // }


}

_defineProperty(AgendaList, "displayName", 'AgendaList');

_defineProperty(AgendaList, "defaultProps", {
  dayFormat: 'dddd, MMM d',
  stickySectionHeadersEnabled: true,
  markToday: true
});

export default asCalendarConsumer(AgendaList);