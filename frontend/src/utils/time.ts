import { DateTime } from "luxon";

interface RelativeTimeOptions {
    locale?: string;
    zone?: string;
    calendar?: boolean;
    format?: string;
}
export function getRelativeTimeBetweenDates(fromInput: any, toInput: any = DateTime.now(), options: RelativeTimeOptions = {}) {
    function parse(input: any) {
        if (typeof input === 'string') {
            let dt = DateTime.fromISO(input);
            if (!dt.isValid) dt = DateTime.fromRFC2822(input);
            if (!dt.isValid && options.format)
                dt = DateTime.fromFormat(input, options.format);
            return dt;
        } else if (typeof input === 'number') {
            return input > 1e12
                ? DateTime.fromMillis(input)
                : DateTime.fromSeconds(input);
        } else if (input instanceof Date) {
            return DateTime.fromJSDate(input);
        } else if (DateTime.isDateTime(input)) {
            return input;
        } else {
            return DateTime.invalid("Unsupported input");
        }
    }

    const from = parse(fromInput);
    const to = parse(toInput);

    if (!from.isValid || !to.isValid) return 'Invalid date(s)';

    if (options.zone) to.setZone(options.zone);
    if (options.locale) to.setLocale(options.locale);

    return options.calendar
        ? to.toRelativeCalendar({ base: from })
        : to.toRelative({ base: from });
}