'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface ToolbarProps {
  onAddNode: () => void;
  onClearAll: () => void;
  nodeCount: number;
}

export default function Toolbar({ onAddNode, onClearAll, nodeCount }: ToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-gray-800">Flow Authoring Tool</h1>
        <span className="text-sm text-gray-500">({nodeCount} nodes)</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onAddNode}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Node
        </button>
        {nodeCount > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
