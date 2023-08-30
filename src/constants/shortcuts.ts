import { _dayjs, formatDate, previousMonth, set_day_end, set_day_start } from "../helpers";
import { ShortcutsItem } from "../types";

const DEFAULT_SHORTCUTS: {
    [key in string]: ShortcutsItem | ShortcutsItem[];
} = {
    today: {
        text: "Today",
        period: () => ({
            start: formatDate(set_day_start(_dayjs())),
            end: formatDate(_dayjs())
        })
    },
    yesterday: {
        text: "Yesterday",
        period: () => ({
            start: formatDate(
                _dayjs().subtract(1, "d").set("hour", 0).set("minute", 0).set("second", 0)
            ),
            end: formatDate(set_day_end(_dayjs().subtract(1, "d")))
        })
    },
    past: [
        {
            daysNumber: 7,
            text: "Last 7 days",
            period: () => ({
                start: formatDate(_dayjs().subtract(7, "d")),
                end: formatDate(_dayjs())
            })
        },
        {
            daysNumber: 30,
            text: "Last 30 days",
            period: () => ({
                start: formatDate(_dayjs().subtract(30, "d")),
                end: formatDate(_dayjs())
            })
        }
    ],
    currentMonth: {
        text: "This month",
        period: () => ({
            start: formatDate(_dayjs().startOf("month")),
            end: formatDate(_dayjs().endOf("month"))
        })
    },
    pastMonth: {
        text: "Last month",
        period: () => ({
            start: formatDate(previousMonth(_dayjs()).startOf("month")),
            end: formatDate(previousMonth(_dayjs()).endOf("month"))
        })
    }
};

export default DEFAULT_SHORTCUTS;
