'use client'

import { useState, useEffect } from 'react'
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    Connection,
    Edge,
    Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { MemberNode } from '@/components/roadmap/member-node';
import { ImageNode } from '@/components/roadmap/image-node';
import { TextNode } from '@/components/roadmap/text-node';
import { ShapeNode } from '@/components/roadmap/shape-node';

import { createClient } from '@/lib/supabase';

const nodeTypes: any = {
    member: MemberNode,
    image: ImageNode,
    text: TextNode,
    shape: ShapeNode
};

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

export function RoadmapViewer() {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        loadRoadmap();
    }, []);

    const loadRoadmap = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('roadmaps').select('*').limit(1).maybeSingle();

            if (error) throw error;

            if (data && data.data) {
                const flow = data.data;
                if (flow.nodes || flow.edges) {
                    setNodes(flow.nodes || []);
                    setEdges(flow.edges || []);
                }
            } else {
                setError("Nenhum roadmap encontrado. Peça ao admin para criar um!");
            }
        } catch (err: any) {
            console.error("Error loading roadmap:", err);
            setError("Erro ao carregar roadmap: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="w-full h-full flex items-center justify-center text-muted-foreground animate-pulse">Carregando Roadmap...</div>
    }

    if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <span className="text-red-400 font-bold">Ops!</span>
                <span>{error}</span>
                <button onClick={loadRoadmap} className="text-xs underline hover:text-white mt-2">Tentar novamente</button>
            </div>
        )
    }

    return (
        <div className="w-full h-full bg-background relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                defaultViewport={defaultViewport}
                fitView
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                className="bg-black/20"
            >
                <Background color="#ffffff" gap={16} size={1} variant={BackgroundVariant.Dots} className="opacity-10" />
                <Controls showInteractive={false} className="!bg-surface !border-white/10 !fill-white" />
                <MiniMap
                    className="!bg-surface !border-white/10"
                    nodeColor={(n) => {
                        if (n.type === 'member') return '#a855f7';
                        if (n.type === 'image') return '#22c55e';
                        if (n.type === 'shape') return '#ef4444';
                        return '#fff';
                    }}
                />
            </ReactFlow>
        </div>
    )
}
