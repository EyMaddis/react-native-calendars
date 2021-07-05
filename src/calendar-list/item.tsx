import memoize from 'memoize-one';
import React, {Component} from 'react';
import {Text, View} from 'react-native';

// @ts-expect-error
import {extractComponentProps} from '../component-updater';

// @ts-expect-error
import Calendar, {CalendarProps} from '../calendar';
import styleConstructor from './style';

export type CalendarListProps = CalendarProps & {
  item: any;
  calendarWidth: number;
  calendarHeight: number;
  horizontal: boolean;
  theme: any;
}

type CalendarListState = {
  hideArrows: boolean;
  hideExtraDays: boolean;
}

class CalendarListItem extends Component<CalendarListProps, CalendarListState> {
  static displayName = 'IGNORE';

  static defaultProps = {
    hideArrows: true,
    hideExtraDays: true
  };

  style: any;

  constructor(props: CalendarListProps) {
    super(props);

    this.style = styleConstructor(props.theme);
  }

  shouldComponentUpdate(nextProps: CalendarListProps) {
    const r1 = this.props.item;
    const r2 = nextProps.item;

    return r1.toString('yyyy MM') !== r2.toString('yyyy MM') || !!(r2.propbump && r2.propbump !== r1.propbump);
  }

  onPressArrowLeft = (_: any, month: any) => {
    const {onPressArrowLeft, scrollToMonth} = this.props;
    const monthClone = month.clone();

    if (onPressArrowLeft) {
      onPressArrowLeft(_, monthClone);
    } else if (scrollToMonth) {
      const currentMonth = monthClone.getMonth();
      monthClone.addMonths(-1);

      // Make sure we actually get the previous month, not just 30 days before currentMonth.
      while (monthClone.getMonth() === currentMonth) {
        monthClone.setDate(monthClone.getDate() - 1);
      }

      scrollToMonth(monthClone);
    }
  };

  onPressArrowRight = (_: any, month: any) => {
    const {onPressArrowRight, scrollToMonth} = this.props;
    const monthClone = month.clone();

    if (onPressArrowRight) {
      onPressArrowRight(_, monthClone);
    } else if (scrollToMonth) {
      monthClone.addMonths(1);
      scrollToMonth(monthClone);
    }
  };

  getCalendarStyle = memoize((width, height, style) => {
    return [{width, height}, this.style.calendar, style];
  });

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
      onPressArrowRight,
      context
    } = this.props;
    const calendarProps = extractComponentProps(Calendar, this.props);
    const calStyle = this.getCalendarStyle(calendarWidth, calendarHeight, style);

    if (item.getTime) {
      return (
        <Calendar
          {...calendarProps}
          testID={testID}
          current={item}
          style={calStyle}
          headerStyle={horizontal ? headerStyle : undefined}
          disableMonthChange
          onPressArrowLeft={horizontal ? this.onPressArrowLeft : onPressArrowLeft}
          onPressArrowRight={horizontal ? this.onPressArrowRight : onPressArrowRight}
          context={context}
        />
      );
    } else {
      const text = item.toString();

      return (
        <View style={[{height: calendarHeight, width: calendarWidth}, this.style.placeholder]}>
          <Text allowFontScaling={false} style={this.style.placeholderText}>
            {text}
          </Text>
        </View>
      );
    }
  }
}

export default CalendarListItem;