import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calculator, Function, HelpCircle, Play, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FormulaFunction {
  name: string;
  category: string;
  description: string;
  syntax: string;
  example: string;
}

const FORMULA_FUNCTIONS: FormulaFunction[] = [
  // Math functions
  { name: "SUM", category: "Math", description: "Adds all numbers in a range", syntax: "SUM(range)", example: "=SUM(A1:A10)" },
  { name: "AVERAGE", category: "Math", description: "Calculates average of numbers", syntax: "AVERAGE(range)", example: "=AVERAGE(B1:B20)" },
  { name: "MIN", category: "Math", description: "Returns minimum value", syntax: "MIN(range)", example: "=MIN(C1:C5)" },
  { name: "MAX", category: "Math", description: "Returns maximum value", syntax: "MAX(range)", example: "=MAX(D1:D5)" },
  { name: "COUNT", category: "Math", description: "Counts numeric values", syntax: "COUNT(range)", example: "=COUNT(E1:E100)" },
  { name: "ROUND", category: "Math", description: "Rounds a number", syntax: "ROUND(number, decimals)", example: "=ROUND(3.14159, 2)" },
  
  // Statistical functions
  { name: "STDEV", category: "Statistical", description: "Standard deviation", syntax: "STDEV(range)", example: "=STDEV(A1:A50)" },
  { name: "VAR", category: "Statistical", description: "Variance", syntax: "VAR(range)", example: "=VAR(B1:B50)" },
  { name: "MEDIAN", category: "Statistical", description: "Middle value", syntax: "MEDIAN(range)", example: "=MEDIAN(C1:C20)" },
  { name: "MODE", category: "Statistical", description: "Most frequent value", syntax: "MODE(range)", example: "=MODE(D1:D30)" },
  { name: "CORREL", category: "Statistical", description: "Correlation coefficient", syntax: "CORREL(array1, array2)", example: "=CORREL(A1:A10, B1:B10)" },
  
  // Text functions
  { name: "CONCAT", category: "Text", description: "Joins text values", syntax: "CONCAT(text1, text2, ...)", example: "=CONCAT(A1, \" \", B1)" },
  { name: "UPPER", category: "Text", description: "Converts to uppercase", syntax: "UPPER(text)", example: "=UPPER(A1)" },
  { name: "LOWER", category: "Text", description: "Converts to lowercase", syntax: "LOWER(text)", example: "=LOWER(B1)" },
  { name: "LEN", category: "Text", description: "Text length", syntax: "LEN(text)", example: "=LEN(C1)" },
  { name: "TRIM", category: "Text", description: "Removes extra spaces", syntax: "TRIM(text)", example: "=TRIM(D1)" },
  
  // Date functions
  { name: "TODAY", category: "Date", description: "Current date", syntax: "TODAY()", example: "=TODAY()" },
  { name: "NOW", category: "Date", description: "Current date and time", syntax: "NOW()", example: "=NOW()" },
  { name: "DATEDIF", category: "Date", description: "Difference between dates", syntax: "DATEDIF(start, end, unit)", example: "=DATEDIF(A1, B1, \"D\")" },
  { name: "YEAR", category: "Date", description: "Extracts year", syntax: "YEAR(date)", example: "=YEAR(A1)" },
  { name: "MONTH", category: "Date", description: "Extracts month", syntax: "MONTH(date)", example: "=MONTH(B1)" },
  
  // Logical functions
  { name: "IF", category: "Logical", description: "Conditional logic", syntax: "IF(condition, true_value, false_value)", example: "=IF(A1>10, \"High\", \"Low\")" },
  { name: "AND", category: "Logical", description: "All conditions true", syntax: "AND(condition1, condition2, ...)", example: "=AND(A1>0, B1<100)" },
  { name: "OR", category: "Logical", description: "Any condition true", syntax: "OR(condition1, condition2, ...)", example: "=OR(A1=\"Yes\", B1=\"Yes\")" },
  { name: "NOT", category: "Logical", description: "Reverses logic", syntax: "NOT(condition)", example: "=NOT(A1=B1)" },
  
  // Lookup functions
  { name: "VLOOKUP", category: "Lookup", description: "Vertical lookup", syntax: "VLOOKUP(value, table, col_index, exact)", example: "=VLOOKUP(A1, B:D, 2, FALSE)" },
  { name: "HLOOKUP", category: "Lookup", description: "Horizontal lookup", syntax: "HLOOKUP(value, table, row_index, exact)", example: "=HLOOKUP(A1, 1:3, 2, FALSE)" },
  { name: "INDEX", category: "Lookup", description: "Returns value at position", syntax: "INDEX(array, row, col)", example: "=INDEX(A1:C10, 5, 2)" },
  { name: "MATCH", category: "Lookup", description: "Position of value", syntax: "MATCH(value, array, match_type)", example: "=MATCH(\"Apple\", A1:A10, 0)" }
];

interface FormulaEditorProps {
  initialFormula?: string;
  data?: any[];
  columns?: string[];
  onExecute?: (formula: string, result: any) => void;
  onSave?: (formula: string) => void;
}

