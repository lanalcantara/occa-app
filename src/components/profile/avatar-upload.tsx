'use client'

import { useState, useRef } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { createClient } from '@/lib/supabase'
import { Upload, X, Save, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export function AvatarUpload({ userId, currentAvatar }: { userId: string, currentAvatar?: string }) {
    const [imgSrc, setImgSrc] = useState('')
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadedPending, setUploadedPending] = useState(false)
    const imgRef = useRef<HTMLImageElement>(null)
    const supabase = createClient()

    function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined) // Reset crop
            const reader = new FileReader()
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''))
            reader.readAsDataURL(e.target.files[0])
        }
    }

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget
        setCrop(centerAspectCrop(width, height, 1)) // 1:1 Aspect Ratio for Avatars
    }

    async function handleUpload() {
        if (!imgRef.current || !completedCrop) return
        setIsUploading(true)

        try {
            // 1. Draw cropped image to canvas
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
                completedCrop.height
            )

            // 2. Convert to Blob
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(blob => {
                    if (blob) resolve(blob)
                    else reject(new Error('Canvas is empty'))
                }, 'image/jpeg', 0.9)
            })

            // 3. Upload to Supabase Storage
            const fileName = `${userId}-${Date.now()}.jpg`
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, blob)

            if (uploadError) throw uploadError

            // 4. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            // 5. Update Profile with PENDING avatar
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ pending_avatar_url: publicUrl })
                .eq('id', userId)

            if (updateError) throw updateError

            setUploadedPending(true)
            setImgSrc('') // Close cropper
            alert('Foto enviada para aprovação do Admin! 📸')

        } catch (error: any) {
            alert('Erro ao enviar foto: ' + error.message)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 p-6 bg-surface border border-white/5 rounded-2xl max-w-sm mx-auto">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white/10 overflow-hidden bg-black/40 flex items-center justify-center">
                    {currentAvatar ? (
                        <img src={currentAvatar} className="w-full h-full object-cover" />
                    ) : (
                        <Camera className="w-12 h-12 text-white/20" />
                    )}

                    {uploadedPending && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-xs font-bold text-yellow-400 text-center px-2">Em Análise ⏳</span>
                        </div>
                    )}
                </div>

                <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/80 transition-colors shadow-lg">
                    <Upload className="w-4 h-4" />
                    <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
                </label>
            </div>

            <div className="text-center">
                <h3 className="font-bold">Sua Foto de Perfil</h3>
                <p className="text-xs text-muted-foreground mt-1">A imagem passará por moderação antes de ficar pública.</p>
            </div>

            {/* CROP MODAL */}
            {imgSrc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
                    <div className="w-full max-w-lg bg-surface border border-white/10 rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900">
                            <h3 className="font-bold">Ajustar Foto</h3>
                            <button onClick={() => setImgSrc('')}><X className="w-5 h-5" /></button>
                        </div>

                        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={1}
                                circularCrop
                            >
                                <img
                                    ref={imgRef}
                                    alt="Crop me"
                                    src={imgSrc}
                                    onLoad={onImageLoad}
                                    className="max-h-[60vh] object-contain"
                                />
                            </ReactCrop>
                        </div>

                        <div className="p-4 border-t border-white/5 bg-zinc-900 flex justify-end gap-2">
                            <button
                                onClick={() => setImgSrc('')}
                                className="px-4 py-2 rounded text-sm font-medium hover:bg-white/5"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="px-4 py-2 bg-primary text-white rounded text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isUploading ? 'Enviando...' : <><Save className="w-4 h-4" /> Enviar</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
