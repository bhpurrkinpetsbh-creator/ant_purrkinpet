import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Terminal, Send, AlertTriangle, CheckCircle, XCircle, Trash2, History, HelpCircle } from "lucide-react";
import { parseInventoryCommand, getCommandExamples, ParsedCommand, CommandResult } from "@/utils/inventoryCommandParser";

interface CommandHistoryItem {
    command: string;
    result: CommandResult;
    timestamp: Date;
}

interface AffectedProduct {
    id: string;
    name: string;
    sku: string | null;
    stock_quantity: number | null;
}

export function SmartInventoryCommands() {
    const [command, setCommand] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [history, setHistory] = useState<CommandHistoryItem[]>([]);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingCommand, setPendingCommand] = useState<ParsedCommand | null>(null);
    const [affectedProducts, setAffectedProducts] = useState<AffectedProduct[]>([]);
    const [showHelp, setShowHelp] = useState(true);

    const executeCommand = async (parsedCmd: ParsedCommand): Promise<CommandResult> => {
        try {
            switch (parsedCmd.action) {
                case 'SET': {
                    if (parsedCmd.target === 'ALL' && parsedCmd.field === 'stock') {
                        // Set all stock
                        console.log('Executing SET ALL STOCK command with value:', parsedCmd.value);
                        const { data, error, count } = await supabase
                            .from('products')
                            .update({ stock_quantity: parsedCmd.value })
                            .eq('is_active', true)
                            .select('id, name, sku');

                        console.log('Supabase response:', { data, error, count });

                        if (error) {
                            console.error('Supabase error:', error);
                            throw error;
                        }
                        return {
                            success: true,
                            message: `Successfully set stock to ${parsedCmd.value} for ${data?.length || 0} products`,
                            affectedCount: data?.length || 0,
                            affectedProducts: data || [],
                        };
                    }

                    if (parsedCmd.target === 'SKU' && parsedCmd.field === 'stock') {
                        // Set stock for specific SKU
                        const { data, error } = await supabase
                            .from('products')
                            .update({ stock_quantity: parsedCmd.value })
                            .ilike('sku', parsedCmd.targetValue || '')
                            .select('id, name, sku');

                        if (error) throw error;
                        if (!data || data.length === 0) {
                            return { success: false, message: `No product found with SKU "${parsedCmd.targetValue}"` };
                        }
                        return {
                            success: true,
                            message: `Set stock to ${parsedCmd.value} for SKU ${parsedCmd.targetValue}`,
                            affectedCount: data.length,
                            affectedProducts: data,
                        };
                    }

                    if (parsedCmd.target === 'NAME' && parsedCmd.field === 'stock') {
                        // Set stock for product by name
                        const { data, error } = await supabase
                            .from('products')
                            .update({ stock_quantity: parsedCmd.value })
                            .ilike('name', `%${parsedCmd.targetValue}%`)
                            .select('id, name, sku');

                        if (error) throw error;
                        if (!data || data.length === 0) {
                            return { success: false, message: `No product found matching "${parsedCmd.targetValue}"` };
                        }
                        return {
                            success: true,
                            message: `Set stock to ${parsedCmd.value} for ${data.length} product(s)`,
                            affectedCount: data.length,
                            affectedProducts: data,
                        };
                    }

                    if (parsedCmd.target === 'SKU' && parsedCmd.field === 'threshold') {
                        // Set threshold for specific SKU
                        const { data, error } = await supabase
                            .from('products')
                            .update({ low_stock_threshold: parsedCmd.value })
                            .ilike('sku', parsedCmd.targetValue || '')
                            .select('id, name, sku');

                        if (error) throw error;
                        if (!data || data.length === 0) {
                            return { success: false, message: `No product found with SKU "${parsedCmd.targetValue}"` };
                        }
                        return {
                            success: true,
                            message: `Set low stock threshold to ${parsedCmd.value} for SKU ${parsedCmd.targetValue}`,
                            affectedCount: data.length,
                            affectedProducts: data,
                        };
                    }

                    return { success: false, message: 'Unsupported SET command' };
                }

                case 'ADD': {
                    if (parsedCmd.target === 'SKU') {
                        // First get current stock
                        const { data: product, error: fetchError } = await supabase
                            .from('products')
                            .select('id, name, sku, stock_quantity')
                            .ilike('sku', parsedCmd.targetValue || '')
                            .single();

                        if (fetchError || !product) {
                            return { success: false, message: `No product found with SKU "${parsedCmd.targetValue}"` };
                        }

                        const newStock = (product.stock_quantity || 0) + (parsedCmd.value || 0);

                        const { error: updateError } = await supabase
                            .from('products')
                            .update({ stock_quantity: newStock })
                            .eq('id', product.id);

                        if (updateError) throw updateError;

                        return {
                            success: true,
                            message: `Added ${parsedCmd.value} units to SKU ${parsedCmd.targetValue}. New stock: ${newStock}`,
                            affectedCount: 1,
                            affectedProducts: [{ id: product.id, name: product.name, sku: product.sku }],
                        };
                    }
                    return { success: false, message: 'Unsupported ADD command' };
                }

                case 'DELETE': {
                    if (parsedCmd.target === 'SKU') {
                        // Soft delete the product
                        const { data: product, error: fetchError } = await supabase
                            .from('products')
                            .select('id, name, sku')
                            .ilike('sku', parsedCmd.targetValue || '')
                            .single();

                        if (fetchError || !product) {
                            return { success: false, message: `No product found with SKU "${parsedCmd.targetValue}"` };
                        }

                        const { error } = await supabase.rpc('soft_delete_product', {
                            p_product_id: product.id,
                            p_deletion_reason: `Deleted via smart command: "${parsedCmd.rawCommand}"`
                        });

                        if (error) throw error;

                        return {
                            success: true,
                            message: `Product "${product.name}" (SKU: ${product.sku}) moved to trash`,
                            affectedCount: 1,
                            affectedProducts: [product],
                        };
                    }
                    return { success: false, message: 'Unsupported DELETE command' };
                }

                default:
                    return { success: false, message: parsedCmd.error || 'Unknown command' };
            }
        } catch (error: any) {
            console.error('Command execution error:', error);
            return { success: false, message: `Error: ${error.message}` };
        }
    };

    const previewCommand = async (parsedCmd: ParsedCommand) => {
        // Get affected products for preview
        let products: AffectedProduct[] = [];

        if (parsedCmd.target === 'ALL') {
            const { data } = await supabase
                .from('products')
                .select('id, name, sku, stock_quantity')
                .eq('is_active', true)
                .limit(10);
            products = data || [];
        } else if (parsedCmd.target === 'SKU' && parsedCmd.targetValue) {
            const { data } = await supabase
                .from('products')
                .select('id, name, sku, stock_quantity')
                .ilike('sku', parsedCmd.targetValue);
            products = data || [];
        } else if (parsedCmd.target === 'NAME' && parsedCmd.targetValue) {
            const { data } = await supabase
                .from('products')
                .select('id, name, sku, stock_quantity')
                .ilike('name', `%${parsedCmd.targetValue}%`);
            products = data || [];
        }

        return products;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim()) return;

        const parsedCmd = parseInventoryCommand(command);

        if (parsedCmd.action === 'UNKNOWN') {
            toast.error(parsedCmd.error || 'Could not understand command');
            return;
        }

        // For destructive/bulk operations, show confirmation
        if (parsedCmd.action === 'DELETE' || parsedCmd.target === 'ALL') {
            const products = await previewCommand(parsedCmd);
            setAffectedProducts(products);
            setPendingCommand(parsedCmd);
            setShowConfirmDialog(true);
        } else {
            // Execute directly for simple updates
            setIsProcessing(true);
            const result = await executeCommand(parsedCmd);

            setHistory(prev => [{
                command: command,
                result,
                timestamp: new Date(),
            }, ...prev.slice(0, 9)]);

            if (result.success) {
                toast.success(result.message);
                setCommand("");
            } else {
                toast.error(result.message);
            }

            setIsProcessing(false);
        }
    };

    const handleConfirmExecute = async () => {
        if (!pendingCommand) return;

        setIsProcessing(true);
        setShowConfirmDialog(false);

        const result = await executeCommand(pendingCommand);

        setHistory(prev => [{
            command: pendingCommand.rawCommand,
            result,
            timestamp: new Date(),
        }, ...prev.slice(0, 9)]);

        if (result.success) {
            toast.success(result.message);
            setCommand("");
        } else {
            toast.error(result.message);
        }

        setPendingCommand(null);
        setAffectedProducts([]);
        setIsProcessing(false);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Terminal className="h-5 w-5" />
                                Smart Inventory Commands
                            </CardTitle>
                            <CardDescription>
                                Use natural language to manage your inventory
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowHelp(!showHelp)}
                            className="gap-2"
                        >
                            <HelpCircle className="h-4 w-4" />
                            {showHelp ? "Hide Help" : "Show Help"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {showHelp && (
                        <Alert>
                            <HelpCircle className="h-4 w-4" />
                            <AlertTitle>Example Commands</AlertTitle>
                            <AlertDescription>
                                <ul className="mt-2 space-y-1 text-sm">
                                    {getCommandExamples().map((example, idx) => (
                                        <li key={idx} className="font-mono text-xs bg-muted px-2 py-1 rounded cursor-pointer hover:bg-muted/80"
                                            onClick={() => setCommand(example)}>
                                            {example}
                                        </li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <Input
                            placeholder="Type a command... e.g., 'set all stock to 50'"
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            className="flex-1 font-mono"
                            disabled={isProcessing}
                        />
                        <Button type="submit" disabled={isProcessing || !command.trim()} className="gap-2">
                            <Send className="h-4 w-4" />
                            Execute
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Command History */}
            {history.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <History className="h-5 w-5" />
                            Recent Commands
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {history.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                    {item.result.success ? (
                                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-mono text-sm">{item.command}</p>
                                        <p className={`text-sm mt-1 ${item.result.success ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.result.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {item.timestamp.toLocaleTimeString()}
                                        </p>
                                    </div>
                                    {item.result.affectedCount !== undefined && (
                                        <Badge variant="secondary">
                                            {item.result.affectedCount} affected
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            Confirm Action
                        </DialogTitle>
                        <DialogDescription>
                            {pendingCommand?.action === 'DELETE'
                                ? 'This will move the product to trash.'
                                : `This will affect ${affectedProducts.length}${affectedProducts.length === 10 ? '+' : ''} products.`
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="font-mono text-sm bg-muted p-2 rounded mb-4">
                            {pendingCommand?.rawCommand}
                        </p>

                        {affectedProducts.length > 0 && (
                            <div className="max-h-48 overflow-y-auto space-y-2">
                                <p className="text-sm text-muted-foreground mb-2">Products that will be affected:</p>
                                {affectedProducts.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                                        <span>{product.name}</span>
                                        <span className="text-muted-foreground">
                                            SKU: {product.sku || 'N/A'} | Stock: {product.stock_quantity ?? 0}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant={pendingCommand?.action === 'DELETE' ? 'destructive' : 'default'}
                            onClick={handleConfirmExecute}
                            className="gap-2"
                        >
                            {pendingCommand?.action === 'DELETE' && <Trash2 className="h-4 w-4" />}
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
