import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Grip, X, Save, Settings, Maximize2, Minimize2 } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Widget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'text' | 'formula';
  title: string;
  config: any;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number };
}

interface DashboardLayout {
  id: string;
  name: string;
  widgets: Widget[];
  grid: { cols: number; rows: number };
}

interface DashboardBuilderProps {
  dataSourceId?: number;
  onSave: (layout: DashboardLayout) => void;
  initialLayout?: DashboardLayout;
}

function SortableWidget({ widget, onRemove, onConfigure, onResize }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-1',
    large: 'col-span-2 row-span-2',
    full: 'col-span-4 row-span-2'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${sizeClasses[widget.size]}`}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                {...attributes}
                {...listeners}
                className="cursor-move"
              >
                <Grip className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-sm">{widget.title}</CardTitle>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onResize(widget.id)}
              >
                {widget.size === 'full' ? 
                  <Minimize2 className="h-3 w-3" /> : 
                  <Maximize2 className="h-3 w-3" />
                }
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onConfigure(widget)}
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onRemove(widget.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <WidgetContent widget={widget} />
        </CardContent>
      </Card>
    </div>
  );
}

function WidgetContent({ widget }: { widget: Widget }) {
  switch (widget.type) {
    case 'metric':
      return (
        <div className="text-center">
          <p className="text-3xl font-bold">{widget.config.value || '0'}</p>
          <p className="text-sm text-muted-foreground">{widget.config.label || 'Metric'}</p>
        </div>
      );
    case 'chart':
      return (
        <div className="h-48 flex items-center justify-center bg-muted/10 rounded">
          <p className="text-muted-foreground">Chart: {widget.config.chartType || 'Line'}</p>
        </div>
      );
    case 'table':
      return (
        <div className="h-48 flex items-center justify-center bg-muted/10 rounded">
          <p className="text-muted-foreground">Data Table</p>
        </div>
      );
    case 'text':
      return (
        <div className="prose prose-sm dark:prose-invert">
          {widget.config.content || 'Text widget'}
        </div>
      );
    case 'formula':
      return (
        <div className="font-mono text-sm p-2 bg-muted/20 rounded">
          {widget.config.formula || '=SUM(A1:A10)'}
        </div>
      );
    default:
      return null;
  }
}

export function DashboardBuilder({ dataSourceId, onSave, initialLayout }: DashboardBuilderProps) {
  const [layout, setLayout] = useState<DashboardLayout>(initialLayout || {
    id: `dashboard-${Date.now()}`,
    name: 'New Dashboard',
    widgets: [],
    grid: { cols: 4, rows: 6 }
  });

  const [showAddWidget, setShowAddWidget] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [showConfigure, setShowConfigure] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLayout(prev => {
        const oldIndex = prev.widgets.findIndex(w => w.id === active.id);
        const newIndex = prev.widgets.findIndex(w => w.id === over.id);
        
        return {
          ...prev,
          widgets: arrayMove(prev.widgets, oldIndex, newIndex)
        };
      });
    }
  };

  const addWidget = (type: Widget['type']) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: `New ${type} widget`,
      config: getDefaultConfig(type),
      size: 'medium',
      position: { x: 0, y: 0 }
    };

    setLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }));
    setShowAddWidget(false);
  };

  const removeWidget = (id: string) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== id)
    }));
  };

  const configureWidget = (widget: Widget) => {
    setSelectedWidget(widget);
    setShowConfigure(true);
  };

  const updateWidget = (widgetId: string, updates: Partial<Widget>) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, ...updates } : w
      )
    }));
  };

  const resizeWidget = (widgetId: string) => {
    const widget = layout.widgets.find(w => w.id === widgetId);
    if (!widget) return;

    const sizes: Widget['size'][] = ['small', 'medium', 'large', 'full'];
    const currentIndex = sizes.indexOf(widget.size);
    const nextIndex = (currentIndex + 1) % sizes.length;

    updateWidget(widgetId, { size: sizes[nextIndex] });
  };

  const getDefaultConfig = (type: Widget['type']) => {
    switch (type) {
      case 'metric':
        return { value: '0', label: 'New Metric', format: 'number' };
      case 'chart':
        return { chartType: 'line', dataKey: '', xAxis: '', yAxis: '' };
      case 'table':
        return { columns: [], pageSize: 10 };
      case 'text':
        return { content: 'Enter text here...' };
      case 'formula':
        return { formula: '=SUM(A1:A10)', result: null };
      default:
        return {};
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Builder</h2>
          <p className="text-muted-foreground">Drag and drop widgets to create your custom dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddWidget(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Widget
          </Button>
          <Button onClick={() => onSave(layout)} variant="default">
            <Save className="mr-2 h-4 w-4" />
            Save Dashboard
          </Button>
        </div>
      </div>

      {/* Dashboard Canvas */}
      <div className="border-2 border-dashed border-muted rounded-lg p-4 min-h-[600px]">
        {layout.widgets.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No widgets added yet</p>
              <Button onClick={() => setShowAddWidget(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Widget
              </Button>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={layout.widgets.map(w => w.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-4 gap-4">
                {layout.widgets.map(widget => (
                  <SortableWidget
                    key={widget.id}
                    widget={widget}
                    onRemove={removeWidget}
                    onConfigure={configureWidget}
                    onResize={resizeWidget}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add Widget Dialog */}
      <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Widget</DialogTitle>
            <DialogDescription>Choose a widget type to add to your dashboard</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              variant="outline"
              className="h-24 flex-col"
              onClick={() => addWidget('metric')}
            >
              <span className="text-2xl mb-2">📊</span>
              <span>Metric</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col"
              onClick={() => addWidget('chart')}
            >
              <span className="text-2xl mb-2">📈</span>
              <span>Chart</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col"
              onClick={() => addWidget('table')}
            >
              <span className="text-2xl mb-2">📋</span>
              <span>Table</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col"
              onClick={() => addWidget('text')}
            >
              <span className="text-2xl mb-2">📝</span>
              <span>Text</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col"
              onClick={() => addWidget('formula')}
            >
              <span className="text-2xl mb-2">🔢</span>
              <span>Formula</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Configure Widget Dialog */}
      <Dialog open={showConfigure} onOpenChange={setShowConfigure}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Widget</DialogTitle>
          </DialogHeader>
          {selectedWidget && (
            <WidgetConfigForm
              widget={selectedWidget}
              onUpdate={(updates) => {
                updateWidget(selectedWidget.id, updates);
                setShowConfigure(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WidgetConfigForm({ widget, onUpdate }: { widget: Widget; onUpdate: (updates: Partial<Widget>) => void }) {
  const [config, setConfig] = useState(widget.config);
  const [title, setTitle] = useState(widget.title);

  const handleSave = () => {
    onUpdate({ config, title });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Widget Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter widget title"
        />
      </div>

      {widget.type === 'metric' && (
        <>
          <div>
            <Label>Value</Label>
            <Input
              value={config.value}
              onChange={(e) => setConfig({ ...config, value: e.target.value })}
              placeholder="0"
            />
          </div>
          <div>
            <Label>Label</Label>
            <Input
              value={config.label}
              onChange={(e) => setConfig({ ...config, label: e.target.value })}
              placeholder="Metric label"
            />
          </div>
        </>
      )}

      {widget.type === 'chart' && (
        <>
          <div>
            <Label>Chart Type</Label>
            <Select
              value={config.chartType}
              onValueChange={(value) => setConfig({ ...config, chartType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="scatter">Scatter Plot</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {widget.type === 'text' && (
        <div>
          <Label>Content</Label>
          <textarea
            className="w-full p-2 border rounded-md"
            rows={4}
            value={config.content}
            onChange={(e) => setConfig({ ...config, content: e.target.value })}
            placeholder="Enter text content..."
          />
        </div>
      )}

      {widget.type === 'formula' && (
        <div>
          <Label>Formula</Label>
          <Input
            value={config.formula}
            onChange={(e) => setConfig({ ...config, formula: e.target.value })}
            placeholder="=SUM(A1:A10)"
            className="font-mono"
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onUpdate({})}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}