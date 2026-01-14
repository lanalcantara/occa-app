'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Package, ShoppingCart, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

type Product = {
    id: string
    name: string
    description: string
    price_points: number
    image_url?: string
    stock: number
}

export function ShopGrid({ userPoints, userId }: { userPoints: number, userId: string }) {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [buyingId, setBuyingId] = useState<string | null>(null)
    const [currentPoints, setCurrentPoints] = useState(userPoints)
    const supabase = createClient()

    useEffect(() => {
        fetchProducts()
    }, [])

    async function fetchProducts() {
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .gt('stock', 0) // Only show available items? Or show sold out too? Let's show all active.
            .order('price_points', { ascending: true })

        if (data) setProducts(data)
        setLoading(false)
    }

    async function handlePurchase(product: Product) {
        if (currentPoints < product.price_points) return

        if (!confirm(`Deseja comprar "${product.name}" por ${product.price_points} XP?`)) return

        setBuyingId(product.id)

        // Call the RPC function we created
        const { data, error } = await supabase.rpc('purchase_product', {
            p_product_id: product.id,
            p_user_id: userId
        })

        setBuyingId(null)

        if (error) {
            alert('Erro ao processar compra: ' + error.message)
        } else {
            const result = data as { success: boolean, message: string }
            if (result.success) {
                alert(result.message)
                setCurrentPoints(prev => prev - product.price_points)
                fetchProducts() // Refresh stock
            } else {
                alert(result.message)
            }
        }
    }

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="glass-card p-6 border border-white/10 rounded-xl flex justify-between items-center bg-gradient-to-r from-primary/20 to-purple-500/20">
                <div>
                    <h2 className="text-xl font-bold">Seu Saldo</h2>
                    <p className="text-muted-foreground">Utilize seus pontos para resgatar recompensas exclusivas.</p>
                </div>
                <div className="text-3xl font-mono font-bold text-yellow-400 drop-shadow-lg">
                    {currentPoints.toLocaleString()} XP
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => {
                    const canAfford = currentPoints >= product.price_points
                    const hasStock = product.stock > 0

                    return (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "glass-card border border-white/10 rounded-xl overflow-hidden group flex flex-col h-full",
                                !hasStock && "opacity-60 grayscale"
                            )}
                        >
                            <div className="h-48 bg-black/40 relative overflow-hidden">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/20">
                                        <Package className="w-12 h-12" />
                                    </div>
                                )}

                                {!hasStock && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="bg-red-500 text-white px-3 py-1 rounded font-bold text-sm transform -rotate-12">
                                            ESGOTADO
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{product.description}</p>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                                    <span className="text-yellow-400 font-mono font-bold text-lg">
                                        {product.price_points} XP
                                    </span>

                                    <button
                                        onClick={() => handlePurchase(product)}
                                        disabled={!canAfford || !hasStock || buyingId === product.id}
                                        className={cn(
                                            "px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all",
                                            canAfford && hasStock
                                                ? "bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(var(--color-primary),0.3)]"
                                                : "bg-white/5 text-muted-foreground cursor-not-allowed"
                                        )}
                                    >
                                        {buyingId === product.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-4 h-4" />
                                                {hasStock ? (canAfford ? 'Resgatar' : 'Faltam Pontos') : 'Indisponível'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
