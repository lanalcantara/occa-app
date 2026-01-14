'use client'

import { RoadmapViewer } from "@/components/roadmap/roadmap-viewer"

export default function UserRoadmapPage() {
    return (
        <div className="h-[calc(100vh-40px)] w-full">
            {/* Using full height minus some padding if needed, or just h-full if layout allows */}
            <RoadmapViewer />
        </div>
    )
}
