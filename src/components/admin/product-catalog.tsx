'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Plus, X, Package, DollarSign, Image as ImageIcon, Trash2, Upload, Loader2, Crop as CropIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

type Product = {
    id: string
    name: string
    description: string
    price_points: number
    price_money?: number
    image_url?: string
    stock: number
    is_active: boolean
}

// Helper to center crop
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop({
            unit: '%',
            width: 90,
        }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight,
    )
}

export function ProductCatalog() {
    const [products, setProducts] = useState<Product[]>([])
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price_points: 100,
        stock: 10,
        image_url: ''
    })

    // Crop States
    const [imgSrc, setImgSrc] = useState('')
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const imgRef = useRef<HTMLImageElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const supabase = createClient()

    useEffect(() => {
        fetchProducts()
    }, [])

    async function fetchProducts() {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
        if (data) setProducts(data)
    }

    async function handleCreateProduct() {
        const { error } = await supabase.from('products').insert({
            name: newProduct.name,
            description: newProduct.description,
            price_points: newProduct.price_points,
            stock: newProduct.stock,
            image_url: newProduct.image_url || null
        })

        if (!error) {
            setIsCreateOpen(false)
            setNewProduct({ name: '', description: '', price_points: 100, stock: 10, image_url: '' })
            fetchProducts()
        }
    }

    async function handleDeleteProduct(id: string) {
        if (confirm('Tem certeza que deseja remover este produto?')) {
            await supabase.from('products').delete().eq('id', id)
            fetchProducts()
        }
    }

    // 1. Select File -> Read as DataURL
    function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader()
            reader.addEventListener('load', () =>
                setImgSrc(reader.result?.toString() || ''))
            reader.readAsDataURL(e.target.files[0])
        }
    }

    // 2. Image Loaded -> Init Crop
    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget
        setCrop(centerAspectCrop(width, height, 16 / 9))
    }

    // 3. Perform Crop & Upload
    async function handleCropAndUpload() {
        if (!imgRef.current || !completedCrop) return

        setIsUploading(true)

        try {
            // Draw to Canvas
            const canvas = document.createElement('canvas')
            const scaleX = imgRef.current.naturalWidth / imgRef.current.width
            const scaleY = imgRef.current.naturalHeight / imgRef.current.height
            const ctx = canvas.getContext('2d')

            if (!ctx) throw new Error('No 2d context')

            canvas.width = completedCrop.width
            canvas.height = completedCrop.height

            ctx.drawImage(
                imgRef.current,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
                0,
                0,
                completedCrop.width,
                completedCrop.height,
            )

            // Convert to Blob
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(blob => {
                    if (blob) resolve(blob)
                    else reject(new Error('Canvas is empty'))
                }, 'image/jpeg', 0.9) // 90% quality JPEG
            })

            // Upload Blob
            const fileName = `${Math.random()}.jpg`
            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, blob)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName)

            setNewProduct(prev => ({ ...prev, image_url: publicUrl }))
            setImgSrc('') // Close cropper
        } catch (error: any) {
            alert('Erro ao cortar/upload: ' + error.message)
        } finally {
            setIsUploading(false)
        }
    }

    function handleCancelCrop() {
        setImgSrc('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Catálogo de Produtos</h2>
                    <p className="text-muted-foreground">Gerencie o que os membros podem comprar com pontos.</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Novo Produto
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product.id} className="glass-card border border-white/10 rounded-xl overflow-hidden group">
                        <div className="h-40 bg-black/40 relative">
                            {product.image_url ? (
                                <img src={product.image_url} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                    <Package className="w-12 h-12" />
                                </div>
                            )}
                            <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold truncate" title={product.name}>{product.name}</h3>
                                <span className="text-yellow-400 font-mono font-bold text-sm bg-yellow-400/10 px-2 py-0.5 rounded">
                                    {product.price_points} XP
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8">{product.description}</p>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-white/5 pt-3">
                                <span className={cn("inline-block w-2 h-2 rounded-full", product.stock > 0 ? "bg-green-500" : "bg-red-500")} />
                                {product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}
                            </div>
                        </div>
                    </div>
                ))}
                {products.length === 0 && (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl text-muted-foreground">
                        <Package className="w-12 h-12 mb-4 opacity-20" />
                        <p>Nenhum produto cadastrado.</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg bg-surface border border-white/10 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900">
                                <h3 className="font-bold">Novo Produto</h3>
                                <button onClick={() => setIsCreateOpen(false)}><X className="w-5 h-5" /></button>
                            </div>

                            {/* Crop UI Overlay */}
                            {imgSrc ? (
                                <div className="p-6 bg-zinc-900 flex flex-col items-center">
                                    <h4 className="text-sm font-bold mb-4">Ajuste a imagem</h4>
                                    <div className="max-h-[300px] overflow-hidden rounded-lg border border-white/20 mb-4">
                                        <ReactCrop
                                            crop={crop}
                                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                                            onComplete={(c) => setCompletedCrop(c)}
                                            aspect={16 / 9}
                                        >
                                            <img ref={imgRef} alt="Upload" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '300px' }} />
                                        </ReactCrop>
                                    </div>
                                    <div className="flex gap-2 w-full">
                                        <button
                                            onClick={handleCancelCrop}
                                            className="flex-1 py-2 bg-white/5 rounded hover:bg-white/10 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleCropAndUpload}
                                            disabled={isUploading}
                                            className="flex-1 py-2 bg-primary text-white rounded font-bold hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CropIcon className="w-4 h-4" />}
                                            Recortar e Usar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 space-y-4 bg-zinc-900/50">
                                    <div>
                                        <label className="text-sm text-muted-foreground block mb-1">Nome do Produto</label>
                                        <input
                                            className="w-full p-2 rounded bg-black/20 border border-white/10"
                                            value={newProduct.name}
                                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                            placeholder="Ex: Camiseta OCCA"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-muted-foreground block mb-1">Imagem</label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={onSelectFile}
                                            />

                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-20 h-20 rounded-lg bg-black/20 border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-colors overflow-hidden relative group"
                                            >
                                                {isUploading ? (
                                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                ) : newProduct.image_url ? (
                                                    <>
                                                        <img src={newProduct.image_url} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ImageIcon className="w-6 h-6 text-white" />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <Upload className="w-6 h-6 text-muted-foreground" />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <p className="text-xs text-muted-foreground mb-2">Clique na caixa para selecionar e recortar.</p>
                                                <div className="relative">
                                                    <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        className="w-full pl-9 p-2 rounded bg-black/20 border border-white/10 text-sm"
                                                        value={newProduct.image_url}
                                                        onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })}
                                                        placeholder="URL da imagem (opcional)"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-muted-foreground block mb-1">Descrição</label>
                                        <textarea
                                            className="w-full p-2 rounded bg-black/20 border border-white/10 h-20 resize-none"
                                            value={newProduct.description}
                                            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-muted-foreground block mb-1">Preço (Pontos)</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="number"
                                                    className="w-full pl-9 p-2 rounded bg-black/20 border border-white/10"
                                                    value={newProduct.price_points}
                                                    onChange={e => setNewProduct({ ...newProduct, price_points: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-muted-foreground block mb-1">Estoque</label>
                                            <input
                                                type="number"
                                                className="w-full p-2 rounded bg-black/20 border border-white/10"
                                                value={newProduct.stock}
                                                onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCreateProduct}
                                        className="w-full py-3 bg-primary text-white rounded font-bold hover:opacity-90 mt-4"
                                    >
                                        Cadastrar Produto
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
