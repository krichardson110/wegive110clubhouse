import ResourceCard from "./ResourceCard";

const resources = [
  {
    title: "Workout Plans",
    description: "Customized training programs designed to improve your strength, speed, and agility on the field.",
    icon: "workouts" as const,
    count: 24,
  },
  {
    title: "Game Schedule",
    description: "Stay updated with upcoming games, practices, and team events. Never miss a beat.",
    icon: "schedule" as const,
    count: 12,
  },
  {
    title: "Training Videos",
    description: "Access our library of drill videos, technique breakdowns, and pro player analysis.",
    icon: "videos" as const,
    count: 48,
  },
  {
    title: "Zoom Calls",
    description: "Recorded team meetings, coaching sessions, and guest speaker presentations.",
    icon: "zoom" as const,
    count: 16,
  },
];

const ResourcesSection = () => {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl sm:text-5xl text-foreground mb-4 tracking-wide">
            YOUR <span className="gradient-text">RESOURCES</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything you need to excel on and off the field, all in one place.
          </p>
        </div>
        
        {/* Resource cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => (
            <div
              key={resource.title}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ResourceCard {...resource} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
