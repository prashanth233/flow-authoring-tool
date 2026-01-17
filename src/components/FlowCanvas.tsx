'use client';

import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FlowNodeData } from '@/types/flow';
import { generateEdgeId } from '@/lib/utils';
import { Trash2, Edit2 } from 'lucide-react';

// Custom Node Component
const CustomNode = ({ data, id, selected }: Node<FlowNodeData>) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [label, setLabel] = React.useState(data.label);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    data.onUpdateLabel?.(id, newLabel);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setLabel(data.label);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-white ${
        selected ? 'border-blue-500' : 'border-gray-300'
      }`}
      style={{ minWidth: '150px' }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center justify-between gap-2">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => {
              handleLabelChange(label);
              setIsEditing(false);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <span className="flex-1 text-sm font-medium text-gray-800">{data.label}</span>
        )}
        
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Edit label"
          >
            <Edit2 className="w-3 h-3 text-gray-600" />
          </button>
          <button
            onClick={() => data.onDelete?.(id)}
            className="p-1 hover:bg-red-100 rounded transition-colors"
            title="Delete node"
          >
            <Trash2 className="w-3 h-3 text-red-600" />
          </button>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode as any,
};

interface FlowCanvasProps {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeUpdateLabel: (nodeId: string, label: string) => void;
}

export default function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeDelete,
  onNodeUpdateLabel,
}: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Enhance nodes with callback functions
  const enhancedNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onDelete: onNodeDelete,
      onUpdateLabel: onNodeUpdateLabel,
    },
  }));

  const handleConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        const newEdge = {
          ...params,
          id: generateEdgeId(),
        };
        onConnect(newEdge);
      }
    },
    [onConnect]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={enhancedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
