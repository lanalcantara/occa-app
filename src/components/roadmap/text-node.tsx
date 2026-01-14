import { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';

type TextNodeData = {
    label?: string;
    text?: string;
    backgroundColor?: string;
    fontSize?: number;
};

export const TextNode = memo(({ data, selected }: NodeProps<any>) => {
    // Cast data safely
    const nodeData = data as unknown as TextNodeData;
    const text = nodeData.text || nodeData.label || 'Texto';
    const bg = nodeData.backgroundColor || 'transparent';
    const fontSize = nodeData.fontSize || 14;

    return (
        <div
            className="relative min-w-[100px] min-h-[50px] p-2 rounded border border-transparent hover:border-white/20 transition-colors"
            style={{ backgroundColor: bg }}
        >
            <NodeResizer minWidth={100} minHeight={50} isVisible={selected} lineStyle={{ border: '1px solid #7c3aed' }} handleStyle={{ width: 8, height: 8, borderRadius: '50%' }} />

            <Handle type="target" position={Position.Top} className="!bg-primary !w-2 !h-2" />
            <div
                className="w-full h-full text-foreground whitespace-pre-wrap break-words font-medium outline-none"
                style={{ fontSize: `${fontSize}px` }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                    // In a real app, we'd update the node data here via a hook or context
                    data.label = e.currentTarget.innerText;
                }}
            >
                {text}
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-primary !w-2 !h-2" />
        </div>
    );
});
