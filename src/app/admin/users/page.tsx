import { UserBoard } from "@/components/admin/user-board"
import { AdminAvatarApprovals } from "@/components/admin/admin-approvals"
import { AdminPartnerApprovals } from "@/components/admin/partner-approvals"
import { AdminUserManagement } from "@/components/admin/admin-user-management"

export default function UsersPage() {
    return (
        <div className="space-y-12">

            {/* PARTNER APPROVALS */}
            <AdminPartnerApprovals />

            {/* AVATAR APPROVALS SECTION */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        Solicitações de Avatar
                    </h2>
                    <p className="text-muted-foreground">Aprove ou rejeite atualizações de perfil dos membros.</p>
                </div>
                <AdminAvatarApprovals />
            </section>

            <div className="w-full h-px bg-white/10" />

            {/* USER MANAGEMENT TABLE */}
            <section className="space-y-4">
                <AdminUserManagement />
            </section>

            <div className="w-full h-px bg-white/10" />

            {/* MEMBERS SECTION */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold">Quadro de Membros (Categorias)</h2>
                    <p className="text-muted-foreground">Arraste os cards para mudar a categoria dos membros.</p>
                </div>
                <div className="h-[calc(100vh-300px)]">
                    <UserBoard />
                </div>
            </section>
        </div>
    )
}
