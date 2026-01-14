import { RoadmapEditor } from "@/components/admin/roadmap/roadmap-editor"

export default function AdminRoadmapPage() {
    return (
        <div className="space-y-6 h-[calc(100vh-100px)]">
            <div>
                <h1 className="text-2xl font-bold">Editor de Roadmap</h1>
                <p className="text-muted-foreground">Crie e organize o fluxo das tarefas.</p>
            </div>

            <RoadmapEditor />
        </div>
    )
}
