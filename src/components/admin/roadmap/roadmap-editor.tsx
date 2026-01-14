'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
    ReactFlow,
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    BackgroundVariant,
    Connection,
    Edge,
    Node,
    Panel,
    MiniMap
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { MemberNode } from '@/components/roadmap/member-node';
import { ImageNode } from '@/components/roadmap/image-node';
import { createClient } from '@/lib/supabase';
import { Save, Plus, ImageIcon, User, AlertCircle, UserPlus, X, Box } from 'lucide-react';

const nodeTypes = {
    member: MemberNode,
    image: ImageNode
};

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

export function RoadmapEditor() {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Member Selection (Mock for now, will implement fetch)
    const [members, setMembers] = useState<any[]>([]);

    // Virtual Member State
    const [customMemberName, setCustomMemberName] = useState('');
    const [isCustomMemberOpen, setIsCustomMemberOpen] = useState(false);

    // Custom Object State (Name + Image)
    const [customObjectName, setCustomObjectName] = useState('');
    const [customObjectImage, setCustomObjectImage] = useState('');
    const [isCustomObjectOpen, setIsCustomObjectOpen] = useState(false);

    // Search Logic
    const [searchTerm, setSearchTerm] = useState('')
    const filteredMembers = members.filter(member =>
        member.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    useEffect(() => {
        // Load Roadmap Logic (Assuming single roadmap for now or ID passed via props)
        loadRoadmap();
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        const { data } = await supabase.from('profiles').select('id, full_name, avatar_url').neq('role', 'admin');
        if (data) setMembers(data);
    };

    const loadRoadmap = async () => {
        // For simplicity, we get the first roadmap or create one if none exist
        const { data } = await supabase.from('roadmaps').select('*').limit(1).single();
        if (data && data.data) {
            const flow = data.data;
            if (flow.nodes || flow.edges) {
                setNodes(flow.nodes || []);
                setEdges(flow.edges || []);
            }
        }
    };

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } }, eds)), [setEdges]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow/type');
            const label = event.dataTransfer.getData('application/reactflow/label');
            const dataStr = event.dataTransfer.getData('application/reactflow/data');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            let nodeData = { label };
            if (dataStr) {
                try {
                    nodeData = { ...nodeData, ...JSON.parse(dataStr) };
                } catch (e) { }
            }

            const newNode: Node = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: nodeData,
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    const onSave = useCallback(async () => {
        if (reactFlowInstance) {
            setIsSaving(true);
            const flow = reactFlowInstance.toObject();

            // Upsert Logic (Assuming ID 1 or creating new)
            // Ideally we check if we have a current Roadmap ID

            // Check if exists
            const { data: existing } = await supabase.from('roadmaps').select('id').limit(1).single();

            if (existing) {
                await supabase.from('roadmaps').update({
                    data: flow,
                    updated_at: new Date().toISOString()
                }).eq('id', existing.id);
            } else {
                await supabase.from('roadmaps').insert({
                    title: 'Main Roadmap',
                    data: flow
                });
            }

            setIsSaving(false);
            alert('Roadmap salvo com sucesso!');
        }
    }, [reactFlowInstance, supabase]);

    return (
        <div className="dndflow w-full h-[calc(100vh-100px)] flex bg-background border border-white/5 rounded-xl overflow-hidden">
            <ReactFlowProvider>
                {/* Sidebar */}
                <div className="w-64 bg-surface border-r border-white/5 p-4 flex flex-col gap-6 overflow-hidden">
                    <div>
                        <h3 className="font-bold mb-2 text-sm text-muted-foreground uppercase tracking-widest">Nós Básicos</h3>
                        <div
                            className="p-3 bg-white/5 border border-white/10 rounded-lg cursor-grab mb-2 flex items-center gap-2 hover:bg-white/10 transition-colors"
                            onDragStart={(event) => {
                                event.dataTransfer.setData('application/reactflow/type', 'default');
                                event.dataTransfer.setData('application/reactflow/label', 'Etapa Padrão');
                                event.dataTransfer.effectAllowed = 'move';
                            }}
                            draggable
                        >
                            <div className="w-3 h-3 bg-white rounded-full" />
                            <span className="text-sm font-medium">Etapa Padrão</span>
                        </div>
                    </div>

                    {/* Virtual Member Config */}
                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                <UserPlus className="w-3 h-3" /> Membro Virtual
                            </h4>
                            <button onClick={() => setIsCustomMemberOpen(!isCustomMemberOpen)} className="text-primary hover:text-white transition-colors">
                                {isCustomMemberOpen ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            </button>
                        </div>

                        {isCustomMemberOpen && (
                            <div className="space-y-2">
                                <input
                                    value={customMemberName}
                                    onChange={(e) => setCustomMemberName(e.target.value)}
                                    placeholder="Nome..."
                                    className="w-full text-xs p-2 bg-black/20 rounded border border-white/10 focus:border-primary/50 outline-none"
                                />
                                {customMemberName && (
                                    <div
                                        className="p-2 bg-primary/20 border border-primary/30 rounded cursor-grab flex items-center gap-2 hover:bg-primary/30 transition-colors"
                                        draggable
                                        onDragStart={(e) => {
                                            if (!customMemberName.trim()) return;
                                            e.dataTransfer.setData('application/reactflow/type', 'member');
                                            e.dataTransfer.setData('application/reactflow/label', customMemberName);
                                            e.dataTransfer.setData('application/reactflow/data', JSON.stringify({ avatar_url: null }));
                                            e.dataTransfer.effectAllowed = 'move';
                                        }}
                                    >
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                                            {customMemberName.charAt(0)}
                                        </div>
                                        <span className="text-xs font-medium truncate text-primary-foreground">{customMemberName}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Custom Object Config */}
                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                <Box className="w-3 h-3" /> Objeto Custom
                            </h4>
                            <button onClick={() => setIsCustomObjectOpen(!isCustomObjectOpen)} className="text-green-400 hover:text-white transition-colors">
                                {isCustomObjectOpen ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            </button>
                        </div>

                        {isCustomObjectOpen && (
                            <div className="space-y-2">
                                <input
                                    value={customObjectName}
                                    onChange={(e) => setCustomObjectName(e.target.value)}
                                    placeholder="Nome do Objeto..."
                                    className="w-full text-xs p-2 bg-black/20 rounded border border-white/10 focus:border-green-500/50 outline-none"
                                />
                                <input
                                    value={customObjectImage}
                                    onChange={(e) => setCustomObjectImage(e.target.value)}
                                    placeholder="URL da Imagem (opcional)..."
                                    className="w-full text-xs p-2 bg-black/20 rounded border border-white/10 focus:border-green-500/50 outline-none"
                                />
                                {customObjectName && (
                                    <div
                                        className="p-2 bg-green-500/10 border border-green-500/30 rounded cursor-grab flex items-center gap-2 hover:bg-green-500/20 transition-colors"
                                        draggable
                                        onDragStart={(e) => {
                                            if (!customObjectName.trim()) return;
                                            const type = customObjectImage ? 'image' : 'default'; // Use image type if url present, else default
                                            e.dataTransfer.setData('application/reactflow/type', type);
                                            e.dataTransfer.setData('application/reactflow/label', customObjectName);
                                            if (customObjectImage) {
                                                e.dataTransfer.setData('application/reactflow/data', JSON.stringify({ imageUrl: customObjectImage }));
                                            }
                                            e.dataTransfer.effectAllowed = 'move';
                                        }}
                                    >
                                        {customObjectImage ? (
                                            <ImageIcon className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <div className="w-3 h-3 bg-green-400 rounded-full" />
                                        )}
                                        <span className="text-xs font-medium truncate text-green-100">{customObjectName}</span>
                                    </div>
                                )}
                                <p className="text-[10px] text-muted-foreground">Arraste para criar.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-auto min-h-0 flex flex-col">
                        <h3 className="font-bold mb-2 text-sm text-muted-foreground uppercase tracking-widest sticky top-0 bg-surface z-10 py-2">Membros do Banco</h3>

                        {/* Member Search */}
                        <div className="mb-2 px-1">
                            <input
                                placeholder="Buscar membro..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full text-xs p-2 bg-black/20 rounded-lg border border-white/10 focus:border-primary/50 outline-none placeholder:text-muted-foreground/50"
                            />
                        </div>

                        <div className="overflow-y-auto flex-1 pr-1">
                            {filteredMembers.map(member => (
                                <div
                                    key={member.id}
                                    className="p-2 mb-2 bg-white/5 border border-white/10 rounded-full cursor-grab flex items-center gap-2 hover:bg-white/10 transition-colors"
                                    onDragStart={(event) => {
                                        event.dataTransfer.setData('application/reactflow/type', 'member');
                                        event.dataTransfer.setData('application/reactflow/label', member.full_name.split(' ')[0]);
                                        event.dataTransfer.setData('application/reactflow/data', JSON.stringify({ avatar_url: member.avatar_url }));
                                        event.dataTransfer.effectAllowed = 'move';
                                    }}
                                    draggable
                                >
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-white/10">
                                        {member.avatar_url ? (
                                            <img src={member.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[10px] font-bold text-primary">{member.full_name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <span className="text-xs font-medium truncate">{member.full_name}</span>
                                </div>
                            ))}
                            {filteredMembers.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-4">Nenhum membro encontrado.</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <button
                            onClick={onSave}
                            disabled={isSaving}
                            className="w-full bg-white hover:bg-white/90 text-black p-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg"
                        >
                            {isSaving ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Roadmap</>}
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        defaultViewport={defaultViewport}
                        fitView
                        className="bg-black/20"
                    >
                        <Background color="#ffffff" gap={16} size={1} variant={BackgroundVariant.Dots} className="opacity-10" />
                        <Controls className="!bg-surface !border-white/10 !fill-white" />
                        <MiniMap
                            className="!bg-surface !border-white/10"
                            nodeColor={(n) => {
                                if (n.type === 'member') return '#a855f7';
                                if (n.type === 'image') return '#22c55e';
                                return '#fff';
                            }}
                        />
                        <Panel position="top-right" className="bg-surface/50 backdrop-blur border border-white/10 p-2 rounded-lg text-xs text-muted-foreground flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            Arraste itens da sidebar para o quadro
                        </Panel>
                    </ReactFlow>
                </div>
            </ReactFlowProvider>
        </div>
    );
}
