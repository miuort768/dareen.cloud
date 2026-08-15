const ARABIC_DIGITS: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

const KNOWN_COUNTRY_CODES = ['966', '965', '971', '974', '968', '973', '20'];

function toDigits(phone?: string | null): string {
    return String(phone || '')
        .replace(/[٠-٩]/g, d => ARABIC_DIGITS[d])
        .replace(/\D/g, '');
}

// Canonical comparison key only — never stored. Folds "+9665..." / "05..." /
// "00 966 5..." into the national "05..." form when safe to do so.
// Mirrors server/services/parentService.canonicalPhone.
export function canonicalPhone(phone?: string | null): string {
    let digits = toDigits(phone);
    if (!digits) return '';
    digits = digits.replace(/^00/, '').replace(/^\+/, '');
    for (const cc of KNOWN_COUNTRY_CODES) {
        if (digits.startsWith(cc)) {
            const rest = digits.slice(cc.length);
            if (rest.length >= 8 && rest.length <= 10) {
                return `0${rest}`;
            }
        }
    }
    return digits;
}
