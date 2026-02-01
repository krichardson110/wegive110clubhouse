import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Plus, Trash2 } from 'lucide-react';

const iconOptions = [
  'BookOpen', 'Target', 'Users', 'Shield', 'Flame', 'Star', 'Heart', 'Lightbulb',
  'Trophy', 'Compass', 'Map', 'Flag', 'Award', 'Zap', 'Mountain', 'Rocket'
];

const gradientOptions = [
  { value: 'from-primary/20 to-accent/20 border-primary/40', label: 'Primary to Accent' },
  { value: 'from-blue-500/20 to-blue-600/20 border-blue-500/40', label: 'Blue' },
  { value: 'from-red-500/20 to-red-600/20 border-red-500/40', label: 'Red' },
  { value: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/40', label: 'Yellow' },
  { value: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/40', label: 'Emerald' },
  { value: 'from-pink-500/20 to-pink-600/20 border-pink-500/40', label: 'Pink' },
  { value: 'from-purple-500/20 to-purple-600/20 border-purple-500/40', label: 'Purple' },
];

interface Reading {
  id: string;
  title: string;
  author?: string;
  description: string;
  type: string;
  content: string;
  source?: string;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  type: string;
  timeEstimate: string;
}

interface ChapterFormData {
  title: string;
  subtitle: string;
  description: string;
  icon_name: string;
  color_gradient: string;
  published: boolean;
  chapter_number: number;
  chapter_order: number;
  key_takeaways: string[];
  readings: Reading[];
  exercises: Exercise[];
}

interface ChapterFormProps {
  initialData?: ChapterFormData;
  onSubmit: (data: ChapterFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ChapterForm = ({ initialData, onSubmit, onCancel, isLoading }: ChapterFormProps) => {
  const [formData, setFormData] = useState<ChapterFormData>(
    initialData || {
      title: '',
      subtitle: '',
      description: '',
      icon_name: 'BookOpen',
      color_gradient: 'from-primary/20 to-accent/20 border-primary/40',
      published: false,
      chapter_number: 1,
      chapter_order: 0,
      key_takeaways: [''],
      readings: [],
      exercises: [],
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty takeaways
    const cleanedData = {
      ...formData,
      key_takeaways: formData.key_takeaways.filter((t) => t.trim() !== ''),
    };
    await onSubmit(cleanedData);
  };

  // Key Takeaways handlers
  const addTakeaway = () => {
    setFormData({ ...formData, key_takeaways: [...formData.key_takeaways, ''] });
  };

  const updateTakeaway = (index: number, value: string) => {
    const updated = [...formData.key_takeaways];
    updated[index] = value;
    setFormData({ ...formData, key_takeaways: updated });
  };

  const removeTakeaway = (index: number) => {
    const updated = formData.key_takeaways.filter((_, i) => i !== index);
    setFormData({ ...formData, key_takeaways: updated.length ? updated : [''] });
  };

  // Readings handlers
  const addReading = () => {
    const newReading: Reading = {
      id: `r-${Date.now()}`,
      title: '',
      description: '',
      type: 'article',
      content: '',
    };
    setFormData({ ...formData, readings: [...formData.readings, newReading] });
  };

  const updateReading = (index: number, field: keyof Reading, value: string) => {
    const updated = [...formData.readings];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, readings: updated });
  };

  const removeReading = (index: number) => {
    const updated = formData.readings.filter((_, i) => i !== index);
    setFormData({ ...formData, readings: updated });
  };

  // Exercises handlers
  const addExercise = () => {
    const newExercise: Exercise = {
      id: `e-${Date.now()}`,
      title: '',
      description: '',
      type: 'reflection',
      timeEstimate: '15 min',
    };
    setFormData({ ...formData, exercises: [...formData.exercises, newExercise] });
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string) => {
    const updated = [...formData.exercises];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, exercises: updated });
  };

  const removeExercise = (index: number) => {
    const updated = formData.exercises.filter((_, i) => i !== index);
    setFormData({ ...formData, exercises: updated });
  };

  return (
    <Card className="bg-card border-border max-h-[80vh] overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-card z-10 border-b border-border">
        <CardTitle className="text-foreground">
          {initialData ? 'Edit Chapter' : 'Create New Chapter'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="takeaways">Takeaways</TabsTrigger>
              <TabsTrigger value="readings">Readings</TabsTrigger>
              <TabsTrigger value="exercises">Exercises</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Chapter title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Chapter subtitle"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Chapter description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select
                    value={formData.icon_name}
                    onValueChange={(value) => setFormData({ ...formData, icon_name: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradient">Color Theme</Label>
                  <Select
                    value={formData.color_gradient || ''}
                    onValueChange={(value) => setFormData({ ...formData, color_gradient: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradientOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chapter_number">Chapter Number</Label>
                  <Input
                    id="chapter_number"
                    type="number"
                    value={formData.chapter_number}
                    onChange={(e) =>
                      setFormData({ ...formData, chapter_number: parseInt(e.target.value) || 1 })
                    }
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chapter_order">Display Order</Label>
                  <Input
                    id="chapter_order"
                    type="number"
                    value={formData.chapter_order}
                    onChange={(e) =>
                      setFormData({ ...formData, chapter_order: parseInt(e.target.value) || 0 })
                    }
                    min={0}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                />
                <Label htmlFor="published">Published</Label>
              </div>
            </TabsContent>

            <TabsContent value="takeaways" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <Label>Key Takeaways</Label>
                <Button type="button" variant="outline" size="sm" onClick={addTakeaway}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Takeaway
                </Button>
              </div>
              <div className="space-y-2">
                {formData.key_takeaways.map((takeaway, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={takeaway}
                      onChange={(e) => updateTakeaway(index, e.target.value)}
                      placeholder={`Takeaway ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTakeaway(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="readings" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <Label>Reading Materials</Label>
                <Button type="button" variant="outline" size="sm" onClick={addReading}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Reading
                </Button>
              </div>
              <div className="space-y-4">
                {formData.readings.map((reading, index) => (
                  <Card key={reading.id} className="p-4 bg-secondary/20">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <Label className="text-sm font-medium">Reading {index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeReading(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      <Input
                        value={reading.title}
                        onChange={(e) => updateReading(index, 'title', e.target.value)}
                        placeholder="Title"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={reading.author || ''}
                          onChange={(e) => updateReading(index, 'author', e.target.value)}
                          placeholder="Author (optional)"
                        />
                        <Select
                          value={reading.type}
                          onValueChange={(value) => updateReading(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="article">Article</SelectItem>
                            <SelectItem value="quote">Quote</SelectItem>
                            <SelectItem value="story">Story</SelectItem>
                            <SelectItem value="excerpt">Excerpt</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        value={reading.description}
                        onChange={(e) => updateReading(index, 'description', e.target.value)}
                        placeholder="Brief description"
                      />
                      <Textarea
                        value={reading.content}
                        onChange={(e) => updateReading(index, 'content', e.target.value)}
                        placeholder="Full content"
                        rows={4}
                      />
                      <Input
                        value={reading.source || ''}
                        onChange={(e) => updateReading(index, 'source', e.target.value)}
                        placeholder="Source (optional)"
                      />
                    </div>
                  </Card>
                ))}
                {formData.readings.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No readings added yet. Click "Add Reading" to get started.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="exercises" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <Label>Exercises</Label>
                <Button type="button" variant="outline" size="sm" onClick={addExercise}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Exercise
                </Button>
              </div>
              <div className="space-y-4">
                {formData.exercises.map((exercise, index) => (
                  <Card key={exercise.id} className="p-4 bg-secondary/20">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <Label className="text-sm font-medium">Exercise {index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExercise(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      <Input
                        value={exercise.title}
                        onChange={(e) => updateExercise(index, 'title', e.target.value)}
                        placeholder="Exercise title"
                      />
                      <Textarea
                        value={exercise.description}
                        onChange={(e) => updateExercise(index, 'description', e.target.value)}
                        placeholder="Exercise description and instructions"
                        rows={3}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={exercise.type}
                          onValueChange={(value) => updateExercise(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reflection">Reflection</SelectItem>
                            <SelectItem value="action">Action</SelectItem>
                            <SelectItem value="discussion">Discussion</SelectItem>
                            <SelectItem value="journaling">Journaling</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={exercise.timeEstimate}
                          onChange={(e) => updateExercise(index, 'timeEstimate', e.target.value)}
                          placeholder="Time estimate (e.g., 15 min)"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                {formData.exercises.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No exercises added yet. Click "Add Exercise" to get started.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : initialData ? 'Update Chapter' : 'Create Chapter'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChapterForm;
