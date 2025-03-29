import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, User } from "lucide-react";
import { Input } from "@/components/ui/input";

const CommunityHeader = () => {
  return (
    <nav className="border-0 border-farm-brown-light/20 bg-transparent">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-farm-green" />
            <span className="text-xl font-bold text-farm-green">FarmHelp</span>
          </Link>
        </div> */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search questions..."
              className="w-full bg-background pl-8 rounded-md border-farm-brown-light/20"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
        <Button className="">Ask Question</Button>
          
        </div>
      </div>
    </nav>
  );
};

export default CommunityHeader;
