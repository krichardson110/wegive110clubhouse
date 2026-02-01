import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

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

interface JourneyFormData {
  title: string;
  description: string;
  icon_name: string;
  color_gradient: string;
  published: boolean;
  journey_order: number;
}

interface JourneyFormProps {
  initialData?: JourneyFormData;
  onSubmit: (data: JourneyFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const JourneyForm = ({ initialData, onSubmit, onCancel, isLoading }: JourneyFormProps) => {
  const [formData, setFormData] = useState<JourneyFormData>(
    initialData || {
      title: '',
      description: '',
      icon_name: 'BookOpen',
      color_gradient: 'from-primary/20 to-accent/20 border-primary/40',
      published: false,
      journey_order: 0,
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">
          {initialData ? 'Edit Journey' : 'Create New Journey'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Journey title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Journey description"
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

          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              value={formData.journey_order}
              onChange={(e) => setFormData({ ...formData, journey_order: parseInt(e.target.value) || 0 })}
              min={0}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
            />
            <Label htmlFor="published">Published</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : initialData ? 'Update Journey' : 'Create Journey'}
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

export default JourneyForm;
