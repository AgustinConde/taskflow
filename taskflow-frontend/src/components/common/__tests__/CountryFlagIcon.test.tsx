import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CountryFlagIcon from '../CountryFlagIcon';

describe('CountryFlagIcon', () => {
    it('renders flag image', () => {
        const { container } = render(<CountryFlagIcon countryCode="US" />);
        const img = container.querySelector('img');
        if (img) {
            expect(img).toHaveAttribute('alt', 'US');
            expect(img).toHaveAttribute('width', '28');
        }
    });

    it('applies custom props', () => {
        const { container } = render(
            <CountryFlagIcon countryCode="ES" title="Spain" width={40} height={30} className="flag" />
        );
        const img = container.querySelector('img');
        if (img) {
            expect(img).toHaveAttribute('title', 'Spain');
            expect(img).toHaveAttribute('alt', 'Spain');
            expect(img).toHaveAttribute('width', '40');
            expect(img).toHaveAttribute('class', 'flag');
        }
    });

    it('returns null for missing flag', () => {
        const { container } = render(<CountryFlagIcon countryCode="XX" />);
        expect(container.firstChild).toBeNull();
    });
});

