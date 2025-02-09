import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Calendar from "../components/Calendar";
import Footer from "../components/Footer";
import Input from "../components/Input";
import Shortcuts from "../components/Shortcuts";
import { COLORS, DEFAULT_COLOR, DEFAULT_DISPLAY_FORMAT, LANGUAGE } from "../constants";
import DatepickerContext from "../contexts/DatepickerContext";
import { _dayjs, formatDate, isSameMonthYear, nextMonth, previousMonth } from "../helpers";
import useOnClickOutside from "../hooks";
import { Period, DatepickerType, DateValueType } from "../types";

import { Arrow, VerticalDash } from "./utils";

const Datepicker: React.FC<DatepickerType> = ({
    primaryColor = "blue",
    value = null,
    onChange,
    useRange = true,
    showFooter = false,
    showShortcuts = false,
    configs = undefined,
    asSingle = false,
    placeholder = null,
    separator = "~",
    startFrom = null,
    i18n = LANGUAGE,
    disabled = false,
    inputClassName = null,
    containerClassName = null,
    toggleClassName = null,
    toggleIcon = undefined,
    displayFormat = DEFAULT_DISPLAY_FORMAT,
    readOnly = false,
    minDate = null,
    maxDate = null,
    disabledDates = null,
    inputId,
    inputName,
    startWeekOn = "sun",
    classNames = undefined,
    popoverDirection = undefined
}) => {
    // Ref
    const containerRef = useRef<HTMLDivElement | null>(null);
    const calendarContainerRef = useRef<HTMLDivElement | null>(null);
    const arrowRef = useRef<HTMLDivElement | null>(null);

    // State
    const [firstDate, setFirstDate] = useState<dayjs.Dayjs>(
        startFrom && _dayjs(startFrom).isValid() ? _dayjs(startFrom) : _dayjs()
    );
    const [secondDate, setSecondDate] = useState<dayjs.Dayjs>(nextMonth(firstDate));
    const [period, setPeriod] = useState<Period>({
        start: null,
        end: null
    });
    const [dayHover, setDayHover] = useState<string | null>(null);
    const [inputText, setInputText] = useState<string>("");
    const [inputRef, setInputRef] = useState(React.createRef<HTMLInputElement>());

    // Custom Hooks use
    useOnClickOutside(containerRef, () => {
        const container = containerRef.current;
        if (container) {
            hideDatepicker();
        }
    });

    const setDateInInputText = useCallback(
        (date: DateValueType) => {
            if (date?.startDate && date.endDate) {
                setInputText(
                    `${formatDate(_dayjs(date.startDate), displayFormat)}${
                        useRange
                            ? ` ${separator} ${formatDate(_dayjs(date.endDate), displayFormat)}`
                            : ""
                    }`
                );
            }
        },
        [displayFormat, separator, useRange]
    );

    // Functions
    const hideDatepicker = useCallback(() => {
        const div = calendarContainerRef.current;
        const arrow = arrowRef.current;
        if (arrow && div && div.classList.contains("block")) {
            div.classList.remove("block");
            div.classList.remove("translate-y-0");
            div.classList.remove("opacity-1");
            div.classList.add("translate-y-4");
            div.classList.add("opacity-0");
            setTimeout(() => {
                div.classList.remove("bottom-full");
                div.classList.add("hidden");
                div.classList.add("mb-2.5");
                div.classList.add("mt-2.5");
                arrow.classList.remove("-bottom-2");
                arrow.classList.remove("border-r");
                arrow.classList.remove("border-b");
                arrow.classList.add("border-l");
                arrow.classList.add("border-t");
            }, 300);
        }
        setDateInInputText(value);
        if (useRange) {
            setPeriod({
                start: null,
                end: null
            });
        }
    }, [value, setDateInInputText, useRange, setPeriod]);

    /* Start First */
    const firstGotoDate = useCallback(
        (date: dayjs.Dayjs) => {
            const newDate = _dayjs(formatDate(date));
            const reformatDate = _dayjs(formatDate(secondDate));
            if (newDate.isSame(reformatDate) || newDate.isAfter(reformatDate)) {
                setSecondDate(nextMonth(date));
            }
            setFirstDate(date);
        },
        [secondDate]
    );

    // Click handler for the "<" icon on the first (left) month.
    const previousMonthFirst = useCallback(() => {
        setFirstDate(previousMonth(firstDate));
    }, [firstDate]);

    const nextMonthFirst = useCallback(() => {
        firstGotoDate(nextMonth(firstDate));
    }, [firstDate, firstGotoDate]);

    const changeFirstMonth = useCallback(
        (month: number) => {
            firstGotoDate(_dayjs(`${firstDate.year()}-${month < 10 ? "0" : ""}${month}-01`));
        },
        [firstDate, firstGotoDate]
    );

    const changeFirstYear = useCallback(
        (year: number) => {
            firstGotoDate(_dayjs(`${year}-${firstDate.month() + 1}-01`));
        },
        [firstDate, firstGotoDate]
    );
    /* End First */

    /* Start Second */
    const secondGotoDate = useCallback(
        (date: dayjs.Dayjs) => {
            const newDate = _dayjs(formatDate(date));
            const reformatDate = _dayjs(formatDate(firstDate));
            if (newDate.isSame(reformatDate) || newDate.isBefore(reformatDate)) {
                setFirstDate(previousMonth(date));
            }
            setSecondDate(date);
        },
        [firstDate]
    );

    const previousMonthSecond = useCallback(() => {
        secondGotoDate(previousMonth(secondDate));
    }, [secondDate, secondGotoDate]);

    const nextMonthSecond = useCallback(() => {
        setSecondDate(nextMonth(secondDate));
    }, [secondDate]);

    const changeSecondMonth = useCallback(
        (month: number) => {
            secondGotoDate(_dayjs(`${secondDate.year()}-${month < 10 ? "0" : ""}${month}-01`));
        },
        [secondDate, secondGotoDate]
    );

    const changeSecondYear = useCallback(
        (year: number) => {
            secondGotoDate(_dayjs(`${year}-${secondDate.month() + 1}-01`));
        },
        [secondDate, secondGotoDate]
    );
    /* End Second */

    // UseEffects & UseLayoutEffect
    useEffect(() => {
        const container = containerRef.current;
        const calendarContainer = calendarContainerRef.current;
        const arrow = arrowRef.current;

        if (container && calendarContainer && arrow) {
            const detail = container.getBoundingClientRect();
            const screenCenter = window.innerWidth / 2;
            const containerCenter = (detail.right - detail.x) / 2 + detail.x;

            if (containerCenter > screenCenter) {
                arrow.classList.add("right-0");
                arrow.classList.add("mr-3.5");
                calendarContainer.classList.add("right-0");
            }
        }
    }, []);

    // Log the value when it changes
    useEffect(() => {
        // Set second month to month after start date if there is no end date or the end date is the
        // same month as the start date.
        if (
            value?.startDate &&
            (!value?.endDate || isSameMonthYear(_dayjs(value.startDate), _dayjs(value.endDate)))
        ) {
            setSecondDate(nextMonth(_dayjs(value?.startDate)));
        } else if (value?.endDate) {
            setSecondDate(_dayjs(value?.endDate));
        }
    }, [value]);

    useEffect(() => {
        if (value?.startDate && value.endDate) {
            const startDate = _dayjs(value.startDate);
            const endDate = _dayjs(value.endDate);
            const validDate = startDate.isValid() && endDate.isValid();
            const isValidValue =
                validDate && (startDate.isSame(endDate) || startDate.isBefore(endDate));
            if (isValidValue) {
                setPeriod({
                    start: null,
                    end: null
                });
            }
        }

        if (value && value.startDate === null && value.endDate === null) {
            setPeriod({
                start: null,
                end: null
            });
            setInputText("");
        }
    }, [value]);

    useEffect(() => {
        if (value?.startDate && (!useRange || value.endDate)) {
            setDateInInputText(value);
        }
    }, [value, useRange, setDateInInputText]);

    useEffect(() => {
        if (startFrom && _dayjs(startFrom).isValid()) {
            if (value?.startDate != null) {
                setFirstDate(_dayjs(value.startDate));
                setSecondDate(nextMonth(_dayjs(value.startDate)));
            } else {
                setFirstDate(_dayjs(startFrom));
                setSecondDate(nextMonth(_dayjs(startFrom)));
            }
        }
    }, [startFrom, value]);

    // Variables
    const colorPrimary = useMemo(() => {
        if (COLORS.includes(primaryColor)) {
            return primaryColor;
        }
        return DEFAULT_COLOR;
    }, [primaryColor]);
    const contextValues = useMemo(() => {
        return {
            asSingle,
            primaryColor: colorPrimary,
            configs,
            calendarContainer: calendarContainerRef,
            arrowContainer: arrowRef,
            hideDatepicker,
            period,
            changePeriod: (newPeriod: Period) => setPeriod(newPeriod),
            dayHover,
            changeDayHover: (newDay: string | null) => setDayHover(newDay),
            inputText,
            changeInputText: (newText: string) => setInputText(newText),
            updateFirstDate: (newDate: dayjs.Dayjs) => firstGotoDate(newDate),
            changeDatepickerValue: onChange,
            showFooter,
            placeholder,
            separator,
            i18n,
            value,
            disabled,
            inputClassName,
            containerClassName,
            toggleClassName,
            toggleIcon,
            readOnly,
            displayFormat,
            minDate,
            maxDate,
            disabledDates,
            inputId,
            inputName,
            startWeekOn,
            classNames,
            onChange,
            input: inputRef,
            popoverDirection,
            useRange
        };
    }, [
        asSingle,
        colorPrimary,
        configs,
        hideDatepicker,
        period,
        dayHover,
        inputText,
        onChange,
        showFooter,
        placeholder,
        separator,
        i18n,
        value,
        disabled,
        inputClassName,
        containerClassName,
        toggleClassName,
        toggleIcon,
        readOnly,
        displayFormat,
        firstGotoDate,
        minDate,
        maxDate,
        disabledDates,
        inputId,
        inputName,
        startWeekOn,
        classNames,
        inputRef,
        popoverDirection,
        useRange
    ]);

    const containerClassNameOverload = useMemo(() => {
        const defaultContainerClassName = "relative w-full text-gray-700";
        return typeof containerClassName === "function"
            ? containerClassName(defaultContainerClassName)
            : typeof containerClassName === "string" && containerClassName !== ""
            ? containerClassName
            : defaultContainerClassName;
    }, [containerClassName]);

    return (
        <DatepickerContext.Provider value={contextValues}>
            <div className={containerClassNameOverload} ref={containerRef}>
                <Input setContextRef={setInputRef} />

                <div
                    className="transition-all ease-out duration-300 absolute z-10 mt-[1px] text-sm lg:text-xs 2xl:text-sm translate-y-4 opacity-0 hidden"
                    ref={calendarContainerRef}
                >
                    <Arrow ref={arrowRef} />

                    <div className="mt-2.5 shadow-sm border border-gray-300 px-1 py-0.5 bg-white dark:bg-slate-800 dark:text-white dark:border-slate-600 rounded-lg">
                        <div className="flex flex-col lg:flex-row py-2">
                            {showShortcuts && <Shortcuts />}

                            <div
                                className={`flex items-stretch flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-1.5 ${
                                    showShortcuts ? "md:pl-2" : "md:pl-1"
                                } pr-2 lg:pr-1`}
                            >
                                <Calendar
                                    date={firstDate}
                                    onClickPrevious={previousMonthFirst}
                                    onClickNext={nextMonthFirst}
                                    changeMonth={changeFirstMonth}
                                    changeYear={changeFirstYear}
                                />

                                {useRange && (
                                    <>
                                        <div className="flex items-center">
                                            <VerticalDash />
                                        </div>

                                        <Calendar
                                            date={secondDate}
                                            onClickPrevious={previousMonthSecond}
                                            onClickNext={nextMonthSecond}
                                            changeMonth={changeSecondMonth}
                                            changeYear={changeSecondYear}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {showFooter && <Footer />}
                    </div>
                </div>
            </div>
        </DatepickerContext.Provider>
    );
};

export default Datepicker;
