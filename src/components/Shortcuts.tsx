import React, { useCallback, useContext, useMemo } from "react";

import { TEXT_COLOR } from "../constants";
import DEFAULT_SHORTCUTS from "../constants/shortcuts";
import DatepickerContext from "../contexts/DatepickerContext";
import { Period, ShortcutsItem } from "../types";

import { _dayjs, formatDate } from "helpers";

interface ItemTemplateProps {
    children: JSX.Element;
    key: number;
    item: ShortcutsItem;
}

// eslint-disable-next-line react/display-name
const ItemTemplate = React.memo((props: ItemTemplateProps) => {
    const {
        primaryColor,
        updateFirstDate,
        dayHover,
        changeDayHover,
        hideDatepicker,
        changeDatepickerValue
    } = useContext(DatepickerContext);

    // Functions
    const getClassName: () => string = useCallback(() => {
        const textColor = TEXT_COLOR["600"][primaryColor as keyof (typeof TEXT_COLOR)["600"]];
        const textColorHover = TEXT_COLOR.hover[primaryColor as keyof typeof TEXT_COLOR.hover];
        return `whitespace-nowrap w-1/2 md:w-1/3 lg:w-auto transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/10 p-2 rounded cursor-pointer ${textColor} ${textColorHover}`;
    }, [primaryColor]);

    const choosePeriod = useCallback(
        (item: Period) => {
            if (dayHover) {
                changeDayHover(null);
            }
            changeDatepickerValue({
                startDate: item.start,
                endDate: item.end
            });
            updateFirstDate(_dayjs(item.start));
            hideDatepicker();
        },
        [changeDatepickerValue, changeDayHover, dayHover, hideDatepicker, updateFirstDate]
    );

    const children = props?.children;

    return (
        <li
            className={getClassName()}
            onClick={() => {
                const period = props.item.period?.();
                if (period) {
                    choosePeriod(period);
                }
            }}
        >
            {children}
        </li>
    );
});

const Shortcuts: React.FC = () => {
    // Contexts
    const { configs } = useContext(DatepickerContext);

    const callPastFunction = useCallback((data: unknown, numberValue: number) => {
        return typeof data === "function" ? data(numberValue) : null;
    }, []);

    const shortcutOptions = useMemo<[string, ShortcutsItem | ShortcutsItem[]][]>(() => {
        let options;
        if (configs?.shortcuts) {
            const formatConfig = Object.keys(configs.shortcuts).map(item => {
                if (Object.keys(DEFAULT_SHORTCUTS).includes(item)) {
                    return [item, DEFAULT_SHORTCUTS[item]];
                } else {
                    // using | makes this fail in typecheck as [string] is no longer recognised?
                    if (configs.shortcuts && configs?.shortcuts[item]) {
                        const customConfig = configs?.shortcuts[item];
                        const text = customConfig?.text;
                        const start = _dayjs(customConfig?.period?.()?.start);
                        const end = _dayjs(customConfig?.period?.().end);
                        if (
                            text &&
                            start.isValid() &&
                            end.isValid() &&
                            (start.isBefore(end) || start.isSame(end))
                        ) {
                            return [
                                item,
                                {
                                    text,
                                    period: () => ({
                                        start: formatDate(start),
                                        end: formatDate(end)
                                    })
                                }
                            ];
                        } else {
                            return undefined;
                        }
                    }
                    return undefined;
                }
            });
            options = formatConfig?.filter(item => !!item);
        } else {
            options = Object.entries(DEFAULT_SHORTCUTS);
        }
        return options as [string, ShortcutsItem | ShortcutsItem[]][];
    }, [configs]);

    const printItemText = useCallback((item: ShortcutsItem) => {
        return item?.text ?? null;
    }, []);

    return shortcutOptions?.length ? (
        <div className="md:border-b mb-3 lg:mb-0 lg:border-r lg:border-b-0 border-gray-300 dark:border-gray-700 pr-1">
            <ul className="w-full tracking-wide flex flex-wrap lg:flex-col pb-1 lg:pb-0">
                {shortcutOptions?.map(([key, item], index: number) =>
                    Array.isArray(item) ? (
                        item.map((item, index) => (
                            <ItemTemplate key={index} item={item}>
                                <>
                                    {key === "past" &&
                                    configs?.shortcuts &&
                                    key in configs.shortcuts &&
                                    item.daysNumber
                                        ? callPastFunction(
                                              configs.shortcuts[key as "past"],
                                              item.daysNumber
                                          )
                                        : item.text}
                                </>
                            </ItemTemplate>
                        ))
                    ) : (
                        <ItemTemplate key={index} item={item}>
                            <>
                                {configs?.shortcuts && key in configs.shortcuts
                                    ? typeof configs.shortcuts[
                                          key as keyof typeof configs.shortcuts
                                      ] === "object"
                                        ? printItemText(item)
                                        : configs.shortcuts[key as keyof typeof configs.shortcuts]
                                    : printItemText(item)}
                            </>
                        </ItemTemplate>
                    )
                )}
            </ul>
        </div>
    ) : null;
};

export default Shortcuts;
