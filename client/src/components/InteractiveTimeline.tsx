import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2, Car, Home, Leaf } from "lucide-react";

interface TimelineEntry {
  id: string;
  date: string;
  category: string;
  amount: number;
  unit: string;
  icon: React.ElementType;
  color: string;
}

interface InteractiveTimelineProps {
  entries?: TimelineEntry[];
  onEntryAdd?: (entry: Omit<TimelineEntry, 'id'>) => void;
  onEntryDelete?: (entryId: string) => void;
}

export default function InteractiveTimeline({ 
  entries = [],
  onEntryAdd,
  onEntryDelete
}: InteractiveTimelineProps) {
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  const handleDragStart = (entryId: string) => {
    setIsDragging(entryId);
    console.log("Drag started for entry:", entryId);
  };

  const handleDragEnd = () => {
    setIsDragging(null);
    console.log("Drag ended");
  };

  const handleDeleteEntry = (entryId: string) => {
    onEntryDelete?.(entryId);
    console.log("Entry deleted:", entryId);
  };

  // Group entries by date for timeline visualization
  const entriesByDate = entries.reduce((acc, entry) => {
    const dateKey = entry.date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, TimelineEntry[]>);

  const sortedDates = Object.keys(entriesByDate).sort();

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 via-white to-green-50 border-blue-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Carbon Timeline
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => console.log("Add new entry")}
          className="hover-elevate"
          data-testid="button-add-timeline-entry"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-green-200 to-blue-200 rounded-full" />

        {/* Timeline entries */}
        <div className="space-y-6">
          {sortedDates.map((date, dateIndex) => (
            <div key={date} className="relative">
              {/* Date marker */}
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-white border-4 border-blue-300 rounded-full flex items-center justify-center shadow-md z-10 relative">
                  <span className="text-xs font-bold text-blue-700">
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-gray-800">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h4>
                </div>
              </div>

              {/* Entries for this date */}
              <div className="ml-20 space-y-3">
                {entriesByDate[date].map((entry, entryIndex) => {
                  const IconComponent = entry.icon;
                  const isSelected = selectedEntry === entry.id;
                  const beingDragged = isDragging === entry.id;

                  return (
                    <Card
                      key={entry.id}
                      className={`p-4 cursor-move transition-all duration-200 hover-elevate ${
                        beingDragged ? 'scale-105 shadow-xl opacity-50' : ''
                      } ${
                        isSelected ? 'ring-2 ring-blue-500' : ''
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(entry.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedEntry(entry.id)}
                      style={{
                        animationDelay: `${(dateIndex * 100) + (entryIndex * 50)}ms`
                      }}
                      data-testid={`timeline-entry-${entry.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${entry.color} rounded-full flex items-center justify-center`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          
                          <div>
                            <h5 className="font-semibold text-gray-900">{entry.category}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="secondary" 
                                className="text-xs"
                              >
                                {entry.amount} {entry.unit}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                ≈ {(entry.amount * 2.3).toFixed(1)} kg CO₂
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEntry(entry.id);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-entry-${entry.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {entries.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h4 className="text-lg font-semibold text-gray-500 mb-2">No entries yet</h4>
            <p className="text-gray-400 mb-4">Start tracking your carbon footprint by adding your first entry</p>
            <Button
              onClick={() => console.log("Add first entry")}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-add-first-entry"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Entry
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}