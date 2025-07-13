import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, DollarSign, Percent, Hash, Calendar } from "lucide-react";

export interface ChartFormat {
  numberFormat: string;
  unit: string;
  prefix: string;
  suffix: string;
  decimals: number;
  abbreviate: boolean;
  customFormat?: string;
}

export interface AxisConfig {
  label: string;
  min?: number;
  max?: number;
  tickInterval?: number;
  format: ChartFormat;
  showGrid: boolean;
  showAxis: boolean;
}

export interface ChartConfig {
  title: string;
  subtitle?: string;
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  yAxis2?: AxisConfig; // For dual axis
  showLegend: boolean;
  legendPosition: 'top' | 'bottom' | 'left' | 'right';
  showDataLabels: boolean;
  dataLabelFormat: ChartFormat;
  theme: 'light' | 'dark' | 'colorful';
}

interface ChartFormatterProps {
  config: ChartConfig;
  onChange: (config: ChartConfig) => void;
  availableMetrics?: string[];
}

const DEFAULT_FORMATS = [
  { label: 'Number', value: '0,0', icon: Hash },
  { label: 'Currency', value: '$0,0', icon: DollarSign },
  { label: 'Percentage', value: '0.0%', icon: Percent },
  { label: 'Millions', value: '$0.0,,"M"', icon: DollarSign },
  { label: 'Thousands', value: '0.0,"K"', icon: Hash },
  { label: 'Date', value: 'MMM YYYY', icon: Calendar },
];

const UNITS = [
  { label: 'None', value: '' },
  { label: 'Dollars ($)', value: '$' },
  { label: 'Percentage (%)', value: '%' },
  { label: 'Units', value: 'units' },
  { label: 'Hours', value: 'hrs' },
  { label: 'Days', value: 'days' },
  { label: 'Customers', value: 'customers' },
  { label: 'Per Unit', value: '/unit' },
  { label: 'Per Customer', value: '/customer' },
];

