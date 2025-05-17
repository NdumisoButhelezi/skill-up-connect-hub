
import React from "react";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Badge } from "@/utils/badgeSystem";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BadgeDisplayProps {
  badges: Badge[];
}

const BadgeDisplay = ({ badges }: BadgeDisplayProps) => {
  if (!badges || badges.length === 0) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <TooltipProvider key={badge.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <UIBadge
                className="px-3 py-1 cursor-help"
                variant="secondary"
              >
                <span className="mr-1">{badge.icon}</span>
                {badge.name}
              </UIBadge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{badge.description}</p>
              <p className="text-xs text-gray-500">Requirement: {badge.requirement}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default BadgeDisplay;
