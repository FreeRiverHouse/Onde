export function processTranscription(text: string): string {
    let result = text;

    // 1. Remove fillers
    const fillers = /\b(um|uh|like|you know|literally|basically|ehm|cioè|praticamente|tipo)\b/gi;
    result = result.replace(fillers, '');

    // 2. Formatting rules, etc.
    result = result.replace(/\s+/g, ' ').trim();

    // 3. Command check
    if (result.toLowerCase().includes('new line')) {
        return '\n';
    }
    if (result.toLowerCase().trim() === 'scratch that') {
        return '';
    }

    if (result.length > 0) {
        // Capitalize first letter
        result = result.charAt(0).toUpperCase() + result.slice(1);
    }

    return result;
}
