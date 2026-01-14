'use client'

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export const MemberNode = memo(({ data, isConnectable }: NodeProps) => {
    const avatarUrl = data.avatar_url as string;
    const label = data.label as string;

    return (
        <div className="relative group">
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="!bg-primary !w-3 !h-3"
            />

            <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-4 border-primary overflow-hidden bg-background shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:scale-110 transition-transform cursor-grab active:cursor-grabbing">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={label} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-bold text-xl">
                            {label?.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="mt-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-white shadow-lg">
                    {label}
                </div>
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="!bg-primary !w-3 !h-3"
            />
        </div>
    );
});

MemberNode.displayName = 'MemberNode';
