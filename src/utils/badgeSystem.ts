
// Badge types and their requirements
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Using emoji for simplicity
  requirement: string;
}

export const BADGES = {
  STARTER: {
    id: 'starter',
    name: 'Starter Class',
    description: 'Registered and completed the first reflection',
    icon: '🥉',
    requirement: '1 completed reflection'
  },
  ACHIEVER: {
    id: 'achiever',
    name: 'Achiever Class',
    description: 'Accumulated 100+ points',
    icon: '🥈',
    requirement: '100+ points'
  },
  EXPERT: {
    id: 'expert',
    name: 'Expert Class',
    description: 'Completed 3+ workshop lessons',
    icon: '🥇',
    requirement: '3+ completed lessons'
  },
  RECRUITER_CREATOR: {
    id: 'recruiter_creator',
    name: 'Workshop Creator',
    description: 'Created 5 workshops',
    icon: '🏆',
    requirement: 'Created 5 workshops'
  }
};

// Function to calculate user badges based on their stats
export const calculateUserBadges = (
  totalPoints: number,
  completedReflections: number,
  completedWorkshops: number
): Badge[] => {
  const earnedBadges: Badge[] = [];
  
  // Check for Starter badge
  if (completedReflections >= 1) {
    earnedBadges.push(BADGES.STARTER);
  }
  
  // Check for Achiever badge
  if (totalPoints >= 100) {
    earnedBadges.push(BADGES.ACHIEVER);
  }
  
  // Check for Expert badge
  if (completedWorkshops >= 3) {
    earnedBadges.push(BADGES.EXPERT);
  }
  
  return earnedBadges;
};

// Function to calculate recruiter badges based on their stats
export const calculateRecruiterBadges = (createdWorkshops: number): Badge[] => {
  const earnedBadges: Badge[] = [];
  
  // Check for Workshop Creator badge
  if (createdWorkshops >= 5) {
    earnedBadges.push(BADGES.RECRUITER_CREATOR);
  }
  
  return earnedBadges;
};
