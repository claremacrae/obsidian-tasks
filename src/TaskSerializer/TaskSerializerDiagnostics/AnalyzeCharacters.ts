export interface CharacterInfo {
    index: number;
    char: string;
    codePoint: number;
    codePointHex: string;
    utf16: string;
    unicode: string;
    isEmoji?: boolean;
    description?: string;
}

export function analyzeCharacters(text: string): CharacterInfo[] {
    const analysis: CharacterInfo[] = [];
    let index = 0;

    // Use Array.from to properly handle surrogate pairs and emoji
    const chars = Array.from(text);

    for (const char of chars) {
        const codePoint = char.codePointAt(0) || 0;
        const info: CharacterInfo = {
            index: index++,
            char: char,
            codePoint: codePoint,
            codePointHex: codePoint.toString(16).toUpperCase().padStart(4, '0'),
            utf16: char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'),
            unicode: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
        };

        // Identify special characters
        if (codePoint === 0xfe0f) {
            info.description = 'Variation Selector-16 (emoji)';
        } else if (codePoint === 0xfe0e) {
            info.description = 'Variation Selector-15 (text)';
        } else if (codePoint >= 0x200b && codePoint <= 0x200f) {
            info.description = 'Zero-width character';
        } else if (codePoint === 0x20) {
            info.description = 'Space';
        } else if (codePoint === 0x09) {
            info.description = 'Tab';
        } else if (codePoint >= 0x1f300 && codePoint <= 0x1f9ff) {
            info.isEmoji = true;
            info.description = 'Emoji';
        }

        analysis.push(info);
    }

    return analysis;
}
