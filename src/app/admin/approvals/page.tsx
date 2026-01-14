import { AdminAvatarApprovals } from "@/components/admin/admin-approvals"

export default function ApprovalsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Aprovações Pendentes</h2>
                <p className="text-muted-foreground">Modere fotos de perfil e conteúdos enviados pelos membros.</p>
            </div>

            <AdminAvatarApprovals />
        </div>
    )
}