export function FormulaEditor({ initialFormula = "", data = [], columns = [], onExecute, onSave }: FormulaEditorProps) {
  const [formula, setFormula] = useState(initialFormula);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = ["All", ...new Set(FORMULA_FUNCTIONS.map(f => f.category))];

  const filteredFunctions = FORMULA_FUNCTIONS.filter(func => {
    const matchesCategory = selectedCategory === "All" || func.category === selectedCategory;
    const matchesSearch = func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         func.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const parseFormula = (formulaStr: string): any => {
    try {
      setError(null);
      
      // Remove leading = if present
      const cleanFormula = formulaStr.startsWith('=') ? formulaStr.substring(1) : formulaStr;
      
      // Simple formula parser (in production, use a proper formula parser library)
      const result = evaluateFormula(cleanFormula, data, columns);
      
      return result;
    } catch (err: any) {
      setError(err.message || "Invalid formula");
      return null;
    }
  };

  const evaluateFormula = (formula: string, data: any[], columns: string[]): any => {
    // This is a simplified formula evaluator
    // In production, use a library like Formula.js or HyperFormula
    
    // Handle basic functions
    if (formula.startsWith('SUM(')) {
      const range = extractRange(formula);
      return calculateSum(data, range);
    } else if (formula.startsWith('AVERAGE(')) {
      const range = extractRange(formula);
      return calculateAverage(data, range);
    } else if (formula.startsWith('COUNT(')) {
      const range = extractRange(formula);
      return calculateCount(data, range);
    } else if (formula.startsWith('MAX(')) {
      const range = extractRange(formula);
      return calculateMax(data, range);
    } else if (formula.startsWith('MIN(')) {
      const range = extractRange(formula);
      return calculateMin(data, range);
    }
    
    // Try to evaluate as JavaScript expression (careful in production!)
    try {
      return eval(formula);
    } catch {
      throw new Error("Unsupported formula");
    }
  };

  const extractRange = (formula: string): { column: string; startRow: number; endRow: number } => {
    const match = formula.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
    if (!match) throw new Error("Invalid range format");
    
    return {
      column: match[1],
      startRow: parseInt(match[2]) - 1,
      endRow: parseInt(match[4]) - 1
    };
  };

  const calculateSum = (data: any[], range: any): number => {
    let sum = 0;
    for (let i = range.startRow; i <= range.endRow && i < data.length; i++) {
      const value = data[i][range.column];
      if (typeof value === 'number') sum += value;
    }
    return sum;
  };

  const calculateAverage = (data: any[], range: any): number => {
    const sum = calculateSum(data, range);
    const count = calculateCount(data, range);
    return count > 0 ? sum / count : 0;
  };

  const calculateCount = (data: any[], range: any): number => {
    let count = 0;
    for (let i = range.startRow; i <= range.endRow && i < data.length; i++) {
      const value = data[i][range.column];
      if (value !== null && value !== undefined && value !== '') count++;
    }
    return count;
  };

  const calculateMax = (data: any[], range: any): number => {
    let max = -Infinity;
    for (let i = range.startRow; i <= range.endRow && i < data.length; i++) {
      const value = data[i][range.column];
      if (typeof value === 'number' && value > max) max = value;
    }
    return max === -Infinity ? 0 : max;
  };

  const calculateMin = (data: any[], range: any): number => {
    let min = Infinity;
    for (let i = range.startRow; i <= range.endRow && i < data.length; i++) {
      const value = data[i][range.column];
      if (typeof value === 'number' && value < min) min = value;
    }
    return min === Infinity ? 0 : min;
  };

  const handleExecute = () => {
    const calculatedResult = parseFormula(formula);
    setResult(calculatedResult);
    
    if (onExecute && calculatedResult !== null) {
      onExecute(formula, calculatedResult);
    }
  };

  const insertFunction = (func: FormulaFunction) => {
    const newFormula = formula.slice(0, cursorPosition) + func.syntax + formula.slice(cursorPosition);
    setFormula(newFormula);
    
    // Focus back on input and position cursor after inserted function
    if (inputRef.current) {
      inputRef.current.focus();
      const newPosition = cursorPosition + func.syntax.length;
      inputRef.current.setSelectionRange(newPosition, newPosition);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Formula Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formula Input */}
          <div className="space-y-2">
            <Label>Formula</Label>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart || 0)}
                placeholder="=SUM(A1:A10)"
                className="font-mono"
              />
              <Button onClick={handleExecute}>
                <Play className="mr-2 h-4 w-4" />
                Execute
              </Button>
              {onSave && (
                <Button variant="outline" onClick={() => onSave(formula)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              )}
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          {/* Result Display */}
          {result !== null && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Result:</p>
              <p className="text-lg font-mono font-semibold">{String(result)}</p>
            </div>
          )}

          {/* Available Columns */}
          {columns.length > 0 && (
            <div>
              <Label>Available Columns</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {columns.map(col => (
                  <Badge key={col} variant="secondary" className="cursor-pointer" 
                    onClick={() => {
                      const newFormula = formula.slice(0, cursorPosition) + col + formula.slice(cursorPosition);
                      setFormula(newFormula);
                    }}
                  >
                    {col}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Function Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Function className="h-5 w-5" />
              Function Reference
            </span>
            <Input
              placeholder="Search functions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid grid-cols-7 w-full">
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="h-96 mt-4">
              <div className="space-y-2">
                {filteredFunctions.map(func => (
                  <Card key={func.name} className="cursor-pointer hover:bg-muted/50"
                    onClick={() => insertFunction(func)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold">{func.name}</span>
                            <Badge variant="outline" className="text-xs">{func.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{func.description}</p>
                          <div className="flex gap-4 text-xs">
                            <span className="font-mono text-muted-foreground">Syntax: {func.syntax}</span>
                            <span className="font-mono text-blue-600 dark:text-blue-400">Example: {func.example}</span>
                          </div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Click to insert at cursor position</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}