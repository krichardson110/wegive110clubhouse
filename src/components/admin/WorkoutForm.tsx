import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Workout, WorkoutCategory } from "@/types/workout";

interface WorkoutFormProps {
  workout?: Workout | null;
  categories: WorkoutCategory[];
  defaultCategoryId?: string;
  onSubmit: (data: Partial<Workout>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const WorkoutForm = ({
  workout,
  categories,
  defaultCategoryId,
  onSubmit,
  onCancel,
  isLoading,
}: WorkoutFormProps) => {
  const [formData, setFormData] = useState({
    category_id: defaultCategoryId || "",
    title: "",
    description: "",
    duration: "",
    difficulty: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    exercises: 0,
    youtube_id: "",
    published: true,
  });

  useEffect(() => {
    if (workout) {
      setFormData({
        category_id: workout.category_id,
        title: workout.title,
        description: workout.description || "",
        duration: workout.duration || "",
        difficulty: workout.difficulty,
        exercises: workout.exercises,
        youtube_id: workout.youtube_id || "",
        published: workout.published,
      });
    } else if (defaultCategoryId) {
      setFormData((prev) => ({ ...prev, category_id: defaultCategoryId }));
    }
  }, [workout, defaultCategoryId]);

  // Extract YouTube ID from various URL formats
  const extractYouTubeId = (input: string): string => {
    if (!input) return "";
    
    // Already just an ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input;
    }
    
    // Various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }
    
    return input;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      youtube_id: extractYouTubeId(formData.youtube_id) || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category_id}
          onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Workout Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Lower Body Power"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this workout..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="e.g., 45 min"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exercises">Exercises</Label>
          <Input
            id="exercises"
            type="number"
            min="0"
            value={formData.exercises}
            onChange={(e) => setFormData({ ...formData, exercises: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value: "Beginner" | "Intermediate" | "Advanced") =>
              setFormData({ ...formData, difficulty: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="youtube_id">YouTube Video (optional)</Label>
        <Input
          id="youtube_id"
          value={formData.youtube_id}
          onChange={(e) => setFormData({ ...formData, youtube_id: e.target.value })}
          placeholder="YouTube URL or video ID"
        />
        <p className="text-xs text-muted-foreground">
          Paste a YouTube URL or video ID to link a demo video
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="published"
          checked={formData.published}
          onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
        />
        <Label htmlFor="published">Published</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formData.category_id}>
          {isLoading ? "Saving..." : workout ? "Update Workout" : "Add Workout"}
        </Button>
      </div>
    </form>
  );
};

export default WorkoutForm;
