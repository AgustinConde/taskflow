import type { CSSProperties } from 'react';
import arFlag from '../../assets/flags/ar.svg';
import usFlag from '../../assets/flags/us.svg';

const flagMap: Record<string, string> = {
    AR: arFlag,
    US: usFlag
};

type CountryFlagIconProps = {
    countryCode: string;
    title?: string;
    width?: number;
    height?: number;
    style?: CSSProperties;
    className?: string;
};

const CountryFlagIcon = ({
    countryCode,
    title,
    width = 28,
    height = 22,
    style,
    className
}: CountryFlagIconProps) => {
    const code = countryCode.toUpperCase();
    const src = flagMap[code];

    if (!src) {
        return null;
    }

    const mergedStyle: CSSProperties = {
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style
    };

    return (
        <img
            src={src}
            alt={title ?? code}
            title={title}
            width={width}
            height={height}
            style={mergedStyle}
            className={className}
            loading="lazy"
        />
    );
};

export default CountryFlagIcon;
