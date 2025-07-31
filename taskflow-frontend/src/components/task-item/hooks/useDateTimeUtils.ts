import { useCallback } from 'react';

export const useDateTimeUtils = () => {
    const toLocalInputDateTime = useCallback((utcString: string) => {
        if (!utcString) return "";
        const date = new Date(utcString);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const yyyy = date.getFullYear();
        const mm = pad(date.getMonth() + 1);
        const dd = pad(date.getDate());
        const hh = pad(date.getHours());
        const min = pad(date.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    }, []);

    const localDateTimeToUTCISOString = useCallback((local: string) => {
        if (!local) return null;
        return new Date(local).toISOString();
    }, []);

    return {
        toLocalInputDateTime,
        localDateTimeToUTCISOString
    };
};
