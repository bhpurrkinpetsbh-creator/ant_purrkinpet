// Natural Language Inventory Command Parser
// Parses commands like "set all stock to 50" or "delete sku 109"

export interface ParsedCommand {
    action: 'SET' | 'ADD' | 'DELETE' | 'UNKNOWN';
    target: 'ALL' | 'SKU' | 'NAME' | 'UNKNOWN';
    targetValue?: string;  // SKU number or product name
    field: 'stock' | 'price' | 'threshold' | 'unknown';
    value?: number;
    rawCommand: string;
    error?: string;
}

export interface CommandResult {
    success: boolean;
    message: string;
    affectedCount?: number;
    affectedProducts?: { id: string; name: string; sku: string | null }[];
}

// Common regex patterns for command parsing
const PATTERNS = {
    // "set all stock to 50" or "update all stock to 100" or "change all stock to 50"
    setAllStock: /^(?:set|update|change)\s+(?:the\s+)?all\s+(?:products?\s+)?stock\s+to\s+(\d+)$/i,

    // "set stock for sku 190 to 25" or "update sku ABC to 10"
    setSkuStock: /^(?:set|update|change)\s+(?:the\s+)?(?:stock\s+(?:for|of)\s+)?sku\s+['""]?([^'""]+)['""]?\s+to\s+(\d+)$/i,

    // "set stock for "Product Name" to 100"
    setNameStock: /^(?:set|update|change)\s+(?:the\s+)?stock\s+(?:for|of)\s+['""]([^'""]+)['""]\s+to\s+(\d+)$/i,

    // "add 10 to sku ABC123" or "add 5 units to sku 123"
    addToSku: /^add\s+(\d+)\s+(?:units?\s+)?to\s+sku\s+['""]?([^'""]+)['""]?$/i,

    // "delete sku 109" or "remove sku ABC"
    deleteSku: /^(?:delete|remove)\s+(?:the\s+)?(?:product\s+)?(?:with\s+)?sku\s+['""]?([^'""]+)['""]?$/i,

    // "set all prices to 10" (future)
    setAllPrices: /^(?:set|update|change)\s+(?:the\s+)?all\s+prices?\s+to\s+([\d.]+)$/i,

    // "set threshold for sku 123 to 5"
    setSkuThreshold: /^(?:set|update|change)\s+(?:the\s+)?(?:low\s+stock\s+)?threshold\s+(?:for|of)\s+sku\s+['""]?([^'""]+)['""]?\s+to\s+(\d+)$/i,
};

export function parseInventoryCommand(command: string): ParsedCommand {
    const trimmedCommand = command.trim();

    // Try each pattern
    let match: RegExpMatchArray | null;

    // Set all stock
    match = trimmedCommand.match(PATTERNS.setAllStock);
    if (match) {
        return {
            action: 'SET',
            target: 'ALL',
            field: 'stock',
            value: parseInt(match[1], 10),
            rawCommand: trimmedCommand,
        };
    }

    // Set stock for SKU
    match = trimmedCommand.match(PATTERNS.setSkuStock);
    if (match) {
        return {
            action: 'SET',
            target: 'SKU',
            targetValue: match[1].trim(),
            field: 'stock',
            value: parseInt(match[2], 10),
            rawCommand: trimmedCommand,
        };
    }

    // Set stock for product name
    match = trimmedCommand.match(PATTERNS.setNameStock);
    if (match) {
        return {
            action: 'SET',
            target: 'NAME',
            targetValue: match[1].trim(),
            field: 'stock',
            value: parseInt(match[2], 10),
            rawCommand: trimmedCommand,
        };
    }

    // Add to SKU
    match = trimmedCommand.match(PATTERNS.addToSku);
    if (match) {
        return {
            action: 'ADD',
            target: 'SKU',
            targetValue: match[2].trim(),
            field: 'stock',
            value: parseInt(match[1], 10),
            rawCommand: trimmedCommand,
        };
    }

    // Delete SKU
    match = trimmedCommand.match(PATTERNS.deleteSku);
    if (match) {
        return {
            action: 'DELETE',
            target: 'SKU',
            targetValue: match[1].trim(),
            field: 'unknown',
            rawCommand: trimmedCommand,
        };
    }

    // Set threshold for SKU
    match = trimmedCommand.match(PATTERNS.setSkuThreshold);
    if (match) {
        return {
            action: 'SET',
            target: 'SKU',
            targetValue: match[1].trim(),
            field: 'threshold',
            value: parseInt(match[2], 10),
            rawCommand: trimmedCommand,
        };
    }

    // Unknown command
    return {
        action: 'UNKNOWN',
        target: 'UNKNOWN',
        field: 'unknown',
        rawCommand: trimmedCommand,
        error: 'Could not understand this command. Try: "set all stock to 50" or "update sku 123 to 10" or "delete sku 109"',
    };
}

// Get example commands for help
export function getCommandExamples(): string[] {
    return [
        'set all stock to 50',
        'update stock for sku 190 to 25',
        'add 10 to sku ABC123',
        'delete sku 109',
        'set stock for "Product Name" to 100',
        'set threshold for sku 123 to 5',
    ];
}
