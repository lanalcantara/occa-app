'use client'

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export const ImageNode = memo(({ data, isConnectable }: NodeProps) => {
    const imageUrl = data.imageUrl as string;
    const label = data.label as string;

    return (
        <div className="relative">
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="!bg-purple-500 !w-2 !h-2"
            />

            <div className="flex flex-col items-center gap-1 group">
                <div className="bg-transparent hover:scale-105 transition-transform cursor-grab active:cursor-grabbing">
                    <img
                        src={imageUrl}
                        alt={label}
                        className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    />
                </div>
                {label && (
                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-black/40 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {label}
                    </span>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="!bg-purple-500 !w-2 !h-2"
            />
        </div>
    );
});

ImageNode.displayName = 'ImageNode';
