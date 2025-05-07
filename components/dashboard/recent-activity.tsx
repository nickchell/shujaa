"use client"

import { Gift, CheckCircle, Users, Eye } from "lucide-react"

const activities = [
  {
    icon: Gift,
    name: "Reward Claimed",
    description: "You claimed 50MB data bundle",
    timestamp: "2 hours ago",
  },
  {
    icon: CheckCircle,
    name: "Task Completed",
    description: "Watched 3 ads",
    timestamp: "3 hours ago",
  },
  {
    icon: Users,
    name: "New Referral",
    description: "John Doe joined using your code",
    timestamp: "1 day ago",
  },
  {
    icon: Gift,
    name: "Reward Claimed",
    description: "You claimed 20MB data bundle",
    timestamp: "2 days ago",
  },
  {
    icon: Eye,
    name: "Level Up",
    description: "You reached Level 2!",
    timestamp: "3 days ago",
  },
]

export function DashboardRecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity, index) => (
        <div className="flex items-start" key={index}>
          <div className="mr-4 mt-0.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <activity.icon className="h-4 w-4 text-primary" />
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{activity.name}</p>
            <p className="text-sm text-muted-foreground">
              {activity.description}
            </p>
            <p className="text-xs text-muted-foreground/80">
              {activity.timestamp}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}