import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables, Json } from '@/integrations/supabase/types';
import { Plus, BookOpen, ArrowLeft, Loader2 } from 'lucide-react';
import JourneyForm from '@/components/admin/JourneyForm';
import ChapterForm from '@/components/admin/ChapterForm';
import SortableJourneyCard from '@/components/admin/SortableJourneyCard';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

type Journey = Tables<'journeys'>;
type Chapter = Tables<'chapters'>;

interface JourneyFormData {
  title: string;
  description: string;
  icon_name: string;
  color_gradient: string;
  published: boolean;
  journey_order: number;
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
  readings: { id: string; title: string; author?: string; description: string; type: string; content: string; source?: string }[];
  exercises: { id: string; title: string; description: string; type: string; timeEstimate: string }[];
}

const PlaybookAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, isSuperAdmin } = useAuth();

  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [journeyModalOpen, setJourneyModalOpen] = useState(false);
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isSuperAdmin) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this page.',
          variant: 'destructive',
        });
        navigate('/playbook');
      } else {
        fetchData();
      }
    }
  }, [user, authLoading, isSuperAdmin, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [journeysRes, chaptersRes] = await Promise.all([
        supabase.from('journeys').select('*').order('journey_order'),
        supabase.from('chapters').select('*').order('chapter_order'),
      ]);

      if (journeysRes.error) throw journeysRes.error;
      if (chaptersRes.error) throw chaptersRes.error;

      setJourneys(journeysRes.data || []);
      setChapters(chaptersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load playbook data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Journey handlers
  const handleCreateJourney = async (data: JourneyFormData) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('journeys').insert({
        title: data.title,
        description: data.description,
        icon_name: data.icon_name,
        color_gradient: data.color_gradient,
        published: data.published,
        journey_order: data.journey_order,
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Journey created successfully.' });
      setJourneyModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating journey:', error);
      toast({ title: 'Error', description: 'Failed to create journey.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateJourney = async (data: JourneyFormData) => {
    if (!editingJourney) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('journeys')
        .update({
          title: data.title,
          description: data.description,
          icon_name: data.icon_name,
          color_gradient: data.color_gradient,
          published: data.published,
          journey_order: data.journey_order,
        })
        .eq('id', editingJourney.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Journey updated successfully.' });
      setJourneyModalOpen(false);
      setEditingJourney(null);
      fetchData();
    } catch (error) {
      console.error('Error updating journey:', error);
      toast({ title: 'Error', description: 'Failed to update journey.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJourney = async (journeyId: string) => {
    try {
      const { error } = await supabase.from('journeys').delete().eq('id', journeyId);
      if (error) throw error;

      toast({ title: 'Success', description: 'Journey deleted successfully.' });
      fetchData();
    } catch (error) {
      console.error('Error deleting journey:', error);
      toast({ title: 'Error', description: 'Failed to delete journey.', variant: 'destructive' });
    }
  };

  const handleReorderJourneys = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = journeys.findIndex((j) => j.id === active.id);
      const newIndex = journeys.findIndex((j) => j.id === over.id);

      const newJourneys = [...journeys];
      const [removed] = newJourneys.splice(oldIndex, 1);
      newJourneys.splice(newIndex, 0, removed);

      // Optimistic update
      setJourneys(newJourneys);

      // Update database
      try {
        const updates = newJourneys.map((journey, index) => ({
          id: journey.id,
          journey_order: index,
        }));

        for (const update of updates) {
          const { error } = await supabase
            .from('journeys')
            .update({ journey_order: update.journey_order })
            .eq('id', update.id);

          if (error) throw error;
        }

        toast({ title: 'Reordered', description: 'Journey order updated.' });
      } catch (error) {
        console.error('Error reordering journeys:', error);
        toast({ title: 'Error', description: 'Failed to save new order.', variant: 'destructive' });
        fetchData(); // Revert on error
      }
    }
  };

  // Chapter handlers
  const handleCreateChapter = async (data: ChapterFormData) => {
    if (!selectedJourneyId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('chapters').insert({
        journey_id: selectedJourneyId,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        icon_name: data.icon_name,
        color_gradient: data.color_gradient,
        published: data.published,
        chapter_number: data.chapter_number,
        chapter_order: data.chapter_order,
        key_takeaways: data.key_takeaways as unknown as Json,
        readings: data.readings as unknown as Json,
        exercises: data.exercises as unknown as Json,
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Chapter created successfully.' });
      setChapterModalOpen(false);
      setSelectedJourneyId(null);
      fetchData();
    } catch (error) {
      console.error('Error creating chapter:', error);
      toast({ title: 'Error', description: 'Failed to create chapter.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateChapter = async (data: ChapterFormData) => {
    if (!editingChapter) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('chapters')
        .update({
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          icon_name: data.icon_name,
          color_gradient: data.color_gradient,
          published: data.published,
          chapter_number: data.chapter_number,
          chapter_order: data.chapter_order,
          key_takeaways: data.key_takeaways as unknown as Json,
          readings: data.readings as unknown as Json,
          exercises: data.exercises as unknown as Json,
        })
        .eq('id', editingChapter.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Chapter updated successfully.' });
      setChapterModalOpen(false);
      setEditingChapter(null);
      fetchData();
    } catch (error) {
      console.error('Error updating chapter:', error);
      toast({ title: 'Error', description: 'Failed to update chapter.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      const { error } = await supabase.from('chapters').delete().eq('id', chapterId);
      if (error) throw error;

      toast({ title: 'Success', description: 'Chapter deleted successfully.' });
      fetchData();
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast({ title: 'Error', description: 'Failed to delete chapter.', variant: 'destructive' });
    }
  };

  const handleReorderChapters = async (journeyId: string, reorderedChapters: Chapter[]) => {
    // Optimistic update
    setChapters((prev) => {
      const otherChapters = prev.filter((ch) => ch.journey_id !== journeyId);
      return [...otherChapters, ...reorderedChapters];
    });

    // Update database
    try {
      for (const chapter of reorderedChapters) {
        const { error } = await supabase
          .from('chapters')
          .update({ chapter_order: chapter.chapter_order })
          .eq('id', chapter.id);

        if (error) throw error;
      }

      toast({ title: 'Reordered', description: 'Chapter order updated.' });
    } catch (error) {
      console.error('Error reordering chapters:', error);
      toast({ title: 'Error', description: 'Failed to save new order.', variant: 'destructive' });
      fetchData(); // Revert on error
    }
  };

  const getChaptersForJourney = (journeyId: string) => {
    return chapters.filter((ch) => ch.journey_id === journeyId).sort((a, b) => a.chapter_order - b.chapter_order);
  };

  const convertChapterToFormData = (chapter: Chapter): ChapterFormData => {
    return {
      title: chapter.title,
      subtitle: chapter.subtitle || '',
      description: chapter.description || '',
      icon_name: chapter.icon_name || 'BookOpen',
      color_gradient: chapter.color_gradient || 'from-primary/20 to-accent/20 border-primary/40',
      published: chapter.published,
      chapter_number: chapter.chapter_number,
      chapter_order: chapter.chapter_order,
      key_takeaways: (chapter.key_takeaways as string[]) || [''],
      readings: (chapter.readings as ChapterFormData['readings']) || [],
      exercises: (chapter.exercises as ChapterFormData['exercises']) || [],
    };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        {/* Header */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270_50%_12%)] to-background" />
          <div className="relative z-10 container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/playbook">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Playbook
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/20 text-primary">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide">
                    PLAYBOOK <span className="gradient-text">ADMIN</span>
                  </h1>
                  <p className="text-muted-foreground">Manage journeys and chapters • Drag to reorder</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setEditingJourney(null);
                  setJourneyModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Journey
              </Button>
            </div>
          </div>
        </section>

        {/* Journeys List */}
        <section className="py-8">
          <div className="container mx-auto px-4 pl-8">
            {journeys.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-lg border border-border">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Journeys Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first journey to start building the playbook.
                </p>
                <Button
                  onClick={() => {
                    setEditingJourney(null);
                    setJourneyModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Journey
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleReorderJourneys}
              >
                <SortableContext
                  items={journeys.map((j) => j.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {journeys.map((journey) => (
                      <SortableJourneyCard
                        key={journey.id}
                        journey={journey}
                        chapters={getChaptersForJourney(journey.id)}
                        onEdit={() => {
                          setEditingJourney(journey);
                          setJourneyModalOpen(true);
                        }}
                        onDelete={() => handleDeleteJourney(journey.id)}
                        onAddChapter={() => {
                          setSelectedJourneyId(journey.id);
                          setEditingChapter(null);
                          setChapterModalOpen(true);
                        }}
                        onEditChapter={(chapter) => {
                          setEditingChapter(chapter);
                          setChapterModalOpen(true);
                        }}
                        onDeleteChapter={handleDeleteChapter}
                        onReorderChapters={handleReorderChapters}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </section>
      </main>
      <Footer />

      {/* Journey Modal */}
      <Dialog open={journeyModalOpen} onOpenChange={setJourneyModalOpen}>
        <DialogContent className="max-w-lg p-0 border-none bg-transparent">
          <JourneyForm
            initialData={
              editingJourney
                ? {
                    title: editingJourney.title,
                    description: editingJourney.description || '',
                    icon_name: editingJourney.icon_name || 'BookOpen',
                    color_gradient: editingJourney.color_gradient || 'from-primary/20 to-accent/20 border-primary/40',
                    published: editingJourney.published,
                    journey_order: editingJourney.journey_order,
                  }
                : undefined
            }
            onSubmit={editingJourney ? handleUpdateJourney : handleCreateJourney}
            onCancel={() => {
              setJourneyModalOpen(false);
              setEditingJourney(null);
            }}
            isLoading={saving}
          />
        </DialogContent>
      </Dialog>

      {/* Chapter Modal */}
      <Dialog open={chapterModalOpen} onOpenChange={setChapterModalOpen}>
        <DialogContent className="max-w-2xl p-0 border-none bg-transparent">
          <ChapterForm
            initialData={editingChapter ? convertChapterToFormData(editingChapter) : undefined}
            onSubmit={editingChapter ? handleUpdateChapter : handleCreateChapter}
            onCancel={() => {
              setChapterModalOpen(false);
              setEditingChapter(null);
              setSelectedJourneyId(null);
            }}
            isLoading={saving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlaybookAdmin;
