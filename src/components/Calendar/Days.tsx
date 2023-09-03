import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import React, { useCallback, useContext } from "react";

import { BG_COLOR, TEXT_COLOR } from "../../constants";
import DatepickerContext from "../../contexts/DatepickerContext";
import {
    nextMonth,
    previousMonth,
    classNames as cn,
    _dayjs,
    isSameYearMonthDay,
    xor
} from "../../helpers";
import { Period } from "../../types";

dayjs.extend(isBetween);

interface Props {
    calendarData: {
        date: dayjs.Dayjs;
        days: {
            previous: number[];
            current: number[];
            next: number[];
        };
    };
    onClickPreviousDays: (day: number) => void;
    onClickDay: (day: number) => void;
    onClickNextDays: (day: number) => void;
}

const Days: React.FC<Props> = ({
    calendarData,
    onClickPreviousDays,
    onClickDay,
    onClickNextDays
}) => {
    // Contexts
    const {
        primaryColor,
        period,
        changePeriod,
        dayHover,
        changeDayHover,
        minDate,
        maxDate,
        disabledDates,
        value
    } = useContext(DatepickerContext);

    // Functions
    const currentDateClass = useCallback(
        (item: number) => {
            const itemDate = `${calendarData.date.year()}-${calendarData.date.month() + 1}-${
                item >= 10 ? item : "0" + item
            }`;
            if (isSameYearMonthDay(itemDate, _dayjs()))
                return TEXT_COLOR["500"][primaryColor as keyof (typeof TEXT_COLOR)["500"]];
            return "";
        },
        [calendarData.date, primaryColor]
    );

    const activeDateData = useCallback(
        (day: number) => {
            const fullDay = `${calendarData.date.year()}-${calendarData.date.month() + 1}-${day}`;
            let className = "";

            const periodSet = period.start || period.end;
            const periodStartRaw = periodSet ? period.start : value?.startDate;
            const periodEndRaw = periodSet ? period.end : value?.endDate;
            const periodStart = periodStartRaw ? _dayjs(periodStartRaw) : null;
            const periodEnd = periodEndRaw ? _dayjs(periodEndRaw) : null;

            if (
                (periodStart &&
                    !periodEnd &&
                    (!dayHover || (dayHover && isSameYearMonthDay(dayHover, periodStart))) &&
                    isSameYearMonthDay(fullDay, periodStart)) ||
                (!periodStart &&
                    periodEnd &&
                    (!dayHover || (dayHover && isSameYearMonthDay(dayHover, periodEnd))) &&
                    isSameYearMonthDay(fullDay, periodEnd)) ||
                (periodStart &&
                    periodEnd &&
                    isSameYearMonthDay(fullDay, periodStart) &&
                    isSameYearMonthDay(fullDay, periodEnd))
            ) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                className = ` ${BG_COLOR["500"][primaryColor]} text-white font-medium rounded-full`;
            } else if (periodStart && isSameYearMonthDay(fullDay, periodStart)) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                className = ` ${BG_COLOR["500"][primaryColor]} text-white font-medium rounded-l-full`;
            } else if (periodEnd && isSameYearMonthDay(fullDay, periodEnd)) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                className = ` ${BG_COLOR["500"][primaryColor]} text-white font-medium rounded-r-full`;
            }
            return {
                active:
                    (periodStart && isSameYearMonthDay(fullDay, periodStart)) ||
                    (periodEnd && isSameYearMonthDay(fullDay, periodEnd)),
                className: className
            };
        },
        [
            calendarData.date,
            dayHover,
            period.end,
            period.start,
            primaryColor,
            value?.endDate,
            value?.startDate
        ]
    );

    const hoverClassByDay = useCallback(
        (day: number) => {
            let className = currentDateClass(day);
            const fullDay = `${calendarData.date.year()}-${calendarData.date.month() + 1}-${
                day >= 10 ? day : "0" + day
            }`;

            const periodSet = period.start || period.end;
            const periodStartRaw = periodSet ? period.start : value?.startDate;
            const periodEndRaw = periodSet ? period.end : value?.endDate;
            const periodStart = periodStartRaw ? _dayjs(periodStartRaw) : null;
            const periodEnd = periodEndRaw ? _dayjs(periodEndRaw) : null;

            if (periodStart && periodEnd) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (
                    _dayjs(fullDay).isBetween(_dayjs(periodStart), _dayjs(periodEnd), "day", "[)")
                ) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    return ` ${BG_COLOR["100"][primaryColor]} ${currentDateClass(
                        day
                    )} dark:bg-white/10`;
                }
            }

            if (!dayHover) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                return className;
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (
                periodStart &&
                !periodEnd &&
                dayHover &&
                _dayjs(fullDay).isBetween(_dayjs(periodStart), _dayjs(dayHover), undefined, "[)")
            ) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                className = ` ${BG_COLOR["100"][primaryColor]} ${currentDateClass(
                    day
                )} dark:bg-white/10`;
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (
                !periodStart &&
                periodEnd &&
                dayHover &&
                _dayjs(fullDay).isBetween(_dayjs(dayHover), _dayjs(periodEnd), undefined, "[)")
            ) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                className = ` ${BG_COLOR["100"][primaryColor]} ${currentDateClass(
                    day
                )} dark:bg-white/10`;
            }

            if (xor(periodStart, periodEnd) && dayHover === fullDay) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const bgColor = BG_COLOR["500"][primaryColor];
                className = ` transition-all duration-500 text-white font-medium ${bgColor} ${
                    periodStart ? "rounded-r-full" : "rounded-l-full"
                }`;
            }

            return className;
        },
        [
            calendarData.date,
            currentDateClass,
            dayHover,
            period.end,
            period.start,
            primaryColor,
            value?.endDate,
            value?.startDate
        ]
    );

    const isDateTooEarly = useCallback(
        (day: number, type: string) => {
            if (!minDate) {
                return false;
            }
            const object = {
                previous: previousMonth(calendarData.date),
                current: calendarData.date,
                next: nextMonth(calendarData.date)
            };
            const newDate = object[type as keyof typeof object];
            const formattedDate = `${newDate.year()}-${newDate.month() + 1}-${
                day >= 10 ? day : "0" + day
            }`;
            return _dayjs(formattedDate).isSame(_dayjs(minDate))
                ? false
                : _dayjs(formattedDate).isBefore(_dayjs(minDate));
        },
        [calendarData.date, minDate]
    );

    const isDateTooLate = useCallback(
        (day: number, type: string) => {
            if (!maxDate) {
                return false;
            }
            const object = {
                previous: previousMonth(calendarData.date),
                current: calendarData.date,
                next: nextMonth(calendarData.date)
            };
            const newDate = object[type as keyof typeof object];
            const formattedDate = `${newDate.year()}-${newDate.month() + 1}-${
                day >= 10 ? day : "0" + day
            }`;
            return _dayjs(formattedDate).isSame(_dayjs(maxDate))
                ? false
                : _dayjs(formattedDate).isAfter(_dayjs(maxDate));
        },
        [calendarData.date, maxDate]
    );

    const isDateDisabled = useCallback(
        (day: number, type: string) => {
            if (isDateTooEarly(day, type) || isDateTooLate(day, type)) {
                return true;
            }
            const object = {
                previous: previousMonth(calendarData.date),
                current: calendarData.date,
                next: nextMonth(calendarData.date)
            };
            const newDate = object[type as keyof typeof object];
            const formattedDate = `${newDate.year()}-${newDate.month() + 1}-${
                day >= 10 ? day : "0" + day
            }`;

            if (!disabledDates || (Array.isArray(disabledDates) && !disabledDates.length)) {
                return false;
            }

            let matchingCount = 0;
            disabledDates?.forEach(dateRange => {
                if (
                    _dayjs(formattedDate).isAfter(_dayjs(dateRange.startDate)) &&
                    _dayjs(formattedDate).isBefore(_dayjs(dateRange.endDate))
                ) {
                    matchingCount++;
                }
                if (
                    _dayjs(formattedDate).isSame(_dayjs(dateRange.startDate)) ||
                    _dayjs(formattedDate).isSame(_dayjs(dateRange.endDate))
                ) {
                    matchingCount++;
                }
            });
            return matchingCount > 0;
        },
        [calendarData.date, isDateTooEarly, isDateTooLate, disabledDates]
    );

    const buttonClass = useCallback(
        (day: number, type: string) => {
            const baseClass = "flex items-center justify-center w-12 h-12 lg:w-10 lg:h-10";
            return cn(
                baseClass,
                !activeDateData(day).active ? hoverClassByDay(day) : activeDateData(day).className,
                isDateDisabled(day, type) && "line-through"
            );
        },
        [activeDateData, hoverClassByDay, isDateDisabled]
    );

    const checkIfHoverPeriodContainsDisabledPeriod = useCallback(
        (hoverPeriod: Period) => {
            if (!Array.isArray(disabledDates)) {
                return false;
            }
            for (let i = 0; i < disabledDates.length; i++) {
                if (
                    _dayjs(hoverPeriod.start).isBefore(_dayjs(disabledDates[i].startDate)) &&
                    _dayjs(hoverPeriod.end).isAfter(_dayjs(disabledDates[i].endDate))
                ) {
                    return true;
                }
            }
            return false;
        },
        [disabledDates]
    );

    const getMetaData = useCallback(() => {
        return {
            previous: previousMonth(calendarData.date),
            current: calendarData.date,
            next: nextMonth(calendarData.date)
        };
    }, [calendarData.date]);

    const hoverDay = useCallback(
        (day: number, type: string) => {
            const object = getMetaData();
            const newDate = object[type as keyof typeof object];
            const newHover = `${newDate.year()}-${newDate.month() + 1}-${
                day >= 10 ? day : "0" + day
            }`;

            if (period.start && !period.end) {
                const hoverPeriod = { ...period, end: newHover };
                if (_dayjs(newHover).isBefore(_dayjs(period.start))) {
                    hoverPeriod.start = newHover;
                    hoverPeriod.end = period.start;
                    if (!checkIfHoverPeriodContainsDisabledPeriod(hoverPeriod)) {
                        changePeriod({
                            start: null,
                            end: period.start
                        });
                    }
                }
                if (!checkIfHoverPeriodContainsDisabledPeriod(hoverPeriod)) {
                    changeDayHover(newHover);
                }
            }

            if (!period.start && period.end) {
                const hoverPeriod = { ...period, start: newHover };
                if (_dayjs(newHover).isAfter(_dayjs(period.end))) {
                    hoverPeriod.start = period.end;
                    hoverPeriod.end = newHover;
                    if (!checkIfHoverPeriodContainsDisabledPeriod(hoverPeriod)) {
                        changePeriod({
                            start: period.end,
                            end: null
                        });
                    }
                }
                if (!checkIfHoverPeriodContainsDisabledPeriod(hoverPeriod)) {
                    changeDayHover(newHover);
                }
            }
        },
        [
            changeDayHover,
            changePeriod,
            checkIfHoverPeriodContainsDisabledPeriod,
            getMetaData,
            period
        ]
    );

    const handleClickDay = useCallback(
        (day: number, type: "previous" | "current" | "next") => {
            function continueClick() {
                if (type === "previous") {
                    onClickPreviousDays(day);
                }

                if (type === "current") {
                    onClickDay(day);
                }

                if (type === "next") {
                    onClickNextDays(day);
                }
            }

            if (disabledDates?.length) {
                const object = getMetaData();
                const newDate = object[type as keyof typeof object];
                const clickDay = `${newDate.year()}-${newDate.month() + 1}-${
                    day >= 10 ? day : "0" + day
                }`;

                if (period.start && !period.end) {
                    _dayjs(clickDay).isSame(_dayjs(dayHover)) && continueClick();
                } else if (!period.start && period.end) {
                    _dayjs(clickDay).isSame(_dayjs(dayHover)) && continueClick();
                } else {
                    continueClick();
                }
            } else {
                continueClick();
            }
        },
        [
            dayHover,
            disabledDates?.length,
            getMetaData,
            onClickDay,
            onClickNextDays,
            onClickPreviousDays,
            period.end,
            period.start
        ]
    );

    return (
        <div className="grid grid-cols-7 gap-y-0.5 my-1">
            {calendarData.days.previous.map((item, index) => (
                <button
                    type="button"
                    key={index}
                    disabled={isDateDisabled(item, "previous")}
                    className="flex items-center justify-center text-gray-400 h-12 w-12 lg:w-10 lg:h-10"
                    onClick={() => handleClickDay(item, "previous")}
                    onMouseOver={() => {
                        hoverDay(item, "previous");
                    }}
                >
                    {item}
                </button>
            ))}

            {calendarData.days.current.map((item, index) => (
                <button
                    type="button"
                    key={index}
                    disabled={isDateDisabled(item, "current")}
                    className={`${buttonClass(item, "current")}`}
                    onClick={() => handleClickDay(item, "current")}
                    onMouseOver={() => {
                        hoverDay(item, "current");
                    }}
                >
                    {item}
                </button>
            ))}

            {calendarData.days.next.map((item, index) => (
                <button
                    type="button"
                    key={index}
                    disabled={isDateDisabled(index, "next")}
                    className="flex items-center justify-center text-gray-400 h-12 w-12 lg:w-10 lg:h-10"
                    onClick={() => handleClickDay(item, "next")}
                    onMouseOver={() => {
                        hoverDay(item, "next");
                    }}
                >
                    {item}
                </button>
            ))}
        </div>
    );
};

export default Days;
