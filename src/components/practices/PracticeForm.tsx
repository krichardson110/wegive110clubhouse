import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { 
  Practice, 
  PracticeDrill, 
  seasons, 
  phases, 
  seasonConfig, 
  phaseConfig, 
  drillPhases,
  focusAreaOptions,
  PracticeSeason,
  PracticePhase
} from "@/types/practice";
import { Badge } from "@/components/ui/badge";
import RecurrencePicker, { RecurrenceConfig } from "@/components/RecurrencePicker";

interface PracticeFormData {
  title: string;
  description: string;
  practice_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  season: PracticeSeason;
  phase: PracticePhase;
  location: string;
  focus_areas: string[];
  equipment_needed: string[];
  notes: string;
  published: boolean;
  drills: {
    phase_name: string;
    drill_number: number;
    drill_name: string;
    description: string;
    coaching_points: string[];
    duration_minutes: number;
    diagram_url: string;
    video_url: string;
    notes: string;
  }[];
}

interface PracticeFormProps {
  practice?: Practice | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  teamId?: string;
}

const PracticeForm = ({ practice, onSubmit, onCancel, isLoading, teamId }: PracticeFormProps) => {
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>(practice?.focus_areas || []);
  const [equipmentInput, setEquipmentInput] = useState("");
  const [equipment, setEquipment] = useState<string[]>(practice?.equipment_needed || []);
  const [recurrence, setRecurrence] = useState<RecurrenceConfig>({
    pattern: "none",
    endDate: (() => { const d = new Date(); d.setMonth(d.getMonth() + 3); return d.toISOString().split("T")[0]; })(),
  });

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<PracticeFormData>({
    defaultValues: {
      title: practice?.title || "",
      description: practice?.description || "",
      practice_date: practice?.practice_date || new Date().toISOString().split("T")[0],
      start_time: practice?.start_time || "17:00",
      end_time: practice?.end_time || "19:00",
      duration_minutes: practice?.duration_minutes || 120,
      season: practice?.season || "spring",
      phase: practice?.phase || "in-season",
      location: practice?.location || "",
      focus_areas: practice?.focus_areas || [],
      equipment_needed: practice?.equipment_needed || [],
      notes: practice?.notes || "",
      published: practice?.published ?? true,
      drills: practice?.drills?.map(d => ({
        phase_name: d.phase_name,
        drill_number: d.drill_number || 0,
        drill_name: d.drill_name,
        description: d.description || "",
        coaching_points: d.coaching_points || [],
        duration_minutes: d.duration_minutes || 10,
        diagram_url: d.diagram_url || "",
        video_url: d.video_url || "",
        notes: d.notes || "",
      })) || [],
    },
  });

  const { fields: drillFields, append: appendDrill, remove: removeDrill } = useFieldArray({
    control,
    name: "drills",
  });

  const toggleFocusArea = (area: string) => {
    setSelectedFocusAreas(prev => {
      if (prev.includes(area)) {
        return prev.filter(a => a !== area);
      }
      return [...prev, area];
    });
  };

  const addEquipment = () => {
    if (equipmentInput.trim() && !equipment.includes(equipmentInput.trim())) {
      setEquipment(prev => [...prev, equipmentInput.trim()]);
      setEquipmentInput("");
    }
  };

  const removeEquipment = (item: string) => {
    setEquipment(prev => prev.filter(e => e !== item));
  };

  const onFormSubmit = (data: PracticeFormData) => {
    onSubmit({
      ...data,
      focus_areas: selectedFocusAreas,
      equipment_needed: equipment,
      team_id: teamId,
      recurrence: !practice ? recurrence : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="title">Practice Title *</Label>
          <Input
            id="title"
            {...register("title", { required: "Title is required" })}
            placeholder="e.g., Spring Hitting Focus Practice"
          />
          {errors.title && <span className="text-xs text-destructive">{errors.title.message}</span>}
        </div>

        <div>
          <Label htmlFor="practice_date">Date *</Label>
          <Input
            id="practice_date"
            type="date"
            {...register("practice_date", { required: "Date is required" })}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              type="time"
              {...register("start_time")}
            />
          </div>
          <div>
            <Label htmlFor="end_time">End Time</Label>
            <Input
              id="end_time"
              type="time"
              {...register("end_time")}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="season">Season</Label>
          <Select
            value={watch("season")}
            onValueChange={(value) => setValue("season", value as PracticeSeason)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season} value={season}>
                  {seasonConfig[season].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="phase">Phase</Label>
          <Select
            value={watch("phase")}
            onValueChange={(value) => setValue("phase", value as PracticePhase)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {phases.map((phase) => (
                <SelectItem key={phase} value={phase}>
                  {phaseConfig[phase].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="duration_minutes">Duration (minutes)</Label>
          <Input
            id="duration_minutes"
            type="number"
            {...register("duration_minutes", { valueAsNumber: true })}
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register("location")}
            placeholder="e.g., Main Field"
          />
        </div>

        <div className="md:col-span-2">
          <Label>Focus Areas</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {focusAreaOptions.map((area) => (
              <Badge
                key={area}
                variant={selectedFocusAreas.includes(area) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleFocusArea(area)}
              >
                {area}
              </Badge>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <Label>Equipment Needed</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={equipmentInput}
              onChange={(e) => setEquipmentInput(e.target.value)}
              placeholder="Add equipment..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addEquipment();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addEquipment}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {equipment.map((item) => (
              <Badge key={item} variant="secondary" className="gap-1">
                {item}
                <button
                  type="button"
                  onClick={() => removeEquipment(item)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Describe the practice goals and objectives..."
            rows={3}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="notes">Coach Notes</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Internal notes for coaches..."
            rows={2}
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="published"
            checked={watch("published")}
            onCheckedChange={(checked) => setValue("published", checked)}
          />
          <Label htmlFor="published">Published (visible to team)</Label>
        </div>

        {/* Recurrence - only show for new practices */}
        {!practice && (
          <div className="md:col-span-2">
            <RecurrencePicker
              value={recurrence}
              onChange={setRecurrence}
              minDate={watch("practice_date")}
            />
          </div>
        )}
      </div>

      {/* Drills Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Practice Drills</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendDrill({
              phase_name: "Warmup Routine",
              drill_number: drillFields.length + 1,
              drill_name: "",
              description: "",
              coaching_points: [],
              duration_minutes: 10,
              diagram_url: "",
              video_url: "",
              notes: "",
            })}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Drill
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {drillFields.map((field, index) => (
            <div key={field.id} className="p-4 border border-border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Drill #{index + 1}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDrill(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Phase</Label>
                  <Select
                    value={watch(`drills.${index}.phase_name`)}
                    onValueChange={(value) => setValue(`drills.${index}.phase_name`, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {drillPhases.map((phase) => (
                        <SelectItem key={phase} value={phase}>
                          {phase}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label>Drill Name</Label>
                  <Input
                    {...register(`drills.${index}.drill_name`)}
                    placeholder="e.g., Wrist Flips"
                  />
                </div>

                <div className="md:col-span-3">
                  <Label>Description</Label>
                  <Textarea
                    {...register(`drills.${index}.description`)}
                    placeholder="Describe the drill..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Duration (min)</Label>
                  <Input
                    type="number"
                    {...register(`drills.${index}.duration_minutes`, { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label>Video URL</Label>
                  <Input
                    {...register(`drills.${index}.video_url`)}
                    placeholder="YouTube or video link"
                  />
                </div>

                <div>
                  <Label>Diagram URL</Label>
                  <Input
                    {...register(`drills.${index}.diagram_url`)}
                    placeholder="Image link"
                  />
                </div>
              </div>
            </div>
          ))}

          {drillFields.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No drills added yet. Click "Add Drill" to start building your practice plan.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : practice ? "Update Practice" : "Create Practice"}
        </Button>
      </div>
    </form>
  );
};

export default PracticeForm;
