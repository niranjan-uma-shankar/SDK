import {timezoneData, aliasTimezones} from './data';

interface GMTOffsetData {
    offsetString: string | null;
    offsetMinutes: number;
}

interface TimezoneDataWithOffset {
    name: string;
    label: string;
    offsetMinutes: number;
}

export const getGMTOffset = (timeZone: string): GMTOffsetData => {
    const options: Intl.DateTimeFormatOptions = {
        timeZone,
        timeZoneName: 'longOffset'
    };
    
    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const parts = formatter.formatToParts(new Date());
    const offsetPart = parts.find(part => part.type === 'timeZoneName')?.value;

    if (!offsetPart) {
        return {offsetString: null, offsetMinutes: 0};
    }

    // Expecting formats like "GMT+05:30" or "GMT-08:00"
    const match = offsetPart.match(/^GMT([+-])(\d{2}):(\d{2})$/);
    
    if (!match) {
        return {offsetString: offsetPart, offsetMinutes: 0};
    }

    const [, sign, hourStr, minuteStr] = match;
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const totalMinutes = sign === '+' ? (hour * 60 + minute) : -(hour * 60 + minute);
    const offsetString = `GMT ${sign}${hour}:${minute.toString().padStart(2, '0')}`;
    
    return {offsetString, offsetMinutes: totalMinutes};
};

const labelWithGMTOffset = (label: string, offsetString: string): string => {
    return '(' + offsetString + ') ' + label;
};

export const timezoneDataWithGMTOffset = (): TimezoneDataWithOffset[] => {
    return timezoneData
        .map(({name, label}) => {
            const {offsetString, offsetMinutes} = getGMTOffset(name);
            return {
                name,
                label: offsetString ? labelWithGMTOffset(label, offsetString) : label,
                offsetMinutes
            };
        })
        .sort((a, b) => a.offsetMinutes - b.offsetMinutes);
};

export const maybeFetchAliasTimezone = (timezone: string): string => {
    if (hasAliasTimezone(timezone)) {
        return aliasTimezones[ timezone ];
    }

    return timezone;
};

const hasAliasTimezone = (timezone: string): timezone is keyof typeof aliasTimezones => {
    return timezone in aliasTimezones;
};

export default timezoneData;
