import { TaskBoard } from "@/components/kanban/task-board";

export default function TasksPage() {
    return (
        <div className="h-full">
            <TaskBoard canCreate={true} canMove={true} />
        </div>
    )
}
