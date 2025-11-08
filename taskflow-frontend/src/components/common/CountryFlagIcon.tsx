import type { CSSProperties } from 'react';

const flagModules = import.meta.glob('../../assets/flags/*.svg', {
    eager: true,
    import: 'default'
}) as Record<string, string>;

const getFlagSource = (countryCode: string) => {
    const upperCode = countryCode.toUpperCase();
    const lowerCode = countryCode.toLowerCase();

    return (
        flagModules[`../../assets/flags/${upperCode}.svg`] ??
        flagModules[`../../assets/flags/${lowerCode}.svg`] ??
        null
    );
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
    const src = getFlagSource(code);

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
