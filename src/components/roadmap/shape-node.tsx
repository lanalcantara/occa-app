import { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { cn } from '@/lib/utils';

type ShapeNodeData = {
    shapeType: 'rectangle' | 'circle' | 'diamond' | 'arrow';
    label?: string;
    color?: string;
    borderColor?: string;
};

export const ShapeNode = memo(({ data, selected }: NodeProps<any>) => {
    const nodeData = data as unknown as ShapeNodeData;
    const shape = nodeData.shapeType || 'rectangle';
    const color = nodeData.color || '#ffffff';
    const borderColor = nodeData.borderColor || 'transparent';
    const label = nodeData.label || '';

    // Shape Styles
    const getShapeStyles = () => {
        switch (shape) {
            case 'circle': return 'rounded-full';
            case 'diamond': return 'rotate-45';
            default: return 'rounded-lg';
        }
    };

    return (
        <div className="relative group min-w-[50px] min-h-[50px]">
            <NodeResizer
                minWidth={50}
                minHeight={50}
                isVisible={selected}
                lineStyle={{ border: '1px solid #7c3aed' }}
                handleStyle={{ width: 8, height: 8, borderRadius: '50%' }}
            />

            <Handle type="target" position={Position.Top} className="!bg-transparent !border-none !w-0 !h-0" />

            <div
                className={cn(
                    "w-full h-full flex items-center justify-center p-4 transition-all shadow-sm",
                    getShapeStyles()
                )}
                style={{
                    backgroundColor: color,
                    border: `2px solid ${borderColor}`
                }}
            >
                <span
                    className={cn(
                        "text-xs font-bold pointer-events-none text-center text-black/80",
                        shape === 'diamond' ? '-rotate-45' : ''
                    )}
                >
                    {label}
                </span>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none !w-0 !h-0" />
        </div>
    );
});
