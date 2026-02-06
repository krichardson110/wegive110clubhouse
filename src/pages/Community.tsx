import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Award } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CreatePostForm from "@/components/community/CreatePostForm";
import PostsFeed from "@/components/community/PostsFeed";

const Community = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl text-foreground flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                Clubhouse
              </h1>
              <p className="text-muted-foreground">Share your journey with the team</p>
            </div>
          </div>
          <Link to="/profile">
            <Button variant="outline" size="sm">
              <Award className="w-4 h-4 mr-2" />
              My Profile
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Create post form */}
          {user && <CreatePostForm />}

          {/* Posts feed */}
          <PostsFeed />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Community;