export function ChartFormatter({ config, onChange, availableMetrics = [] }: ChartFormatterProps) {
  const [activeTab, setActiveTab] = useState('general');

  const updateConfig = (updates: Partial<ChartConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateAxis = (axis: 'xAxis' | 'yAxis' | 'yAxis2', updates: Partial<AxisConfig>) => {
    if (axis === 'yAxis2' && !config.yAxis2) {
      // Initialize yAxis2 if it doesn't exist
      updateConfig({
        yAxis2: {
          label: 'Secondary Y-Axis',
          format: {
            numberFormat: '0,0',
            unit: '',
            prefix: '',
            suffix: '',
            decimals: 0,
            abbreviate: false,
          },
          showGrid: false,
          showAxis: true,
          ...updates,
        },
      });
    } else {
      updateConfig({
        [axis]: { ...config[axis], ...updates },
      });
    }
  };

  const updateAxisFormat = (axis: 'xAxis' | 'yAxis' | 'yAxis2', formatUpdates: Partial<ChartFormat>) => {
    updateAxis(axis, {
      format: { ...config[axis].format, ...formatUpdates },
    });
  };

  const FormatSelector = ({ 
    axis, 
    format 
  }: { 
    axis: 'xAxis' | 'yAxis' | 'yAxis2';
    format: ChartFormat;
  }) => (
    <div className="space-y-4">
      <div>
        <Label>Number Format</Label>
        <Select
          value={format.numberFormat}
          onValueChange={(value) => updateAxisFormat(axis, { numberFormat: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_FORMATS.map((fmt) => (
              <SelectItem key={fmt.value} value={fmt.value}>
                <div className="flex items-center gap-2">
                  <fmt.icon className="h-4 w-4" />
                  {fmt.label}
                </div>
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom Format</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {format.numberFormat === 'custom' && (
        <div>
          <Label>Custom Format String</Label>
          <Input
            value={format.customFormat || ''}
            onChange={(e) => updateAxisFormat(axis, { customFormat: e.target.value })}
            placeholder="e.g., 0,0.00"
          />
        </div>
      )}

      <div>
        <Label>Unit</Label>
        <Select
          value={format.unit}
          onValueChange={(value) => updateAxisFormat(axis, { unit: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNITS.map((unit) => (
              <SelectItem key={unit.value} value={unit.value}>
                {unit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Prefix</Label>
          <Input
            value={format.prefix}
            onChange={(e) => updateAxisFormat(axis, { prefix: e.target.value })}
            placeholder="e.g., $"
          />
        </div>
        <div>
          <Label>Suffix</Label>
          <Input
            value={format.suffix}
            onChange={(e) => updateAxisFormat(axis, { suffix: e.target.value })}
            placeholder="e.g., M"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Decimals</Label>
          <Input
            type="number"
            min="0"
            max="6"
            value={format.decimals}
            onChange={(e) => updateAxisFormat(axis, { decimals: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={format.abbreviate}
            onCheckedChange={(checked) => updateAxisFormat(axis, { abbreviate: checked })}
          />
          <Label>Abbreviate Large Numbers</Label>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Chart Formatting
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="xaxis">X-Axis</TabsTrigger>
            <TabsTrigger value="yaxis">Y-Axis</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div>
              <Label>Chart Title</Label>
              <Input
                value={config.title}
                onChange={(e) => updateConfig({ title: e.target.value })}
                placeholder="Enter chart title"
              />
            </div>

            <div>
              <Label>Subtitle</Label>
              <Input
                value={config.subtitle || ''}
                onChange={(e) => updateConfig({ subtitle: e.target.value })}
                placeholder="Optional subtitle"
              />
            </div>

            <div>
              <Label>Theme</Label>
              <Select
                value={config.theme}
                onValueChange={(value: 'light' | 'dark' | 'colorful') => 
                  updateConfig({ theme: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="colorful">Colorful</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.showLegend}
                  onCheckedChange={(checked) => updateConfig({ showLegend: checked })}
                />
                <Label>Show Legend</Label>
              </div>

              {config.showLegend && (
                <div>
                  <Label>Legend Position</Label>
                  <Select
                    value={config.legendPosition}
                    onValueChange={(value: 'top' | 'bottom' | 'left' | 'right') => 
                      updateConfig({ legendPosition: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={config.showDataLabels}
                onCheckedChange={(checked) => updateConfig({ showDataLabels: checked })}
              />
              <Label>Show Data Labels</Label>
            </div>
          </TabsContent>

          <TabsContent value="xaxis" className="space-y-4">
            <div>
              <Label>X-Axis Label</Label>
              <Input
                value={config.xAxis.label}
                onChange={(e) => updateAxis('xAxis', { label: e.target.value })}
                placeholder="Enter axis label"
              />
            </div>

            <FormatSelector axis="xAxis" format={config.xAxis.format} />

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.xAxis.showGrid}
                  onCheckedChange={(checked) => updateAxis('xAxis', { showGrid: checked })}
                />
                <Label>Show Grid Lines</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.xAxis.showAxis}
                  onCheckedChange={(checked) => updateAxis('xAxis', { showAxis: checked })}
                />
                <Label>Show Axis</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="yaxis" className="space-y-4">
            <div>
              <Label>Y-Axis Label</Label>
              <Input
                value={config.yAxis.label}
                onChange={(e) => updateAxis('yAxis', { label: e.target.value })}
                placeholder="Enter axis label"
              />
            </div>

            <FormatSelector axis="yAxis" format={config.yAxis.format} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Value</Label>
                <Input
                  type="number"
                  value={config.yAxis.min || ''}
                  onChange={(e) => updateAxis('yAxis', { 
                    min: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  placeholder="Auto"
                />
              </div>
              <div>
                <Label>Max Value</Label>
                <Input
                  type="number"
                  value={config.yAxis.max || ''}
                  onChange={(e) => updateAxis('yAxis', { 
                    max: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  placeholder="Auto"
                />
              </div>
            </div>

            <div>
              <Label>Tick Interval</Label>
              <Input
                type="number"
                value={config.yAxis.tickInterval || ''}
                onChange={(e) => updateAxis('yAxis', { 
                  tickInterval: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                placeholder="Auto"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.yAxis.showGrid}
                  onCheckedChange={(checked) => updateAxis('yAxis', { showGrid: checked })}
                />
                <Label>Show Grid Lines</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.yAxis.showAxis}
                  onCheckedChange={(checked) => updateAxis('yAxis', { showAxis: checked })}
                />
                <Label>Show Axis</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={!!config.yAxis2}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateAxis('yAxis2', { label: 'Secondary Y-Axis' });
                    } else {
                      updateConfig({ yAxis2: undefined });
                    }
                  }}
                />
                <Label>Enable Dual Y-Axis</Label>
              </div>

              {config.yAxis2 && (
                <div className="mt-4 space-y-4 pl-6">
                  <div>
                    <Label>Secondary Y-Axis Label</Label>
                    <Input
                      value={config.yAxis2.label}
                      onChange={(e) => updateAxis('yAxis2', { label: e.target.value })}
                      placeholder="Enter axis label"
                    />
                  </div>

                  <FormatSelector axis="yAxis2" format={config.yAxis2.format} />
                </div>
              )}
            </div>

            {config.showDataLabels && (
              <div>
                <h4 className="text-sm font-medium mb-2">Data Label Format</h4>
                <FormatSelector 
                  axis="yAxis" 
                  format={config.dataLabelFormat} 
                />
              </div>
            )}

            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  // Reset to defaults
                  onChange({
                    ...config,
                    xAxis: {
                      ...config.xAxis,
                      format: {
                        numberFormat: '0,0',
                        unit: '',
                        prefix: '',
                        suffix: '',
                        decimals: 0,
                        abbreviate: false,
                      },
                    },
                    yAxis: {
                      ...config.yAxis,
                      format: {
                        numberFormat: '0,0',
                        unit: '',
                        prefix: '',
                        suffix: '',
                        decimals: 0,
                        abbreviate: false,
                      },
                    },
                  });
                }}
              >
                Reset to Defaults
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Utility function to format numbers based on ChartFormat
export function formatNumber(value: number, format?: ChartFormat): string {
  if (value == null || isNaN(value)) return 'N/A';
  
  // Provide default format if not provided
  if (!format) {
    format = {
      numberFormat: '0,0',
      unit: '',
      prefix: '',
      suffix: '',
      decimals: 0,
      abbreviate: false
    };
  }

  let formatted = value;
  let dynamicSuffix = format.suffix || '';
  
  // Apply abbreviation if needed
  if (format.abbreviate && Math.abs(value) >= 1000) {
    const units = ['', 'K', 'M', 'B', 'T'];
    const unitIndex = Math.floor(Math.log10(Math.abs(value)) / 3);
    const unitValue = value / Math.pow(1000, unitIndex);
    formatted = unitValue;
    dynamicSuffix = dynamicSuffix + units[Math.min(unitIndex, units.length - 1)];
  }

  // Apply number format
  let result = '';
  
  switch (format.numberFormat) {
    case '$0,0':
      result = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: format.decimals,
      }).format(formatted);
      break;
      
    case '0.0%':
      result = new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: format.decimals || 1,
      }).format(formatted / 100);
      break;
      
    case '$0.0,,"M"':
      result = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 1,
        maximumFractionDigits: format.decimals || 1,
      }).format(formatted / 1000000) + 'M';
      break;
      
    case '0.0,"K"':
      result = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: format.decimals || 1,
      }).format(formatted / 1000) + 'K';
      break;
      
    default:
      result = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: format.decimals,
        maximumFractionDigits: format.decimals,
      }).format(formatted);
  }

  // Apply prefix and suffix
  if (format.prefix) result = format.prefix + result;
  if (format.suffix && !result.includes(format.suffix)) result = result + format.suffix;

  return result;
}